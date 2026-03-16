from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, random, string, smtplib, asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime, timedelta, timezone
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jose import jwt, JWTError
from concurrent.futures import ThreadPoolExecutor

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
DB_NAME = os.environ.get('DB_NAME', 'welldhan_db')
JWT_SECRET = os.environ.get('JWT_SECRET', 'welldhan-secret-key')
GMAIL_USER = os.environ.get('GMAIL_USER', '')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRE_DAYS = 30

client = AsyncIOMotorClient(mongo_url)
db = client[DB_NAME]

app = FastAPI(title="WELLDHAN API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

UTC = timezone.utc

# ─── Utils ────────────────────────────────────────────────────────────────────

def new_id() -> str:
    return str(uuid.uuid4())

def gen_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

def create_token(sub: str, role: str) -> str:
    payload = {
        'sub': sub, 'role': role,
        'iat': datetime.now(UTC),
        'exp': datetime.now(UTC) + timedelta(days=JWT_EXPIRE_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Missing or invalid token')
    try:
        return decode_token(authorization.split(' ')[1])
    except JWTError:
        raise HTTPException(401, 'Invalid token')

async def send_otp_email(to_email: str, otp: str) -> bool:
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        logger.info(f"[DEV MODE] OTP for {to_email}: {otp}")
        return False  # dev mode

    msg = MIMEMultipart()
    msg['From'] = GMAIL_USER
    msg['To'] = to_email
    msg['Subject'] = 'WELLDHAN — Your Login OTP'
    body = (f"Your WELLDHAN login OTP is: {otp}. "
            f"Expires in 10 minutes. — WELLDHAN Team, Lansum Elegante")
    msg.attach(MIMEText(body, 'plain'))

    def _send():
        with smtplib.SMTP('smtp.gmail.com', 587) as s:
            s.ehlo(); s.starttls(); s.ehlo()
            s.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            s.send_message(msg)

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(ThreadPoolExecutor(max_workers=1), _send)
    return True

def strip_id(doc: dict) -> dict:
    doc.pop('_id', None)
    return doc

# ─── Models ───────────────────────────────────────────────────────────────────

class SendOTPReq(BaseModel):
    phone: str

class VerifyOTPReq(BaseModel):
    phone: str
    otp: str

class BookingCreate(BaseModel):
    slot_id: str
    member_ids: List[str]
    session_date: str

class MemberCreate(BaseModel):
    member_name: str
    age: int
    relation: str
    assigned_sport: str
    phone: Optional[str] = None

class MemberUpdate(BaseModel):
    assigned_sport: Optional[str] = None
    member_name: Optional[str] = None
    age: Optional[int] = None

class AttendanceUpdate(BaseModel):
    booking_id: str
    status: str  # Attended or NoShow

class FCMTokenRegister(BaseModel):
    fcm_token: str

class PauseDeliveryReq(BaseModel):
    pause_until: str  # ISO date string

# ─── Auth Routes ──────────────────────────────────────────────────────────────

@api_router.post('/auth/send-otp')
async def send_otp(req: SendOTPReq):
    phone = req.phone.strip().replace('+91', '').replace(' ', '').replace('-', '')

    user_type = None; user_id = None; email = None; name = None

    trainer = await db.trainers.find_one({'phone': phone})
    if trainer:
        user_type = 'Trainer'; user_id = trainer['id']
        email = trainer.get('email'); name = trainer.get('name')

    if not user_type:
        community = await db.communities.find_one({'manager_phone': phone})
        if community:
            user_type = 'Manager'; user_id = community['id']
            email = community.get('manager_email'); name = community.get('manager_name')

    if not user_type:
        admin = await db.admin_users.find_one({'phone': phone})
        if admin:
            user_type = 'Admin'; user_id = admin['id']
            email = admin.get('email'); name = admin.get('name')

    if not user_type:
        household = await db.households.find_one({'primary_phone': phone})
        if household:
            user_type = 'User'; user_id = household['id']
            email = household.get('primary_email'); name = household.get('primary_name')

    if not user_type:
        raise HTTPException(404, 'Phone number not registered with WELLDHAN')
    if not email:
        raise HTTPException(400, 'No email address registered for this account')

    otp = gen_otp()
    await db.otp_sessions.delete_many({'phone': phone})
    await db.otp_sessions.insert_one({
        'id': new_id(), 'phone': phone, 'otp': otp, 'email': email,
        'user_type': user_type, 'user_id': user_id,
        'expires_at': datetime.now(UTC) + timedelta(minutes=10),
        'used': False
    })

    is_real_email = await send_otp_email(email, otp)
    masked = email[:3] + '***@' + email.split('@')[1] if '@' in email else '***'

    resp = {'success': True, 'email_sent': is_real_email, 'masked_email': masked, 'user_type': user_type}
    if not GMAIL_USER:
        resp['otp_dev'] = otp  # expose OTP in dev mode
    return resp

@api_router.post('/auth/verify-otp')
async def verify_otp(req: VerifyOTPReq):
    phone = req.phone.strip().replace('+91', '').replace(' ', '').replace('-', '')
    session = await db.otp_sessions.find_one({'phone': phone, 'used': False})
    if not session:
        raise HTTPException(400, 'No active OTP session. Please request a new OTP.')
    if datetime.now(UTC) > session['expires_at'].replace(tzinfo=UTC):
        raise HTTPException(400, 'OTP has expired. Please request a new one.')
    if session['otp'] != req.otp.strip():
        raise HTTPException(400, 'Invalid OTP. Please try again.')

    await db.otp_sessions.update_one({'_id': session['_id']}, {'$set': {'used': True}})

    role = session['user_type']
    user_id = session['user_id']
    token = create_token(user_id, role)

    user_data = None
    if role == 'User':
        hh = await db.households.find_one({'id': user_id})
        if hh:
            pkg = await db.packages.find_one({'id': hh.get('package_id', '')})
            comm = await db.communities.find_one({'id': hh.get('community_id', '')})
            hh['package'] = strip_id(pkg) if pkg else None
            hh['community'] = strip_id(comm) if comm else None
            user_data = strip_id(hh)
    elif role == 'Trainer':
        t = await db.trainers.find_one({'id': user_id})
        if t: user_data = strip_id(t)
    elif role == 'Manager':
        c = await db.communities.find_one({'id': user_id})
        if c: user_data = strip_id(c)
    elif role == 'Admin':
        a = await db.admin_users.find_one({'id': user_id})
        if a: user_data = strip_id(a)

    return {'token': token, 'role': role, 'user_id': user_id, 'user_data': user_data}

@api_router.get('/auth/me')
async def get_me(current_user: dict = Depends(get_current_user)):
    role = current_user['role']
    user_id = current_user['sub']
    if role == 'User':
        hh = await db.households.find_one({'id': user_id})
        if hh:
            pkg = await db.packages.find_one({'id': hh.get('package_id', '')})
            comm = await db.communities.find_one({'id': hh.get('community_id', '')})
            hh['package'] = strip_id(pkg) if pkg else None
            hh['community'] = strip_id(comm) if comm else None
            return strip_id(hh)
    elif role == 'Trainer':
        t = await db.trainers.find_one({'id': user_id})
        if t: return strip_id(t)
    elif role == 'Manager':
        c = await db.communities.find_one({'id': user_id})
        if c: return strip_id(c)
    elif role == 'Admin':
        a = await db.admin_users.find_one({'id': user_id})
        if a: return strip_id(a)
    raise HTTPException(404, 'User not found')

# ─── Household Routes ─────────────────────────────────────────────────────────

@api_router.get('/households/{household_id}')
async def get_household(household_id: str, current_user: dict = Depends(get_current_user)):
    hh = await db.households.find_one({'id': household_id})
    if not hh: raise HTTPException(404, 'Household not found')
    pkg = await db.packages.find_one({'id': hh.get('package_id', '')})
    comm = await db.communities.find_one({'id': hh.get('community_id', '')})
    hh['package'] = strip_id(pkg) if pkg else None
    hh['community'] = strip_id(comm) if comm else None
    return strip_id(hh)

@api_router.post('/notifications/register-token')
async def register_fcm_token(req: FCMTokenRegister, current_user: dict = Depends(get_current_user)):
    household_id = current_user['sub']
    await db.households.update_one({'id': household_id}, {'$set': {'fcm_token': req.fcm_token}})
    return {'success': True}

# ─── Slots Routes ─────────────────────────────────────────────────────────────

@api_router.get('/slots')
async def get_slots(sport: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query: Dict[str, Any] = {'is_available': True}
    if sport and sport != 'All':
        query['sport'] = sport
    slots = await db.slots.find(query).to_list(100)
    result = []
    for s in slots:
        trainer = await db.trainers.find_one({'id': s.get('trainer_id', '')})
        s['trainer'] = strip_id(trainer) if trainer else None
        s['spots_left'] = s.get('max_capacity', 0) - s.get('current_booked', 0)
        result.append(strip_id(s))
    return result

@api_router.get('/slots/{slot_id}')
async def get_slot(slot_id: str, current_user: dict = Depends(get_current_user)):
    s = await db.slots.find_one({'id': slot_id})
    if not s: raise HTTPException(404, 'Slot not found')
    trainer = await db.trainers.find_one({'id': s.get('trainer_id', '')})
    s['trainer'] = strip_id(trainer) if trainer else None
    s['spots_left'] = s.get('max_capacity', 0) - s.get('current_booked', 0)
    return strip_id(s)

# ─── Bookings Routes ──────────────────────────────────────────────────────────

@api_router.post('/bookings')
async def create_booking(req: BookingCreate, current_user: dict = Depends(get_current_user)):
    household_id = current_user['sub']
    slot = await db.slots.find_one({'id': req.slot_id})
    if not slot: raise HTTPException(404, 'Slot not found')
    if not slot.get('is_available'): raise HTTPException(400, 'Slot is no longer available')

    created = []
    for member_id in req.member_ids:
        booking = {
            'id': new_id(), 'household_id': household_id,
            'member_id': member_id, 'slot_id': req.slot_id,
            'trainer_id': slot['trainer_id'],
            'session_date': req.session_date,
            'status': 'Confirmed',
            'booked_on': datetime.now(UTC).isoformat(),
            'notes': ''
        }
        await db.bookings.insert_one(booking)
        created.append(booking['id'])

    new_booked = slot.get('current_booked', 0) + len(req.member_ids)
    await db.slots.update_one({'id': req.slot_id}, {'$set': {
        'current_booked': new_booked,
        'is_available': new_booked < slot.get('max_capacity', 10)
    }})
    return {'success': True, 'booking_ids': created}

@api_router.get('/bookings')
async def get_bookings(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    role = current_user['role']
    user_id = current_user['sub']
    query: Dict[str, Any] = {}
    if role == 'User':
        query['household_id'] = user_id
    elif role == 'Trainer':
        query['trainer_id'] = user_id
    if status:
        query['status'] = status

    bookings = await db.bookings.find(query).sort('session_date', -1).to_list(200)
    result = []
    for b in bookings:
        slot = await db.slots.find_one({'id': b.get('slot_id', '')})
        trainer = await db.trainers.find_one({'id': b.get('trainer_id', '')})
        member = await db.members.find_one({'id': b.get('member_id', '')})
        b['slot'] = strip_id(slot) if slot else None
        b['trainer'] = strip_id(trainer) if trainer else None
        b['member'] = strip_id(member) if member else None
        result.append(strip_id(b))
    return result

@api_router.patch('/bookings/{booking_id}/cancel')
async def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    b = await db.bookings.find_one({'id': booking_id})
    if not b: raise HTTPException(404, 'Booking not found')
    await db.bookings.update_one({'id': booking_id}, {'$set': {'status': 'Cancelled'}})
    await db.slots.update_one({'id': b['slot_id']}, {'$inc': {'current_booked': -1}, '$set': {'is_available': True}})
    return {'success': True}

@api_router.patch('/bookings/{booking_id}/attendance')
async def update_attendance(booking_id: str, req: AttendanceUpdate, current_user: dict = Depends(get_current_user)):
    await db.bookings.update_one({'id': booking_id}, {'$set': {'status': req.status}})
    return {'success': True}

# ─── Food Routes ──────────────────────────────────────────────────────────────

@api_router.get('/food/preferences')
async def get_food_prefs(current_user: dict = Depends(get_current_user)):
    household_id = current_user['sub']
    prefs = await db.member_food_preferences.find({'household_id': household_id}).to_list(100)
    result = []
    for p in prefs:
        item = await db.food_inventory.find_one({'id': p.get('food_item_id', '')})
        p['food_item'] = strip_id(item) if item else None
        result.append(strip_id(p))
    return result

@api_router.patch('/food/preferences/{pref_id}/toggle')
async def toggle_food_pref(pref_id: str, current_user: dict = Depends(get_current_user)):
    pref = await db.member_food_preferences.find_one({'id': pref_id})
    if not pref: raise HTTPException(404, 'Preference not found')
    new_val = not pref.get('is_selected', True)
    await db.member_food_preferences.update_one({'id': pref_id}, {
        '$set': {'is_selected': new_val, 'updated_at': datetime.now(UTC).isoformat()}
    })
    return {'is_selected': new_val}

@api_router.post('/food/preferences/pause')
async def pause_deliveries(req: PauseDeliveryReq, current_user: dict = Depends(get_current_user)):
    household_id = current_user['sub']
    await db.member_food_preferences.update_many(
        {'household_id': household_id},
        {'$set': {'pause_until': req.pause_until, 'updated_at': datetime.now(UTC).isoformat()}}
    )
    return {'success': True}

@api_router.get('/food/orders')
async def get_food_orders(current_user: dict = Depends(get_current_user)):
    household_id = current_user['sub']
    orders = await db.food_orders.find({'household_id': household_id}).sort('delivery_date', -1).to_list(200)
    result = []
    for o in orders:
        item = await db.food_inventory.find_one({'id': o.get('food_item_id', '')})
        o['food_item'] = strip_id(item) if item else None
        result.append(strip_id(o))
    return result

@api_router.get('/food/inventory')
async def get_food_inventory(category: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query: Dict[str, Any] = {}
    if category and category != 'All':
        query['category'] = category
    items = await db.food_inventory.find(query).to_list(100)
    return [strip_id(i) for i in items]

# ─── Members Routes ───────────────────────────────────────────────────────────

@api_router.get('/members')
async def get_members(current_user: dict = Depends(get_current_user)):
    household_id = current_user['sub']
    members = await db.members.find({'household_id': household_id, 'is_active': True}).to_list(20)
    return [strip_id(m) for m in members]

@api_router.post('/members')
async def add_member(req: MemberCreate, current_user: dict = Depends(get_current_user)):
    household_id = current_user['sub']
    member = {
        'id': new_id(), 'household_id': household_id,
        'member_name': req.member_name, 'age': req.age,
        'relation': req.relation, 'is_primary': False,
        'assigned_sport': req.assigned_sport,
        'is_active': True, 'phone': req.phone or ''
    }
    await db.members.insert_one(member)
    await db.households.update_one({'id': household_id}, {'$inc': {'total_members': 1}})
    return strip_id(member)

@api_router.patch('/members/{member_id}')
async def update_member(member_id: str, req: MemberUpdate, current_user: dict = Depends(get_current_user)):
    update = {k: v for k, v in req.dict().items() if v is not None}
    await db.members.update_one({'id': member_id}, {'$set': update})
    return {'success': True}

# ─── Payments Routes ──────────────────────────────────────────────────────────

@api_router.get('/payments')
async def get_payments(current_user: dict = Depends(get_current_user)):
    household_id = current_user['sub']
    payments = await db.payments.find({'household_id': household_id}).sort('due_date', -1).to_list(24)
    result = []
    for p in payments:
        pkg = await db.packages.find_one({'id': p.get('package_id', '')})
        p['package'] = strip_id(pkg) if pkg else None
        result.append(strip_id(p))
    return result

# ─── Trainer Routes ───────────────────────────────────────────────────────────

@api_router.get('/trainer/profile')
async def get_trainer_profile(current_user: dict = Depends(get_current_user)):
    trainer_id = current_user['sub']
    t = await db.trainers.find_one({'id': trainer_id})
    if not t: raise HTTPException(404, 'Trainer not found')
    return strip_id(t)

@api_router.get('/trainer/slots')
async def get_trainer_slots(current_user: dict = Depends(get_current_user)):
    trainer_id = current_user['sub']
    slots = await db.slots.find({'trainer_id': trainer_id}).to_list(20)
    return [strip_id(s) for s in slots]

@api_router.get('/trainer/students')
async def get_trainer_students(current_user: dict = Depends(get_current_user)):
    t = await db.trainers.find_one({'id': current_user['sub']})
    if not t: raise HTTPException(404, 'Trainer not found')
    sport = t.get('sport', '')
    members = await db.members.find({'assigned_sport': sport, 'is_active': True}).to_list(200)
    result = []
    for m in members:
        hh = await db.households.find_one({'id': m.get('household_id', '')})
        m['household'] = strip_id(hh) if hh else None
        result.append(strip_id(m))
    return result

@api_router.get('/trainer/today-bookings')
async def get_trainer_today_bookings(current_user: dict = Depends(get_current_user)):
    trainer_id = current_user['sub']
    today = datetime.now(UTC).strftime('%Y-%m-%d')
    bookings = await db.bookings.find({'trainer_id': trainer_id, 'session_date': today}).to_list(50)
    result = []
    for b in bookings:
        member = await db.members.find_one({'id': b.get('member_id', '')})
        slot = await db.slots.find_one({'id': b.get('slot_id', '')})
        hh = await db.households.find_one({'id': b.get('household_id', '')})
        b['member'] = strip_id(member) if member else None
        b['slot'] = strip_id(slot) if slot else None
        b['household'] = strip_id(hh) if hh else None
        result.append(strip_id(b))
    return result

# ─── Manager Routes ───────────────────────────────────────────────────────────

@api_router.get('/manager/summary')
async def manager_summary(current_user: dict = Depends(get_current_user)):
    community_id = current_user['sub']
    total = await db.households.count_documents({'community_id': community_id})
    active = await db.households.count_documents({'community_id': community_id, 'is_active': True})
    today = datetime.now(UTC).strftime('%Y-%m-%d')
    todays_bookings = await db.bookings.count_documents({'session_date': today})
    pending_payments = await db.payments.count_documents({'is_paid': False, 'is_overdue': True})
    pipeline = [
        {'$match': {'is_paid': False}},
        {'$group': {'_id': None, 'total': {'$sum': '$amount_due'}}}
    ]
    pending_amt_res = await db.payments.aggregate(pipeline).to_list(1)
    pending_amount = pending_amt_res[0]['total'] if pending_amt_res else 0
    low_stock = await db.food_inventory.count_documents({'$expr': {'$lte': ['$stock_quantity', '$reorder_level']}})
    return {
        'total_families': total, 'active_families': active,
        'todays_bookings': todays_bookings,
        'pending_payments': pending_payments,
        'pending_amount': pending_amount,
        'low_stock_items': low_stock
    }

@api_router.get('/manager/households')
async def manager_households(search: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    community_id = current_user['sub']
    query: Dict[str, Any] = {'community_id': community_id}
    if search:
        query['$or'] = [
            {'primary_name': {'$regex': search, '$options': 'i'}},
            {'flat_number': {'$regex': search, '$options': 'i'}}
        ]
    households = await db.households.find(query).to_list(300)
    result = []
    for hh in households:
        pkg = await db.packages.find_one({'id': hh.get('package_id', '')})
        hh['package'] = strip_id(pkg) if pkg else None
        result.append(strip_id(hh))
    return result

@api_router.get('/manager/pending-payments')
async def manager_pending_payments(current_user: dict = Depends(get_current_user)):
    payments = await db.payments.find({'is_paid': False}).sort('due_date', 1).to_list(300)
    result = []
    for p in payments:
        hh = await db.households.find_one({'id': p.get('household_id', '')})
        p['household'] = strip_id(hh) if hh else None
        result.append(strip_id(p))
    return result

@api_router.get('/manager/inventory')
async def manager_inventory(current_user: dict = Depends(get_current_user)):
    items = await db.food_inventory.find({}).to_list(100)
    return [strip_id(i) for i in items]

# ─── Admin Routes ─────────────────────────────────────────────────────────────

@api_router.get('/admin/summary')
async def admin_summary(current_user: dict = Depends(get_current_user)):
    communities = await db.communities.count_documents({})
    total_families = await db.households.count_documents({})
    active_trainers = await db.trainers.count_documents({'is_active': True})
    total_bookings = await db.bookings.count_documents({})
    attended = await db.bookings.count_documents({'status': 'Attended'})
    revenue_pipeline = [
        {'$match': {'is_paid': True}},
        {'$group': {'_id': None, 'total': {'$sum': '$amount_paid'}}}
    ]
    rev_res = await db.payments.aggregate(revenue_pipeline).to_list(1)
    total_revenue = rev_res[0]['total'] if rev_res else 0
    pending_rev_pipe = [
        {'$match': {'is_paid': False}},
        {'$group': {'_id': None, 'total': {'$sum': '$amount_due'}}}
    ]
    pend_res = await db.payments.aggregate(pending_rev_pipe).to_list(1)
    pending_revenue = pend_res[0]['total'] if pend_res else 0
    return {
        'communities': communities, 'total_families': total_families,
        'active_trainers': active_trainers, 'total_bookings': total_bookings,
        'attended_sessions': attended, 'total_revenue': total_revenue,
        'pending_revenue': pending_revenue
    }

@api_router.get('/admin/communities')
async def admin_communities(current_user: dict = Depends(get_current_user)):
    items = await db.communities.find({}).to_list(50)
    return [strip_id(i) for i in items]

@api_router.get('/admin/trainers')
async def admin_trainers(current_user: dict = Depends(get_current_user)):
    items = await db.trainers.find({}).to_list(100)
    return [strip_id(i) for i in items]

@api_router.get('/admin/packages')
async def admin_packages(current_user: dict = Depends(get_current_user)):
    items = await db.packages.find({}).to_list(50)
    return [strip_id(i) for i in items]

# ─── Streak Route ─────────────────────────────────────────────────────────────

@api_router.get('/streak')
async def get_streak(current_user: dict = Depends(get_current_user)):
    household_id = current_user['sub']
    bookings = await db.bookings.find(
        {'household_id': household_id, 'status': 'Attended'}
    ).sort('session_date', -1).to_list(90)
    dates = sorted(set(b['session_date'] for b in bookings), reverse=True)
    streak = 0
    check_date = datetime.now(UTC).date()
    for d in dates:
        try:
            booking_date = datetime.strptime(d, '%Y-%m-%d').date()
            if booking_date == check_date or booking_date == check_date - timedelta(days=1):
                streak += 1
                check_date = booking_date - timedelta(days=1)
            else:
                break
        except Exception:
            continue
    return {'streak': streak}

# ─── Seed Data ────────────────────────────────────────────────────────────────

@api_router.post('/seed')
async def seed_data():
    # Check if already seeded
    count = await db.communities.count_documents({})
    if count > 0:
        return {'message': 'Data already seeded', 'seeded': False}

    comm_ids = [new_id(), new_id(), new_id()]
    pkg_ids = {
        'sport_basic': new_id(), 'sport_family': new_id(),
        'food_basic': new_id(), 'food_family': new_id(),
        'combo_individual': new_id(), 'combo_family': new_id(),
        'combo_premium': new_id(), 'sport_premium': new_id()
    }
    trainer_ids = {
        'suresh': new_id(), 'ananya': new_id(),
        'raju': new_id(), 'priya_t': new_id()
    }
    slot_ids = [new_id() for _ in range(10)]
    food_ids = {
        'tomatoes': new_id(), 'spinach': new_id(), 'broccoli': new_id(),
        'coconut_oil': new_id(), 'sunflower_oil': new_id(),
        'rice': new_id(), 'dal': new_id(), 'milk': new_id(),
        'coriander': new_id(), 'ginger': new_id(),
        'carrots': new_id(), 'beans': new_id()
    }
    hh_ids = [new_id() for _ in range(10)]

    # Communities
    await db.communities.insert_many([
        {'id': comm_ids[0], 'name': 'Lansum Elegante', 'location': 'Gachibowli, Hyderabad',
         'total_flats': 200, 'active_families': 145, 'manager_name': 'Venkat Rao',
         'manager_phone': '9000000002', 'manager_email': 'manager@welldhan.com', 'is_active': True},
        {'id': comm_ids[1], 'name': 'My Home Avatar', 'location': 'Kondapur, Hyderabad',
         'total_flats': 180, 'active_families': 120, 'manager_name': 'Srinivas Reddy',
         'manager_phone': '9000000003', 'manager_email': 'srinivas@welldhan.com', 'is_active': True},
        {'id': comm_ids[2], 'name': 'Aparna Serene Park', 'location': 'Nallagandla, Hyderabad',
         'total_flats': 250, 'active_families': 178, 'manager_name': 'Ramesh Kumar',
         'manager_phone': '9000000004', 'manager_email': 'ramesh@welldhan.com', 'is_active': True},
    ])

    # Packages
    await db.packages.insert_many([
        {'id': pkg_ids['sport_basic'], 'name': 'Sport Basic', 'type': 'Sport',
         'members_allowed': 1, 'sports_included': ['Badminton'], 'food_included': False,
         'vegetables_kg_per_day': 0, 'oils_included': False, 'monthly_price': 2500,
         'is_active': True, 'description': 'Individual badminton sessions'},
        {'id': pkg_ids['sport_family'], 'name': 'Sport Family', 'type': 'Sport',
         'members_allowed': 4, 'sports_included': ['Badminton', 'Karate'], 'food_included': False,
         'vegetables_kg_per_day': 0, 'oils_included': False, 'monthly_price': 6000,
         'is_active': True, 'description': 'Family sports training package'},
        {'id': pkg_ids['food_basic'], 'name': 'Food Basic', 'type': 'Food',
         'members_allowed': 1, 'sports_included': [], 'food_included': True,
         'vegetables_kg_per_day': 0.5, 'oils_included': False, 'monthly_price': 3500,
         'is_active': True, 'description': 'Daily organic vegetables delivery'},
        {'id': pkg_ids['food_family'], 'name': 'Food Family', 'type': 'Food',
         'members_allowed': 4, 'sports_included': [], 'food_included': True,
         'vegetables_kg_per_day': 2, 'oils_included': True, 'monthly_price': 8000,
         'is_active': True, 'description': 'Family organic food package with oils'},
        {'id': pkg_ids['combo_individual'], 'name': 'Combo Individual', 'type': 'Combo',
         'members_allowed': 1, 'sports_included': ['Yoga'], 'food_included': True,
         'vegetables_kg_per_day': 0.5, 'oils_included': False, 'monthly_price': 5500,
         'is_active': True, 'description': 'Yoga + organic food for one person'},
        {'id': pkg_ids['combo_family'], 'name': 'Combo Family', 'type': 'Combo',
         'members_allowed': 4, 'sports_included': ['Badminton', 'Yoga', 'Karate'], 'food_included': True,
         'vegetables_kg_per_day': 2, 'oils_included': True, 'monthly_price': 14000,
         'is_active': True, 'description': 'Complete family wellness package'},
        {'id': pkg_ids['combo_premium'], 'name': 'Combo Premium', 'type': 'Combo',
         'members_allowed': 6, 'sports_included': ['Badminton', 'Yoga', 'Karate', 'Swimming'],
         'food_included': True, 'vegetables_kg_per_day': 3, 'oils_included': True,
         'monthly_price': 20000, 'is_active': True, 'description': 'All sports + premium organic food'},
        {'id': pkg_ids['sport_premium'], 'name': 'Sport Premium', 'type': 'Sport',
         'members_allowed': 2, 'sports_included': ['Swimming', 'Yoga'], 'food_included': False,
         'vegetables_kg_per_day': 0, 'oils_included': False, 'monthly_price': 5000,
         'is_active': True, 'description': 'Swimming + Yoga for couples'},
    ])

    # Trainers
    await db.trainers.insert_many([
        {'id': trainer_ids['suresh'], 'name': 'Suresh Babu', 'phone': '9100000001',
         'email': 'suresh@welldhan.com', 'sport': 'Badminton',
         'certification': 'BWF Level 2', 'experience_years': 8,
         'rating': 4.8, 'salary': 35000, 'is_active': True,
         'community_id': comm_ids[0],
         'image_url': 'https://i.pravatar.cc/150?img=11'},
        {'id': trainer_ids['ananya'], 'name': 'Ananya Reddy', 'phone': '9100000002',
         'email': 'ananya@welldhan.com', 'sport': 'Yoga',
         'certification': 'RYT 500', 'experience_years': 6,
         'rating': 4.9, 'salary': 32000, 'is_active': True,
         'community_id': comm_ids[0],
         'image_url': 'https://i.pravatar.cc/150?img=47'},
        {'id': trainer_ids['raju'], 'name': 'Raju Naik', 'phone': '9100000003',
         'email': 'raju@welldhan.com', 'sport': 'Karate',
         'certification': 'JKA 3rd Dan', 'experience_years': 12,
         'rating': 4.7, 'salary': 38000, 'is_active': True,
         'community_id': comm_ids[0],
         'image_url': 'https://i.pravatar.cc/150?img=13'},
        {'id': trainer_ids['priya_t'], 'name': 'Priya Iyer', 'phone': '9100000004',
         'email': 'priya.t@welldhan.com', 'sport': 'Swimming',
         'certification': 'RLSS Lifeguard', 'experience_years': 5,
         'rating': 4.6, 'salary': 30000, 'is_active': True,
         'community_id': comm_ids[0],
         'image_url': 'https://i.pravatar.cc/150?img=49'},
    ])

    # Slots
    slots_data = [
        {'id': slot_ids[0], 'sport': 'Badminton', 'trainer_id': trainer_ids['suresh'],
         'slot_time': '6:00 AM', 'slot_days': ['Mon', 'Wed', 'Fri'],
         'max_capacity': 8, 'current_booked': 3, 'spots_left': 5,
         'is_available': True, 'location': 'Court A, Block 1', 'community_id': comm_ids[0]},
        {'id': slot_ids[1], 'sport': 'Badminton', 'trainer_id': trainer_ids['suresh'],
         'slot_time': '7:00 AM', 'slot_days': ['Tue', 'Thu', 'Sat'],
         'max_capacity': 8, 'current_booked': 7, 'spots_left': 1,
         'is_available': True, 'location': 'Court B, Block 2', 'community_id': comm_ids[0]},
        {'id': slot_ids[2], 'sport': 'Yoga', 'trainer_id': trainer_ids['ananya'],
         'slot_time': '6:30 AM', 'slot_days': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
         'max_capacity': 12, 'current_booked': 5, 'spots_left': 7,
         'is_available': True, 'location': 'Terrace Garden, Block A', 'community_id': comm_ids[0]},
        {'id': slot_ids[3], 'sport': 'Yoga', 'trainer_id': trainer_ids['ananya'],
         'slot_time': '7:30 AM', 'slot_days': ['Mon', 'Wed', 'Fri'],
         'max_capacity': 10, 'current_booked': 10, 'spots_left': 0,
         'is_available': False, 'location': 'Clubhouse Hall', 'community_id': comm_ids[0]},
        {'id': slot_ids[4], 'sport': 'Karate', 'trainer_id': trainer_ids['raju'],
         'slot_time': '5:30 AM', 'slot_days': ['Tue', 'Thu', 'Sat'],
         'max_capacity': 15, 'current_booked': 8, 'spots_left': 7,
         'is_available': True, 'location': 'Open Ground, Block C', 'community_id': comm_ids[0]},
        {'id': slot_ids[5], 'sport': 'Karate', 'trainer_id': trainer_ids['raju'],
         'slot_time': '4:30 PM', 'slot_days': ['Mon', 'Wed', 'Fri'],
         'max_capacity': 15, 'current_booked': 6, 'spots_left': 9,
         'is_available': True, 'location': 'Multi-purpose Hall', 'community_id': comm_ids[0]},
        {'id': slot_ids[6], 'sport': 'Swimming', 'trainer_id': trainer_ids['priya_t'],
         'slot_time': '6:00 AM', 'slot_days': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
         'max_capacity': 10, 'current_booked': 4, 'spots_left': 6,
         'is_available': True, 'location': 'Swimming Pool, Block D', 'community_id': comm_ids[0]},
        {'id': slot_ids[7], 'sport': 'Swimming', 'trainer_id': trainer_ids['priya_t'],
         'slot_time': '5:00 PM', 'slot_days': ['Tue', 'Thu', 'Sat'],
         'max_capacity': 10, 'current_booked': 2, 'spots_left': 8,
         'is_available': True, 'location': 'Swimming Pool, Block D', 'community_id': comm_ids[0]},
        {'id': slot_ids[8], 'sport': 'Badminton', 'trainer_id': trainer_ids['suresh'],
         'slot_time': '5:30 PM', 'slot_days': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
         'max_capacity': 8, 'current_booked': 2, 'spots_left': 6,
         'is_available': True, 'location': 'Court A, Block 1', 'community_id': comm_ids[0]},
        {'id': slot_ids[9], 'sport': 'Yoga', 'trainer_id': trainer_ids['ananya'],
         'slot_time': '6:00 PM', 'slot_days': ['Tue', 'Thu', 'Sat'],
         'max_capacity': 12, 'current_booked': 3, 'spots_left': 9,
         'is_available': True, 'location': 'Terrace Garden, Block A', 'community_id': comm_ids[0]},
    ]
    await db.slots.insert_many(slots_data)

    # Food Inventory
    food_items = [
        {'id': food_ids['tomatoes'], 'name': 'Tomatoes', 'category': 'Vegetable', 'unit': 'kg',
         'price_per_unit': 40, 'stock_quantity': 50, 'reorder_level': 10,
         'is_organic': True, 'is_available': True, 'supplier_name': 'Rythu Bazaar',
         'image_url': 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=200&q=80'},
        {'id': food_ids['spinach'], 'name': 'Palak (Spinach)', 'category': 'Vegetable', 'unit': 'bunch',
         'price_per_unit': 20, 'stock_quantity': 30, 'reorder_level': 8,
         'is_organic': True, 'is_available': True, 'supplier_name': 'Rythu Bazaar',
         'image_url': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80'},
        {'id': food_ids['broccoli'], 'name': 'Broccoli', 'category': 'Vegetable', 'unit': 'kg',
         'price_per_unit': 80, 'stock_quantity': 15, 'reorder_level': 5,
         'is_organic': True, 'is_available': True, 'supplier_name': 'Organic Farm Hyderabad',
         'image_url': 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=200&q=80'},
        {'id': food_ids['carrots'], 'name': 'Carrots', 'category': 'Vegetable', 'unit': 'kg',
         'price_per_unit': 35, 'stock_quantity': 40, 'reorder_level': 10,
         'is_organic': True, 'is_available': True, 'supplier_name': 'Rythu Bazaar',
         'image_url': 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=200&q=80'},
        {'id': food_ids['beans'], 'name': 'French Beans', 'category': 'Vegetable', 'unit': 'kg',
         'price_per_unit': 60, 'stock_quantity': 20, 'reorder_level': 5,
         'is_organic': True, 'is_available': True, 'supplier_name': 'Organic Farm Hyderabad',
         'image_url': 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=200&q=80'},
        {'id': food_ids['coconut_oil'], 'name': 'Coconut Oil', 'category': 'Oil', 'unit': 'L',
         'price_per_unit': 220, 'stock_quantity': 25, 'reorder_level': 5,
         'is_organic': True, 'is_available': True, 'supplier_name': 'KLF Coconad',
         'image_url': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80'},
        {'id': food_ids['sunflower_oil'], 'name': 'Sunflower Oil', 'category': 'Oil', 'unit': 'L',
         'price_per_unit': 180, 'stock_quantity': 30, 'reorder_level': 6,
         'is_organic': False, 'is_available': True, 'supplier_name': 'Fortune Foods',
         'image_url': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80'},
        {'id': food_ids['rice'], 'name': 'Sona Masuri Rice', 'category': 'Grain', 'unit': 'kg',
         'price_per_unit': 65, 'stock_quantity': 200, 'reorder_level': 40,
         'is_organic': False, 'is_available': True, 'supplier_name': 'Andhra Rice Mills',
         'image_url': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=200&q=80'},
        {'id': food_ids['dal'], 'name': 'Toor Dal', 'category': 'Grain', 'unit': 'kg',
         'price_per_unit': 120, 'stock_quantity': 80, 'reorder_level': 20,
         'is_organic': False, 'is_available': True, 'supplier_name': 'IDHAYAM',
         'image_url': 'https://images.unsplash.com/photo-1585996764442-09b9e77cf9d9?w=200&q=80'},
        {'id': food_ids['milk'], 'name': 'Fresh Milk', 'category': 'Dairy', 'unit': 'L',
         'price_per_unit': 60, 'stock_quantity': 100, 'reorder_level': 25,
         'is_organic': False, 'is_available': True, 'supplier_name': 'Vijaya Dairy',
         'image_url': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80'},
        {'id': food_ids['coriander'], 'name': 'Coriander', 'category': 'Spice', 'unit': 'bunch',
         'price_per_unit': 10, 'stock_quantity': 3, 'reorder_level': 5,
         'is_organic': True, 'is_available': True, 'supplier_name': 'Rythu Bazaar',
         'image_url': 'https://images.unsplash.com/photo-1604514628550-37477afdf4e3?w=200&q=80'},
        {'id': food_ids['ginger'], 'name': 'Ginger', 'category': 'Spice', 'unit': 'kg',
         'price_per_unit': 150, 'stock_quantity': 8, 'reorder_level': 3,
         'is_organic': True, 'is_available': True, 'supplier_name': 'Organic Farm Hyderabad',
         'image_url': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=200&q=80'},
    ]
    await db.food_inventory.insert_many(food_items)

    # Households
    household_names = [
        ('Ravi Shankar', 'ravi@example.com', '9876543210', 'A-101', pkg_ids['combo_family']),
        ('Priya Reddy', 'priya@example.com', '9876543211', 'A-102', pkg_ids['sport_family']),
        ('Anil Kumar', 'anil@example.com', '9876543212', 'B-201', pkg_ids['combo_premium']),
        ('Sunitha Rao', 'sunitha@example.com', '9876543213', 'B-202', pkg_ids['food_family']),
        ('Venkat Naidu', 'venkat@example.com', '9876543214', 'C-301', pkg_ids['combo_individual']),
        ('Lakshmi Devi', 'lakshmi@example.com', '9876543215', 'C-302', pkg_ids['sport_basic']),
        ('Suresh Goud', 'sgoud@example.com', '9876543216', 'D-401', pkg_ids['combo_family']),
        ('Kavitha Sharma', 'kavitha@example.com', '9876543217', 'D-402', pkg_ids['food_basic']),
        ('Rajesh Pillai', 'rajesh@example.com', '9876543218', 'E-501', pkg_ids['sport_premium']),
        ('Deepa Varma', 'deepa@example.com', '9876543219', 'E-502', pkg_ids['combo_premium']),
    ]

    for i, (name, email, phone, flat, pkg_id) in enumerate(household_names):
        hh_id = hh_ids[i]
        hh = {
            'id': hh_id, 'community_id': comm_ids[0],
            'flat_number': flat, 'primary_name': name,
            'primary_phone': phone, 'primary_email': email,
            'package_id': pkg_id, 'plan_type': 'Family' if i % 3 != 2 else 'Individual',
            'total_members': 4 if i % 3 != 2 else 1,
            'is_active': True,
            'food_plan_active': pkg_id in [pkg_ids['food_basic'], pkg_ids['food_family'],
                                           pkg_ids['combo_individual'], pkg_ids['combo_family'],
                                           pkg_ids['combo_premium']],
            'join_date': '2024-01-15', 'fcm_token': ''
        }
        await db.households.insert_one(hh)

        sports = ['Badminton', 'Yoga', 'Karate', 'Swimming']
        primary_sport = sports[i % 4]

        # Primary member
        await db.members.insert_one({
            'id': new_id(), 'household_id': hh_id, 'member_name': name,
            'age': 35 + i, 'relation': 'Self', 'is_primary': True,
            'assigned_sport': primary_sport, 'is_active': True, 'phone': phone
        })
        # Spouse
        await db.members.insert_one({
            'id': new_id(), 'household_id': hh_id,
            'member_name': f'{name.split()[0]} Spouse', 'age': 33 + i,
            'relation': 'Spouse', 'is_primary': False,
            'assigned_sport': sports[(i + 1) % 4], 'is_active': True, 'phone': ''
        })
        # Child
        await db.members.insert_one({
            'id': new_id(), 'household_id': hh_id,
            'member_name': f'{name.split()[0]} Jr.', 'age': 10 + i,
            'relation': 'Child', 'is_primary': False,
            'assigned_sport': 'Karate', 'is_active': True, 'phone': ''
        })

        # Food preferences
        if hh['food_plan_active']:
            for fi_key, fi_id in food_ids.items():
                await db.member_food_preferences.insert_one({
                    'id': new_id(), 'household_id': hh_id, 'member_id': None,
                    'food_item_id': fi_id,
                    'is_selected': True if fi_key in ['tomatoes', 'spinach', 'rice', 'milk'] else (i % 2 == 0),
                    'default_quantity': 1, 'unit': 'kg' if fi_key not in ['milk', 'coconut_oil', 'sunflower_oil'] else 'L',
                    'pause_until': None, 'updated_at': datetime.now(UTC).isoformat()
                })

        # Payments for last 3 months
        months = [
            ('March 2025', '2025-03-01', '2025-03-01', True),
            ('February 2025', '2025-02-01', '2025-02-01', True),
            ('April 2025', '2025-04-01', None, i % 3 != 0),
        ]
        pkg = next(p for p in await db.packages.find({'id': pkg_id}).to_list(1))
        for month_year, due_date, pay_date, is_paid in months:
            await db.payments.insert_one({
                'id': new_id(), 'household_id': hh_id, 'package_id': pkg_id,
                'amount_due': pkg['monthly_price'],
                'amount_paid': pkg['monthly_price'] if is_paid else 0,
                'payment_date': pay_date, 'due_date': due_date,
                'month_year': month_year, 'is_paid': is_paid,
                'payment_method': 'GPay UPI' if is_paid else None,
                'upi_transaction_id': f'TXN{new_id()[:8].upper()}' if is_paid else None,
                'payer_upi_id': 'user@okicici' if is_paid else None,
                'is_overdue': not is_paid and due_date < datetime.now(UTC).strftime('%Y-%m-%d')
            })

    # Bookings
    statuses = ['Confirmed', 'Attended', 'Attended', 'NoShow', 'Attended', 'Attended',
                'Cancelled', 'Attended', 'Confirmed', 'Attended']
    today = datetime.now(UTC).strftime('%Y-%m-%d')
    yesterday = (datetime.now(UTC) - timedelta(days=1)).strftime('%Y-%m-%d')
    for i in range(min(10, len(hh_ids))):
        members = await db.members.find({'household_id': hh_ids[i], 'is_primary': True}).to_list(1)
        if members:
            await db.bookings.insert_one({
                'id': new_id(), 'household_id': hh_ids[i],
                'member_id': members[0]['id'], 'slot_id': slot_ids[i % len(slot_ids)],
                'trainer_id': list(trainer_ids.values())[i % 4],
                'session_date': today if i % 2 == 0 else yesterday,
                'status': statuses[i], 'booked_on': yesterday, 'notes': ''
            })

    # Food orders for first 3 households
    tomorrow = (datetime.now(UTC) + timedelta(days=1)).strftime('%Y-%m-%d')
    for i in range(3):
        hh_id = hh_ids[i]
        for fi_key in ['tomatoes', 'spinach', 'milk']:
            fi_id = food_ids[fi_key]
            await db.food_orders.insert_one({
                'id': new_id(), 'household_id': hh_id, 'food_item_id': fi_id,
                'quantity': 1, 'order_date': today,
                'delivery_date': tomorrow, 'delivery_time': '07:00',
                'delivery_status': 'Scheduled', 'payment_status': 'Included'
            })

    # Admin user
    await db.admin_users.insert_one({
        'id': new_id(), 'name': 'WELLDHAN Admin', 'phone': '9000000001',
        'email': 'admin@welldhan.com'
    })

    return {
        'message': 'WELLDHAN seed data created successfully!',
        'seeded': True,
        'test_credentials': {
            'admin': {'phone': '9000000001', 'email': 'admin@welldhan.com'},
            'manager': {'phone': '9000000002', 'email': 'manager@welldhan.com'},
            'trainer_suresh': {'phone': '9100000001', 'email': 'suresh@welldhan.com'},
            'user_ravi': {'phone': '9876543210', 'email': 'ravi@example.com'},
        }
    }

# ─── App setup ────────────────────────────────────────────────────────────────

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware, allow_credentials=True,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

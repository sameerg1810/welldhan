# WELLDHAN App — Product Requirements Document

## App Overview
WELLDHAN is a wellness training and organic food platform for gated communities in Hyderabad, India. Built for Lansum Elegante, Gachibowli with 200+ families.

**App ID**: com.welldhan.app  
**Tagline**: "Your community's wellness + organic food platform"  
**Status**: MVP Complete  
**Last Updated**: March 2026

---

## Architecture

### Tech Stack
- **Frontend**: React Native + Expo SDK 54, Expo Router (file-based routing)
- **Backend**: FastAPI + Python (port 8001)
- **Database**: MongoDB (Motor async driver)
- **State**: Zustand
- **API Client**: React Query (@tanstack/react-query)
- **Auth**: Email OTP via Gmail SMTP (with dev mode fallback)
- **Payments**: GPay UPI deep link (welldhan@okicici)
- **WhatsApp**: Free deep links (wa.me)
- **Notifications**: FCM placeholder (ready for Firebase setup)

### Backend API Routes (all prefixed /api)
- POST /auth/send-otp — send OTP to email by phone lookup
- POST /auth/verify-otp — verify OTP, return JWT + user data
- GET /auth/me — get current user
- GET /households/{id} — household details with package + community
- GET /slots — available slots (with sport filter)
- GET /slots/{id} — slot detail with trainer
- POST /bookings — create booking
- GET /bookings — get household/trainer bookings
- PATCH /bookings/{id}/cancel — cancel booking
- PATCH /bookings/{id}/attendance — mark attendance (trainer)
- GET /food/preferences — food basket preferences
- PATCH /food/preferences/{id}/toggle — toggle food item
- POST /food/preferences/pause — pause all deliveries
- GET /food/orders — food order history
- GET /food/inventory — all food items
- GET /members — household members
- POST /members — add member
- PATCH /members/{id} — update member
- GET /payments — household payments
- GET /streak — attendance streak count
- GET /trainer/profile — trainer's own profile
- GET /trainer/slots — trainer's assigned slots
- GET /trainer/students — students assigned to trainer's sport
- GET /trainer/today-bookings — today's bookings for trainer
- GET /manager/summary — manager dashboard stats
- GET /manager/households — all households (with search)
- GET /manager/pending-payments — unpaid payments
- GET /manager/inventory — food inventory list
- GET /admin/summary — admin statistics overview
- GET /admin/communities — all communities
- POST /seed — seed demo data

---

## User Personas

1. **Ravi Shankar (User)** — Flat A-101, Combo Family package, 3 members
2. **Suresh Babu (Trainer)** — Badminton trainer, 8 years experience
3. **Venkat Rao (Manager)** — Manages Lansum Elegante
4. **WELLDHAN Admin** — System administrator

---

## Core Requirements (Static)

### Authentication
- Phone number → lookup → email OTP
- 4 roles: User, Trainer, Manager, Admin
- JWT token (30 days), stored in AsyncStorage
- Dev mode: OTP returned in API response

### User Role (8 screens)
- Home Dashboard with greeting, streak, session, food, quick actions
- Slot Booking with sport filters, trainer info, member selection
- My Bookings with status tabs, cancel option
- Food Basket with toggle switches, pause delivery, category filters
- Food History grouped by delivery date
- Family Members with add/edit sport
- Payments with UPI deep link, WhatsApp share
- Profile with package card, logout

### Trainer Role (4 screens)
- Home with today's stats, assigned slots
- Attendance with mark present/absent buttons
- Students list by sport
- Profile with trainer details and rating

### Manager Role (4 screens)
- Dashboard with 6 KPI stats
- Residents with search
- Pending Payments with overdue highlighting
- Inventory with low stock alerts

### Admin Role (1 screen)
- Dashboard with cross-community stats
- Seed data action
- Test credentials display

---

## 13 MongoDB Collections
1. communities
2. packages
3. households
4. members
5. trainers
6. slots
7. bookings
8. food_inventory
9. member_food_preferences
10. food_orders
11. payments
12. otp_sessions
13. admin_users

---

## What's Been Implemented

### March 2026 — MVP
- Complete 4-role RBAC system
- 30+ backend API endpoints
- Email OTP authentication (Gmail SMTP)
- Splash screen with WELLDHAN branding
- All User screens (8 screens)
- All Trainer screens (4 screens)
- All Manager screens (4 screens)
- Admin dashboard (1 screen)
- Seed data with 10 households, Telugu names, 4 trainers, 10 slots, 12 food items
- Food basket toggle switches (real-time DB update)
- Booking flow with member selection
- Attendance marking for trainers
- GPay UPI deep link for payments
- WhatsApp deep links (3 types - free, no API)
- FCM notification placeholder (ready for Firebase setup)
- Streak counter calculation
- Dev mode OTP (returned in API response)

---

## Prioritized Backlog

### P0 (Critical - MVP gaps)
- None (all core features implemented)

### P1 (High Priority - Next Sprint)
- [ ] Firebase FCM actual integration (need Firebase credentials from user)
- [ ] Gmail SMTP real integration (need GMAIL_USER + GMAIL_APP_PASSWORD)
- [ ] Trainer "Chat with Student" WhatsApp button
- [ ] Real-time slot availability (WebSocket)
- [ ] Push notification for booking confirmation

### P2 (Nice to Have)
- [ ] Admin user management (add/edit residents)
- [ ] Manager: Add new slot functionality
- [ ] Food order auto-generation from preferences
- [ ] Payment proof upload (UPI screenshot)
- [ ] Community announcements / notice board
- [ ] Member photo upload
- [ ] Bulk food preference reset

---

## Test Credentials

| Role | Phone | Email |
|------|-------|-------|
| Admin | 9000000001 | admin@welldhan.com |
| Manager | 9000000002 | manager@welldhan.com |
| Trainer | 9100000001 | suresh@welldhan.com |
| User | 9876543210 | ravi@example.com |

> Dev Mode: OTP shown directly on screen (set GMAIL_USER in .env for real email)

## Environment Setup Required

```env
# backend/.env
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
JWT_SECRET=random-secret-key
```

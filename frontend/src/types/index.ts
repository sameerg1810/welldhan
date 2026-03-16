export type Role = 'User' | 'Trainer' | 'Manager' | 'Admin';

export interface AuthState {
  token: string;
  role: Role;
  userId: string;
  userData: Household | Trainer | Community | AdminUser | null;
}

export interface Community {
  id: string;
  name: string;
  location: string;
  total_flats: number;
  active_families: number;
  manager_name: string;
  manager_phone: string;
  manager_email?: string;
  is_active: boolean;
}

export interface Package {
  id: string;
  name: string;
  type: 'Sport' | 'Food' | 'Combo';
  members_allowed: number;
  sports_included: string[];
  food_included: boolean;
  vegetables_kg_per_day: number;
  oils_included: boolean;
  monthly_price: number;
  is_active: boolean;
  description: string;
}

export interface Household {
  id: string;
  community_id: string;
  flat_number: string;
  primary_name: string;
  primary_phone: string;
  primary_email: string;
  package_id: string;
  plan_type: 'Family' | 'Individual';
  total_members: number;
  is_active: boolean;
  food_plan_active: boolean;
  join_date: string;
  package?: Package;
  community?: Community;
}

export interface Member {
  id: string;
  household_id: string;
  member_name: string;
  age: number;
  relation: 'Self' | 'Spouse' | 'Child' | 'Parent';
  is_primary: boolean;
  assigned_sport: string;
  is_active: boolean;
  phone?: string;
}

export interface Trainer {
  id: string;
  name: string;
  phone: string;
  email: string;
  sport: string;
  certification: string;
  experience_years: number;
  rating: number;
  salary: number;
  is_active: boolean;
  community_id: string;
  image_url: string;
}

export interface Slot {
  id: string;
  sport: string;
  trainer_id: string;
  slot_time: string;
  slot_days: string[];
  max_capacity: number;
  current_booked: number;
  spots_left: number;
  is_available: boolean;
  location: string;
  community_id: string;
  trainer?: Trainer;
}

export interface Booking {
  id: string;
  household_id: string;
  member_id: string;
  slot_id: string;
  trainer_id: string;
  session_date: string;
  status: 'Confirmed' | 'Attended' | 'NoShow' | 'Cancelled';
  booked_on: string;
  notes?: string;
  slot?: Slot;
  trainer?: Trainer;
  member?: Member;
}

export interface FoodInventory {
  id: string;
  name: string;
  category: 'Vegetable' | 'Oil' | 'Grain' | 'Dairy' | 'Spice';
  unit: string;
  price_per_unit: number;
  stock_quantity: number;
  reorder_level: number;
  is_organic: boolean;
  is_available: boolean;
  supplier_name: string;
  image_url: string;
}

export interface FoodPreference {
  id: string;
  household_id: string;
  member_id?: string;
  food_item_id: string;
  is_selected: boolean;
  default_quantity: number;
  unit: string;
  pause_until?: string;
  updated_at: string;
  food_item?: FoodInventory;
}

export interface FoodOrder {
  id: string;
  household_id: string;
  food_item_id: string;
  quantity: number;
  order_date: string;
  delivery_date: string;
  delivery_time: string;
  delivery_status: 'Scheduled' | 'Delivered' | 'Missed' | 'Skipped';
  payment_status: 'Included' | 'Paid' | 'Pending';
  food_item?: FoodInventory;
}

export interface Payment {
  id: string;
  household_id: string;
  package_id: string;
  amount_due: number;
  amount_paid: number;
  payment_date?: string;
  due_date: string;
  month_year: string;
  is_paid: boolean;
  payment_method?: string;
  upi_transaction_id?: string;
  payer_upi_id?: string;
  is_overdue: boolean;
  package?: Package;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface ManagerSummary {
  total_families: number;
  active_families: number;
  todays_bookings: number;
  pending_payments: number;
  pending_amount: number;
  low_stock_items: number;
}

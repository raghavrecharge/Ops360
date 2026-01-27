export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  start_location?: Location;
  end_location?: Location;
  start_photo?: string;
  end_photo?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  date: string;
  description?: string;
  photo: string;
  location: Location;
  activity_type?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  date: string;
  category: string;
  amount: number;
  description?: string;
  receipt_image?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface DashboardStats {
  day_status: 'not_started' | 'in_progress' | 'completed';
  start_time?: string;
  end_time?: string;
  last_location?: Location;
  total_expenses: number;
  expenses_count: number;
  activities_count: number;
  last_activity?: {
    description?: string;
    activity_type?: string;
    created_at: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  phone?: string;
  password: string;
  role: string;
}

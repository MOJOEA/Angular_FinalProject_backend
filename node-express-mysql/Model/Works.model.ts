export interface PlanningOrder {
  order_id: number;
  customer_id: number;
  order_date: string;
  quantity: number;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  distanceFromDepot: number;
  bearing: number;
  direction: string;
}

export interface SampleWork {
  job_code: string;
  color: string;
  status: 'pending' | 'shipping';
  total_orders: number;
  total_boxes: number;
  created_at: string;
  updated_at: string;
}

export interface WorkData {
  work_id: number;
  job_code: string;
  color: string;
  status: string;
  total_orders: number;
  total_boxes: number;
  created_at: string;
  updated_at: string;
  stops: RouteStop[];
}

export interface RouteStop {
  stop_id: number;
  work_id: number;
  order_id: number;
  sequence_no: number;
  box_count: number;
  order_note: string | null;
  order_status: string;
  order_created_at: string;
  customer_id: number;
  customer_name: string;
  phone_number: string;
  location_name: string;
  latitude: number;
  longitude: number;
}
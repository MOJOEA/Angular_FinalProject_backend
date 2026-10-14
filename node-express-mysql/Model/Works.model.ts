export interface Works {
  work_id:              number;
  job_code:             string;
  color?:               string;
  status: 'pending' | 'shipping' | 'completed' | string;
  total_orders:         number;
  total_quantity:       number;
  total_boxes:          number;
  created_at?:          Date;
  updated_at?:          Date;
}

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

export interface WorkOrder {
  work_order_id: string;
  orders: PlanningOrder[];
  routeCoordinates?: any[];
  routeDistance?: String;
  routeDuration?: String;
}
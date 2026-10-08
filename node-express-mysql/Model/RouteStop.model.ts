export interface RouteStop {
  stop_id:          number;
  work_id:          number;
  order_id:         number;
  sequence_no:      number;
  status: 'pending' | 'success' | string;
}
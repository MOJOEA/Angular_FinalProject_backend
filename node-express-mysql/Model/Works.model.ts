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
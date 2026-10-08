export interface Order {
  order_id:             number;
  customer_id:          number;
  box_count:            number;
  order_note?:          string;
  status: 'pending' | 'shipping' | 'completed' | string;
  created_at?:          Date;
  updated_at?:          Date;
}
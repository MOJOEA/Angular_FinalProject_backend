export interface Order {
  order_id:             number;
  customer_id:          number;
  box_count:            number;
  order_note?:          string;
  status: 'pending' | 'shipping' | 'completed' | string;
  created_at?:          Date | string;
  updated_at?:          Date | string;
  customer_name:        string;
  phone_number:         string;
  latitude:             number;
  longitude:            number;
}

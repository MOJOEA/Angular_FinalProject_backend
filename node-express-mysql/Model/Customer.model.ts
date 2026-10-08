export interface Customer {
  customer_id:          number;
  customer_name:        string;
  phone_number:         string;
  location_name?:       string;
  latitude:             number;
  longitude:            number;
  created_at?:          Date;
  updated_at?:          Date;
}
export interface OrderItem {
  name: string;
  qty: number;
}

export interface Order {
  id: string;
  recipient_phone: string;
  sender_name: string;
  status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  items: OrderItem[];
  estimated_delivery: string;
  created_at: string;
}

export interface Complaint {
  id: number;
  order_id: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
}

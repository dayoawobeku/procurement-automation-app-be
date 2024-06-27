export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  shippingAddress: string;
  billingAddress: string;
  items: OrderItem[];
  status: "completed" | "shipped" | "pending" | "cancelled";
  totalAmount: number;
  discount: number;
  shippingFee: number;
  tax: number;
  paymentStatus: string;
  shippingMethod: string;
  trackingNumber: string;
  estimatedDelivery: string;
}

export interface Notification {
  id: string;
  message: string;
  status: "read" | "unread";
  createdAt: string;
}

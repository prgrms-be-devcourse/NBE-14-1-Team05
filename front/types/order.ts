export type OrderStatus = "ORDERED" | "SHIPPED" | "DELIVERED";

export type OrderItem = {
  id: number;
  productId: number | null;
  productName: string;
  quantity: number;
};

export type Order = {
  id: number;
  email: string;
  address: string;
  postcode: string;
  orderDate: string;
  status: OrderStatus;
  totalPrice: number;
  deliveryDate: string | null;
  orderItems: OrderItem[];
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  ORDERED: "주문 완료",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
};

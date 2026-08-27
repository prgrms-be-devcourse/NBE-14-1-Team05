import { ORDER_STATUS_LABEL, type OrderStatus } from "@/types/order";

export function getStatusBadgeClass(status: OrderStatus): string {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

  switch (status) {
    case "ORDERED":
      return `${base} bg-[#F5EEE7] text-[#8A684A]`;
    case "SHIPPED":
      return `${base} bg-blue-50 text-blue-600`;
    case "DELIVERED":
      return `${base} bg-emerald-50 text-emerald-600`;
    case "CANCELLED":
      return `${base} bg-red-50 text-red-600`;
    default:
      return `${base} bg-neutral-100 text-neutral-600`;
  }
}

export function getStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span className={`${getStatusBadgeClass(status)} ${className}`}>
      {getStatusLabel(status)}
    </span>
  );
}

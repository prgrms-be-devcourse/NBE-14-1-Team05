export interface TopProduct {
  productName: string;
  quantity: number;
  revenue: number;
}

export interface DailySales {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface MonthlySales {
  yearMonth: string;
  orderCount: number;
  revenue: number;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  todayDeliveries: number;
  topQuantityProducts: TopProduct[];
  topRevenueProducts: TopProduct[];
  dailySales: DailySales[];
  monthlySales: MonthlySales[];
}

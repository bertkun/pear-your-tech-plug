
export interface Phone {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
}

export interface CartItem extends Phone {
  quantity: number;
}

export enum OrderType {
  Retail = 'Retail',
  Wholesale = 'Wholesale',
}

export enum DeliveryOption {
  Standard = 'Standard Shipping',
  Express = 'Express Shipping',
  Pickup = 'In-Store Pickup',
}

export interface Order {
  id: string;
  items: CartItem[];
  orderType: OrderType;
  deliveryOption: DeliveryOption;
  totalPrice: number;
  createdAt: Date;
}

export enum OrderStatus {
    Placed = 'Order Placed',
    Processing = 'Processing',
    Packaged = 'Packaged',
    Shipped = 'Shipped',
    Delivered = 'Delivered',
}

export interface OrderStatusUpdate {
    status: OrderStatus;
    message: string;
    timestamp: Date;
}

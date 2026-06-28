export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
  color: string;
  stock: number;
  rating: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

export interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
}

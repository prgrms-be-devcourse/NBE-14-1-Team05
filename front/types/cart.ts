export type CartProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

const KEY = "cart_items";

export function getCart(): CartProduct[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartProduct[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(product: Omit<CartProduct, "quantity">) {
  const items = getCart();
  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({ ...product, quantity: 1 });
  }
  saveCart(items);
}

export function updateQuantity(id: number, quantity: number) {
  const items = getCart().map((i) => (i.id === id ? { ...i, quantity } : i));
  saveCart(items);
}

export function removeFromCart(id: number) {
  saveCart(getCart().filter((i) => i.id !== id));
}

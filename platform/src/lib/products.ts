import { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for work and travel.",
    price: 79.99,
    category: "Audio",
    emoji: "🎧",
    color: "#dbeafe",
    stock: 25,
    rating: 4.5,
  },
  {
    id: "p2",
    name: "Mechanical Keyboard",
    description:
      "Full-size mechanical keyboard with tactile blue switches, RGB backlighting per key, and a durable aluminium frame built for professionals and gamers.",
    price: 129.99,
    category: "Computing",
    emoji: "⌨️",
    color: "#dcfce7",
    stock: 18,
    rating: 4.7,
  },
  {
    id: "p3",
    name: "Ergonomic Wireless Mouse",
    description:
      "Sculpted ergonomic design with precision optical sensor, silent click buttons, 70-day battery life, and multi-device connectivity via USB or Bluetooth.",
    price: 49.99,
    category: "Computing",
    emoji: "🖱️",
    color: "#fef9c3",
    stock: 40,
    rating: 4.4,
  },
  {
    id: "p4",
    name: "4K USB-C Webcam",
    description:
      "Ultra-HD 4K webcam with autofocus, dual built-in noise-cancelling microphones, and HDR for video calls that look like you are in the room.",
    price: 89.99,
    category: "Computing",
    emoji: "📷",
    color: "#fce7f3",
    stock: 15,
    rating: 4.3,
  },
  {
    id: "p5",
    name: "LED Desk Lamp",
    description:
      "Smart LED lamp with adjustable colour temperature, 5 brightness levels, wireless charging base, and a USB-A port for phone charging.",
    price: 39.99,
    category: "Accessories",
    emoji: "💡",
    color: "#fed7aa",
    stock: 50,
    rating: 4.6,
  },
  {
    id: "p6",
    name: "Gaming Controller",
    description:
      "Wireless gamepad compatible with PC and mobile, featuring hall-effect thumbsticks, programmable back paddles, vibration haptics, and a 20-hour battery.",
    price: 59.99,
    category: "Gaming",
    emoji: "🎮",
    color: "#ede9fe",
    stock: 30,
    rating: 4.8,
  },
  {
    id: "p7",
    name: "Portable Power Bank 20000mAh",
    description:
      "High-capacity power bank with 65W USB-C PD fast charging, dual USB-A outputs, and a built-in LED display showing remaining charge percentage.",
    price: 34.99,
    category: "Accessories",
    emoji: "🔋",
    color: "#d1fae5",
    stock: 60,
    rating: 4.5,
  },
  {
    id: "p8",
    name: "USB-C Hub 7-in-1",
    description:
      "Compact hub that expands a single USB-C port into HDMI 4K, 3× USB-A 3.0, SD/microSD card readers, and 100W USB-C power pass-through.",
    price: 44.99,
    category: "Computing",
    emoji: "🔌",
    color: "#e0f2fe",
    stock: 35,
    rating: 4.2,
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

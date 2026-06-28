"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/products", label: "Products" },
    { href: "/cart", label: "Cart" },
    { href: "/chat", label: "AI Chat" },
  ];

  return (
    <nav
      className="bg-white border-b border-gray-200 px-6 py-4"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/products"
          className="text-xl font-bold text-blue-600"
          data-testid="brand-logo"
        >
          ShopLab
        </Link>
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors pb-1 ${
                pathname.startsWith(link.href)
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              data-testid={`nav-link-${link.label.toLowerCase().replace(" ", "-")}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

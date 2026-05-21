"use client";

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { CartItem, Producto } from "@/lib/types";

interface CartState {
  items: CartItem[];
  open: boolean;
}

type CartAction =
  | { type: "ADD"; producto: Producto; talle?: string }
  | { type: "REMOVE"; productoId: string; talle?: string }
  | { type: "UPDATE_QTY"; productoId: string; talle?: string; cantidad: number }
  | { type: "CLEAR" }
  | { type: "TOGGLE_OPEN" }
  | { type: "SET_OPEN"; open: boolean };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const key = `${action.producto.id}-${action.talle ?? ""}`;
      const existing = state.items.find(
        (i) => `${i.producto.id}-${i.talle ?? ""}` === key
      );
      if (existing) {
        return {
          ...state,
          open: true,
          items: state.items.map((i) =>
            `${i.producto.id}-${i.talle ?? ""}` === key
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        open: true,
        items: [...state.items, { producto: action.producto, cantidad: 1, talle: action.talle }],
      };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter(
          (i) => `${i.producto.id}-${i.talle ?? ""}` !== `${action.productoId}-${action.talle ?? ""}`
        ),
      };
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items
          .map((i) =>
            `${i.producto.id}-${i.talle ?? ""}` === `${action.productoId}-${action.talle ?? ""}`
              ? { ...i, cantidad: action.cantidad }
              : i
          )
          .filter((i) => i.cantidad > 0),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "TOGGLE_OPEN":
      return { ...state, open: !state.open };
    case "SET_OPEN":
      return { ...state, open: action.open };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  open: boolean;
  total: number;
  count: number;
  add: (producto: Producto, talle?: string) => void;
  remove: (productoId: string, talle?: string) => void;
  updateQty: (productoId: string, talle?: string, cantidad?: number) => void;
  clear: () => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], open: false });

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("eu-cart");
    if (saved) {
      try {
        const parsed: CartItem[] = JSON.parse(saved);
        parsed.forEach((item) => dispatch({ type: "ADD", producto: item.producto, talle: item.talle }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("eu-cart", JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce(
    (sum, i) => sum + i.producto.precio * i.cantidad,
    0
  );
  const count = state.items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        open: state.open,
        total,
        count,
        add: (p, t) => dispatch({ type: "ADD", producto: p, talle: t }),
        remove: (id, t) => dispatch({ type: "REMOVE", productoId: id, talle: t }),
        updateQty: (id, t, c = 0) =>
          dispatch({ type: "UPDATE_QTY", productoId: id, talle: t, cantidad: c }),
        clear: () => dispatch({ type: "CLEAR" }),
        toggleOpen: () => dispatch({ type: "TOGGLE_OPEN" }),
        setOpen: (o) => dispatch({ type: "SET_OPEN", open: o }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

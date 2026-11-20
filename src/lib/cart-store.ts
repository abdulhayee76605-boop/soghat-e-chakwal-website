// ============================================================
// Cart Store — Zustand with localStorage persistence
// ============================================================

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariant } from './types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  getItemCount: () => number;
  getTotalLiters: () => number;
  getSubtotal: () => number;
  getShipping: (subtotal?: number) => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === product.id && item.variantId === variant.id
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            };
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                variantId: variant.id,
                quantity,
                product,
                variant,
              },
            ],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalLiters: () => {
        return get().items.reduce((sum, item) => {
          const size = (item.variant.size || '').toLowerCase();
          let liters = 0;
          if (size.includes('1l') || size.includes('1 liter') || size === '1l') {
            liters = 1;
          } else if (size.includes('500ml') || size.includes('0.5l') || size === '500ml') {
            liters = 0.5;
          } else if (item.variant.weight) {
            liters = item.variant.weight / 1000;
          } else {
            liters = item.variant.price / 700;
          }
          return sum + liters * item.quantity;
        }, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.variant.price * item.quantity,
          0
        );
      },

      getShipping: (subtotal?: number) => {
        const liters = get().getTotalLiters();
        const sub = subtotal ?? get().getSubtotal();
        // Free shipping for orders above 3 Liters (3L+ / Rs. 2,100+)
        if (liters >= 3 || sub >= 2100) return 0;
        return 200;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShipping(subtotal);
        return subtotal + shipping;
      },
    }),
    {
      name: 'soghat-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

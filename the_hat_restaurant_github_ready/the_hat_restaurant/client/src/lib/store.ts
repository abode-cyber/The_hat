import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// تعريف أنواع البيانات
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  isSoldOut?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  extras?: string[];
}

export interface UserInfo {
  name: string;
  phone: string;
  carType: string;
  carColor: string;
}

interface AppState {
  // حالة الفرع
  selectedBranch: 'taif_okaz' | 'taif_east_ring' | null;
  setBranch: (branch: 'taif_okaz' | 'taif_east_ring') => void;

  // حالة السلة
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, extras?: string[]) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // حالة المستخدم
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      selectedBranch: null,
      setBranch: (branch) => set({ selectedBranch: branch }),

      cart: [],
      addToCart: (item, quantity = 1, extras = []) => 
        set((state) => {
          const existingItemIndex = state.cart.findIndex(
            (i) => i.id === item.id && JSON.stringify(i.extras) === JSON.stringify(extras)
          );

          if (existingItemIndex > -1) {
            const newCart = [...state.cart];
            newCart[existingItemIndex].quantity += quantity;
            return { cart: newCart };
          }

          return { 
            cart: [...state.cart, { ...item, quantity, extras }] 
          };
        }),

      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          cart: state.cart.map((i) => 
            i.id === itemId ? { ...i, quantity } : i
          ).filter(i => i.quantity > 0),
        })),

      clearCart: () => set({ cart: [] }),

      userInfo: null,
      setUserInfo: (info) => set({ userInfo: info }),
    }),
    {
      name: 'the-hat-storage', // اسم المفتاح في localStorage
    }
  )
);

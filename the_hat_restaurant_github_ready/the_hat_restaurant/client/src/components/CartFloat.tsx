import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import { useLocation } from 'wouter';

export default function CartFloat() {
  const cart = useStore((state) => state.cart);
  const [location, setLocation] = useLocation();

  // لا تظهر السلة إذا كانت فارغة أو إذا كنا في صفحة الدفع
  if (cart.length === 0 || location === '/checkout') return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center pointer-events-none">
      <button
        onClick={() => setLocation('/checkout')}
        className={cn(
          "pointer-events-auto w-full max-w-md bg-primary text-primary-foreground",
          "flex items-center justify-between p-4 shadow-lg shadow-primary/20",
          "clip-diagonal transition-transform active:scale-95 hover:brightness-110"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="bg-black/20 p-2 rounded-sm">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-lg">{totalItems} منتجات</span>
            <span className="text-xs opacity-80">اضغط لإتمام الطلب</span>
          </div>
        </div>
        
        <div className="font-mono font-bold text-xl bg-black/10 px-3 py-1 rounded-sm">
          {totalPrice} ر.س
        </div>
      </button>
    </div>
  );
}

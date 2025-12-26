import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { Bell, CheckCircle2, ChefHat, Clock, Car, Phone, User } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  carType: string;
  carColor: string;
  items: any[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: any;
  branch: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // PIN Protection
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('رمز الدخول غير صحيح');
    }
  };

  // Real-time Orders Listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      // Check for new pending orders to play sound
      const hasNewPending = newOrders.some(o => o.status === 'pending' && !orders.find(old => old.id === o.id));
      if (hasNewPending && audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed', e));
      }

      setOrders(newOrders);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const updateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <form onSubmit={handleLogin} className="bg-card p-8 border border-border w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center text-primary">لوحة المطبخ</h1>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="أدخل رمز PIN"
            className="w-full bg-input p-3 text-center text-2xl tracking-widest outline-none focus:border-primary border border-transparent"
            autoFocus
          />
          <button type="submit" className="w-full bg-primary text-primary-foreground p-3 font-bold">
            دخول
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <audio ref={audioRef} src="/sounds/notification.mp3" />
      
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-primary">THE HAT KITCHEN</h1>
        <div className="flex gap-4">
          <div className="bg-card px-4 py-2 border border-border flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-mono">LIVE CONNECTION</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className={cn(
              "bg-card border-2 p-4 relative transition-all",
              order.status === 'pending' ? "border-primary animate-pulse" : "border-border",
              order.status === 'completed' && "opacity-50 grayscale"
            )}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 border-b border-border/50 pb-2">
              <div>
                <span className="text-xs text-muted-foreground">#{order.orderNumber}</span>
                <h3 className="font-bold text-lg">{order.customerName}</h3>
              </div>
              <div className="text-right">
                <span className="block font-mono text-primary font-bold">{order.totalPrice} ر.س</span>
                <span className="text-xs text-muted-foreground">
                  {order.createdAt?.toDate().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>

            {/* Car Info */}
            <div className="bg-secondary/30 p-2 mb-4 flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-primary" />
              <span>{order.carType} - {order.carColor}</span>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="flex gap-2">
                    <span className="bg-primary/20 px-1.5 rounded text-primary font-bold">{item.quantity}</span>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              {order.status === 'pending' && (
                <button 
                  onClick={() => updateStatus(order.id, 'preparing')}
                  className="col-span-2 bg-primary text-primary-foreground p-3 font-bold flex items-center justify-center gap-2 hover:brightness-110"
                >
                  <ChefHat className="w-5 h-5" />
                  بدء التحضير
                </button>
              )}

              {order.status === 'preparing' && (
                <button 
                  onClick={() => updateStatus(order.id, 'ready')}
                  className="col-span-2 bg-green-600 text-white p-3 font-bold flex items-center justify-center gap-2 hover:brightness-110"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  جاهز للاستلام
                </button>
              )}

              {order.status === 'ready' && (
                <button 
                  onClick={() => updateStatus(order.id, 'completed')}
                  className="col-span-2 bg-secondary text-secondary-foreground p-3 font-bold flex items-center justify-center gap-2 hover:bg-secondary/80"
                >
                  تم التسليم
                </button>
              )}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
            <Bell className="w-16 h-16 mb-4" />
            <p className="text-xl">لا توجد طلبات حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}

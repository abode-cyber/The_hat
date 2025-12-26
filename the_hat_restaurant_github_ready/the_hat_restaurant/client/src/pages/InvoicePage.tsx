import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { doc, onSnapshot } from 'firebase/firestore';
import { CheckCircle2, Clock, Loader2, MapPin, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';

interface OrderData {
  id: string;
  orderNumber: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  totalPrice: number;
  createdAt: any;
  items: any[];
  branch: string;
}

const STATUS_CONFIG = {
  pending: { label: 'بانتظار التأكيد', color: 'text-yellow-500', icon: Clock, bg: 'bg-yellow-500/10', animate: false },
  preparing: { label: 'جاري التحضير', color: 'text-blue-500', icon: Loader2, bg: 'bg-blue-500/10', animate: true },
  ready: { label: 'جاهز للاستلام', color: 'text-green-500', icon: CheckCircle2, bg: 'bg-green-500/10', animate: false },
  completed: { label: 'تم الاستلام', color: 'text-gray-500', icon: CheckCircle2, bg: 'bg-gray-500/10', animate: false },
};

export default function InvoicePage() {
  const [, params] = useRoute('/invoice/:id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    // Real-time listener for order updates
    const unsub = onSnapshot(doc(db, 'orders', params.id), (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() } as OrderData);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        الطلب غير موجود
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in duration-500">
        
        {/* Header Status */}
        <div className="text-center space-y-4">
          <div className={cn("mx-auto w-20 h-20 rounded-full flex items-center justify-center border-4 border-card", status.bg)}>
            <StatusIcon className={cn("w-10 h-10", status.color, status.animate && "animate-spin")} />
          </div>
          
          <div>
            <h1 className={cn("text-2xl font-bold", status.color)}>{status.label}</h1>
            <p className="text-muted-foreground">رقم الطلب #{order.orderNumber}</p>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-card border border-border overflow-hidden relative">
          {/* Top Zigzag Pattern */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-repeat-x bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSI+PHBhdGggZD0iTTAgMTBMNSAwTDEwIDEwIiAvPjwvc3ZnPg==')] opacity-20" />

          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <span className="text-muted-foreground">التاريخ</span>
              <span className="font-mono">
                {order.createdAt?.toDate().toLocaleDateString('ar-SA')}
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="flex gap-2">
                    <span className="font-bold text-primary">x{item.quantity}</span>
                    {item.name}
                  </span>
                  <span className="font-mono text-muted-foreground">{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-border pt-4 flex justify-between items-center font-bold text-lg">
              <span>الإجمالي</span>
              <span className="text-primary font-mono">{order.totalPrice} ر.س</span>
            </div>
          </div>

          {/* Branch Info */}
          <div className="bg-secondary/30 p-4 text-center text-sm text-muted-foreground border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MapPin className="w-4 h-4" />
              <span>استلام من: {order.branch === 'taif_okaz' ? 'فرع شارع عكاظ' : 'فرع الحلقة الشرقية'}</span>
            </div>
            <p>يرجى إظهار هذه الشاشة للكاشير عند الاستلام</p>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="text-muted-foreground hover:text-primary text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            طلب جديد
          </button>
        </div>

      </div>
    </div>
  );
}

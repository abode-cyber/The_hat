import { MenuItem, useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const addToCart = useStore((state) => state.addToCart);
  const [isPressed, setIsPressed] = useState(false);

  const handleAdd = () => {
    if (item.isSoldOut) return;
    
    setIsPressed(true);
    addToCart(item);
    
    // تأثير بصري سريع عند الضغط
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <div 
      onClick={handleAdd}
      className={cn(
        "relative group overflow-hidden bg-card border border-border transition-all duration-100 cursor-pointer select-none",
        "hover:border-primary/50",
        isPressed ? "scale-[0.98] brightness-110" : "scale-100",
        item.isSoldOut && "opacity-50 grayscale pointer-events-none"
      )}
    >
      {/* صورة المنتج */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-secondary relative">
        {/* طبقة شبكية فوق الصورة */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] z-10 pointer-events-none" />
        
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-4xl font-bold opacity-20">THE HAT</span>
          </div>
        )}

        {/* شارة نفاذ الكمية */}
        {item.isSoldOut && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="text-destructive font-bold text-xl border-2 border-destructive px-4 py-1 -rotate-12">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* تفاصيل المنتج */}
      <div className="p-4 flex flex-col gap-2 relative">
        {/* زخرفة صناعية */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/30" />

        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <span className="font-mono text-primary font-bold text-lg shrink-0">
            {item.price} <span className="text-xs text-muted-foreground">ر.س</span>
          </span>
        </div>

        {/* زر الإضافة المخفي الذي يظهر عند التحويم (لأجهزة الكمبيوتر) أو دائماً (للموبايل) */}
        <div className="mt-2 flex justify-end">
          <button 
            className={cn(
              "bg-primary text-primary-foreground p-2 clip-diagonal active:scale-90 transition-transform",
              "flex items-center justify-center gap-2 font-bold text-sm w-full"
            )}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>
      </div>
    </div>
  );
}

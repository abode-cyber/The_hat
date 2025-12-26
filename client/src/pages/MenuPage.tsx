import CartFloat from '@/components/CartFloat';
import MenuCard from '@/components/MenuCard';
import { CATEGORIES, MENU_ITEMS } from '@/lib/data';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ChevronRight, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function MenuPage() {
  const { selectedBranch, setBranch } = useStore();
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);

  // إعادة التوجيه إذا لم يتم اختيار فرع
  useEffect(() => {
    if (!selectedBranch) {
      setLocation('/');
    }
  }, [selectedBranch, setLocation]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => setLocation('/')}>
            <h1 className="text-2xl font-black text-primary tracking-tighter cursor-pointer">THE HAT</h1>
          </div>
          
          <button 
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <MapPin className="w-3 h-3" />
            <span>{selectedBranch === 'taif_okaz' ? 'شارع عكاظ' : 'الحلقة الشرقية'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Category Nav */}
        <div className="overflow-x-auto scrollbar-hide border-t border-border/50">
          <div className="flex p-2 gap-2 container min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={cn(
                  "px-4 py-2 text-sm font-bold transition-all whitespace-nowrap clip-diagonal",
                  activeCategory === cat.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="container py-6 space-y-12">
        {CATEGORIES.map((cat) => {
          const items = MENU_ITEMS.filter(item => item.category === cat.id);
          if (items.length === 0) return null;

          return (
            <section key={cat.id} id={cat.id} className="scroll-mt-32 space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-primary">{cat.name}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <CartFloat />
    </div>
  );
}

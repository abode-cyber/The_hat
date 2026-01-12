import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, ShoppingCart, Plus, Minus, Trash2, Send, AlertCircle, Moon, Sun, Languages } from "lucide-react";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

type CartItem = {
  productId: number;
  name: string;
  price: string;
  quantity: number;
  imageUrl: string | null;
};

export default function Store() {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug || "";
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const { data: merchant, isLoading: merchantLoading } = trpc.merchant.getBySlug.useQuery({ slug });
  const { data: products = [], isLoading: productsLoading } = trpc.product.getByMerchantSlug.useQuery({ slug });

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${slug}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [slug]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(`cart-${slug}`, JSON.stringify(cart));
  }, [cart, slug]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ];
    });
    toast.success(t("تمت الإضافة إلى السلة", "Added to cart"));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(t("السلة فارغة", "Cart is empty"));
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleSendOrder = () => {
    if (!customerData.name || !customerData.phone || !customerData.address) {
      toast.error(t("يرجى ملء جميع البيانات", "Please fill all fields"));
      return;
    }

    if (!merchant?.whatsappNumber) {
      toast.error(t("رقم الواتساب غير متوفر", "WhatsApp number not available"));
      return;
    }

    // Build WhatsApp message
    let message = `🛍️ *${t("طلب جديد من", "New Order from")} ${customerData.name}*\n\n`;
    message += `📦 *${t("المنتجات:", "Products:")}*\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   ${t("الكمية:", "Quantity:")} ${item.quantity}\n`;
      message += `   ${t("السعر:", "Price:")} ${item.price} ${merchant.currency}\n`;
      message += `   ${t("المجموع:", "Total:")} ${(parseFloat(item.price) * item.quantity).toFixed(2)} ${merchant.currency}\n\n`;
    });

    message += `💰 *${t("المجموع الكلي:", "Grand Total:")} ${getTotalPrice()} ${merchant.currency}*\n\n`;
    message += `👤 *${t("بيانات العميل:", "Customer Details:")}*\n`;
    message += `${t("الاسم:", "Name:")} ${customerData.name}\n`;
    message += `${t("الجوال:", "Phone:")} ${customerData.phone}\n`;
    message += `${t("العنوان:", "Address:")} ${customerData.address}\n`;

    const whatsappUrl = `https://wa.me/${merchant.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // Clear cart and close dialog
    setCart([]);
    setIsCheckoutOpen(false);
    setCustomerData({ name: "", phone: "", address: "" });
    toast.success(t("تم إرسال الطلب!", "Order sent!"));
  };

  if (merchantLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">{t("المتجر غير موجود", "Store not found")}</h2>
            <p className="text-muted-foreground">
              {t("عذراً، المتجر الذي تبحث عنه غير موجود", "Sorry, the store you're looking for doesn't exist")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if subscription expired
  const isExpired = merchant.expiryDate && new Date(merchant.expiryDate) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
            <h2 className="text-xl font-bold mb-2">{t("المحل مغلق حالياً", "Store Closed")}</h2>
            <p className="text-muted-foreground">
              {t("عذراً، هذا المتجر مغلق حالياً. يرجى المحاولة لاحقاً.", "Sorry, this store is currently closed. Please try again later.")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{merchant.shopName}</h1>
              <p className="text-sm text-muted-foreground">
                {t("تسوق الآن", "Shop Now")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              >
                <Languages className="h-5 w-5" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Cart Button */}
              <Button
                variant="default"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {t("لا توجد منتجات متاحة حالياً", "No products available at the moment")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">{t("غير متوفر", "Unavailable")}</Badge>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                  {product.description && (
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {product.price} {merchant.currency}
                    </span>
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={() => addToCart(product)}
                    disabled={!product.isAvailable}
                  >
                    <Plus className="h-4 w-4" />
                    {t("أضف للسلة", "Add to Cart")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("سلة المشتريات", "Shopping Cart")}</DialogTitle>
            <DialogDescription>
              {cart.length === 0
                ? t("السلة فارغة", "Your cart is empty")
                : `${getTotalItems()} ${t("منتج", "items")}`}
            </DialogDescription>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
              <p>{t("لا توجد منتجات في السلة", "No items in cart")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-4 border border-border rounded-lg p-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.price} {merchant.currency}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 ml-auto"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t("المجموع:", "Total:")}</span>
                  <span className="text-primary">
                    {getTotalPrice()} {merchant.currency}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCartOpen(false)}>
              {t("إغلاق", "Close")}
            </Button>
            <Button onClick={handleCheckout} disabled={cart.length === 0} className="gap-2">
              <Send className="h-4 w-4" />
              {t("إتمام الطلب", "Checkout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("إتمام الطلب", "Complete Order")}</DialogTitle>
            <DialogDescription>
              {t("أدخل بياناتك لإتمام الطلب", "Enter your details to complete the order")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name">{t("الاسم", "Name")} *</Label>
              <Input
                id="customer-name"
                value={customerData.name}
                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                placeholder={t("أدخل اسمك", "Enter your name")}
              />
            </div>

            <div>
              <Label htmlFor="customer-phone">{t("رقم الجوال", "Phone Number")} *</Label>
              <Input
                id="customer-phone"
                value={customerData.phone}
                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                placeholder="+966501234567"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="customer-address">{t("العنوان", "Address")} *</Label>
              <Input
                id="customer-address"
                value={customerData.address}
                onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                placeholder={t("أدخل عنوانك", "Enter your address")}
              />
            </div>

            <div className="border border-border rounded-lg p-4 bg-muted/50">
              <div className="flex justify-between text-sm mb-2">
                <span>{t("عدد المنتجات:", "Items:")}</span>
                <span className="font-semibold">{getTotalItems()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>{t("المجموع:", "Total:")}</span>
                <span className="text-primary">
                  {getTotalPrice()} {merchant.currency}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button onClick={handleSendOrder} className="gap-2">
              <Send className="h-4 w-4" />
              {t("إرسال الطلب", "Send Order")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

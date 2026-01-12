import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Store } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Setup() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    shopName: "",
    slug: "",
    whatsappNumber: "",
    currency: "SAR" as "SAR" | "EGP" | "DZD" | "USD",
  });

  const createMutation = trpc.merchant.create.useMutation({
    onSuccess: () => {
      toast.success(t("تم إنشاء المتجر بنجاح!", "Store created successfully!"));
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || t("فشل إنشاء المتجر", "Failed to create store"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shopName || !formData.slug) {
      toast.error(t("يرجى ملء جميع الحقول المطلوبة", "Please fill all required fields"));
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.slug)) {
      toast.error(
        t(
          "الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط",
          "Slug must contain only lowercase letters, numbers, and hyphens"
        )
      );
      return;
    }

    createMutation.mutate(formData);
  };

  const generateSlug = () => {
    const slug = formData.shopName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
    setFormData({ ...formData, slug });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {t("مرحباً بك في OrderFlow!", "Welcome to OrderFlow!")}
          </CardTitle>
          <CardDescription>
            {t("لنبدأ بإنشاء متجرك الإلكتروني", "Let's start by creating your online store")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="shopName">{t("اسم المتجر", "Shop Name")} *</Label>
              <Input
                id="shopName"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                placeholder={t("مثال: متجر الإلكترونيات", "e.g., Electronics Store")}
                onBlur={generateSlug}
              />
            </div>

            <div>
              <Label htmlFor="slug">{t("رابط المتجر", "Store URL")} *</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                  placeholder="electronics-store"
                  dir="ltr"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {window.location.origin}/{formData.slug || "your-store"}
              </p>
            </div>

            <div>
              <Label htmlFor="whatsapp">{t("رقم الواتساب", "WhatsApp Number")}</Label>
              <Input
                id="whatsapp"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="+966501234567"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("أدخل الرقم مع رمز الدولة", "Enter number with country code")}
              </p>
            </div>

            <div>
              <Label htmlFor="currency">{t("العملة", "Currency")} *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: any) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">{t("ريال سعودي (ر.س)", "Saudi Riyal (SAR)")}</SelectItem>
                  <SelectItem value="EGP">{t("جنيه مصري (ج.م)", "Egyptian Pound (EGP)")}</SelectItem>
                  <SelectItem value="DZD">{t("دينار جزائري (د.ج)", "Algerian Dinar (DZD)")}</SelectItem>
                  <SelectItem value="USD">{t("دولار أمريكي ($)", "US Dollar (USD)")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Store className="h-4 w-4" />
              )}
              {t("إنشاء المتجر", "Create Store")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

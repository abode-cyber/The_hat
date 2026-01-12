import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, Link as LinkIcon, Copy, Check } from "lucide-react";
import { toast } from "sonner";

type Merchant = {
  id: number;
  userId: number;
  shopName: string;
  slug: string;
  whatsappNumber: string | null;
  currency: "SAR" | "EGP" | "DZD" | "USD";
  expiryDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface SettingsTabProps {
  merchant: Merchant;
}

export default function SettingsTab({ merchant }: SettingsTabProps) {
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    shopName: merchant.shopName,
    whatsappNumber: merchant.whatsappNumber || "",
    currency: merchant.currency,
  });

  const updateMutation = trpc.merchant.update.useMutation({
    onSuccess: () => {
      utils.merchant.getMyMerchant.invalidate();
      toast.success(t("تم حفظ الإعدادات بنجاح", "Settings saved successfully"));
    },
    onError: () => {
      toast.error(t("فشل حفظ الإعدادات", "Failed to save settings"));
    },
  });

  const handleSave = () => {
    if (!formData.shopName) {
      toast.error(t("اسم المتجر مطلوب", "Shop name is required"));
      return;
    }

    updateMutation.mutate({
      shopName: formData.shopName,
      whatsappNumber: formData.whatsappNumber || undefined,
      currency: formData.currency,
    });
  };

  const storeUrl = `${window.location.origin}/${merchant.slug}`;

  const copyStoreUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success(t("تم نسخ رابط المتجر", "Store link copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("إعدادات المتجر", "Store Settings")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("عدل معلومات متجرك", "Edit your store information")}
        </p>
      </div>

      {/* Store Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            {t("رابط المتجر", "Store Link")}
          </CardTitle>
          <CardDescription>
            {t("شارك هذا الرابط مع عملائك", "Share this link with your customers")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={storeUrl} readOnly className="flex-1" />
            <Button variant="outline" size="icon" onClick={copyStoreUrl}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("معلومات المتجر", "Store Information")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="shopName">{t("اسم المتجر", "Shop Name")} *</Label>
            <Input
              id="shopName"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              placeholder={t("أدخل اسم المتجر", "Enter shop name")}
            />
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
              {t("أدخل الرقم مع رمز الدولة (مثال: +966501234567)", "Enter number with country code (e.g., +966501234567)")}
            </p>
          </div>

          <div>
            <Label htmlFor="currency">{t("العملة", "Currency")}</Label>
            <Select value={formData.currency} onValueChange={(value: any) => setFormData({ ...formData, currency: value })}>
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

          <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full gap-2">
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("حفظ التغييرات", "Save Changes")}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("معلومات الاشتراك", "Subscription Information")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("حالة الاشتراك:", "Subscription Status:")}</span>
              <span className={merchant.expiryDate && new Date(merchant.expiryDate) > new Date() ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {merchant.expiryDate && new Date(merchant.expiryDate) > new Date()
                  ? t("نشط", "Active")
                  : t("منتهي", "Expired")}
              </span>
            </div>
            {merchant.expiryDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("تاريخ الانتهاء:", "Expiry Date:")}</span>
                <span className="font-semibold">
                  {new Date(merchant.expiryDate).toLocaleDateString(t("ar-SA", "en-US"))}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

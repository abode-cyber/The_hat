import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Loader2, Calculator, Heart, TrendingUp } from "lucide-react";
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

interface CommissionTabProps {
  merchant: Merchant;
}

export default function CommissionTab({ merchant }: CommissionTabProps) {
  const { t } = useLanguage();
  const utils = trpc.useUtils();

  const [salesAmount, setSalesAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [calculatedCommission, setCalculatedCommission] = useState<string | null>(null);

  const { data: salesHistory = [] } = trpc.sales.getMySales.useQuery();

  const reportSalesMutation = trpc.sales.report.useMutation({
    onSuccess: (data) => {
      utils.sales.getMySales.invalidate();
      setCalculatedCommission(data.commission);
      setSalesAmount("");
      setNotes("");
      toast.success(t("تم تسجيل المبيعات بنجاح", "Sales reported successfully"));
    },
    onError: () => {
      toast.error(t("فشل تسجيل المبيعات", "Failed to report sales"));
    },
  });

  const handleCalculate = () => {
    const amount = parseFloat(salesAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t("يرجى إدخال مبلغ صحيح", "Please enter a valid amount"));
      return;
    }

    const commission = (amount * 0.01).toFixed(2);
    setCalculatedCommission(commission);
  };

  const handleReport = () => {
    const amount = parseFloat(salesAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t("يرجى إدخال مبلغ صحيح", "Please enter a valid amount"));
      return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    reportSalesMutation.mutate({
      salesAmount: salesAmount,
      reportMonth: currentMonth,
      notes: notes,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("حاسبة العمولة", "Commission Calculator")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("احسب وسجل عمولة مبيعاتك", "Calculate and report your sales commission")}
        </p>
      </div>

      {/* Trust Message */}
      <Alert className="border-primary/50 bg-primary/5">
        <Heart className="h-5 w-5 text-primary" />
        <AlertDescription className="text-base leading-relaxed">
          {t(
            "عزيزي التاجر، لثقتنا الكبيرة فيك، نرجو منك إضافة مبيعاتك هنا لحساب نسبة الـ 1% المستحقة. يمكنك خصم المرتجعات، ونرجو التحويل مع الاشتراك الشهري لدعم المنصة. شكراً لأمانتك! 💙",
            "Dear merchant, we trust you greatly. Please add your sales here to calculate the 1% commission. You can deduct returns, and we kindly ask you to transfer the amount with your monthly subscription to support the platform. Thank you for your honesty! 💙"
          )}
        </AlertDescription>
      </Alert>

      {/* Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t("حاسبة العمولة", "Commission Calculator")}
          </CardTitle>
          <CardDescription>
            {t("احسب نسبة 1% من مبيعاتك", "Calculate 1% of your sales")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sales">{t("مبلغ المبيعات", "Sales Amount")} *</Label>
            <div className="flex gap-2">
              <Input
                id="sales"
                type="number"
                step="0.01"
                value={salesAmount}
                onChange={(e) => {
                  setSalesAmount(e.target.value);
                  setCalculatedCommission(null);
                }}
                placeholder="0.00"
                className="flex-1"
              />
              <span className="flex items-center px-3 bg-muted rounded-md text-muted-foreground">
                {merchant.currency}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">{t("ملاحظات (اختياري)", "Notes (Optional)")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("أي ملاحظات أو تفاصيل إضافية", "Any notes or additional details")}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalculate} variant="outline" className="flex-1 gap-2">
              <Calculator className="h-4 w-4" />
              {t("احسب", "Calculate")}
            </Button>
            <Button
              onClick={handleReport}
              disabled={reportSalesMutation.isPending || !salesAmount}
              className="flex-1 gap-2"
            >
              {reportSalesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {t("سجل المبيعات", "Report Sales")}
            </Button>
          </div>

          {calculatedCommission && (
            <Alert className="border-green-500/50 bg-green-500/5">
              <AlertDescription className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  {t("العمولة المستحقة (1%)", "Commission Due (1%)")}
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {calculatedCommission} {merchant.currency}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("سجل المبيعات", "Sales History")}</CardTitle>
          <CardDescription>
            {t("المبيعات المسجلة سابقاً", "Previously reported sales")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("لا توجد مبيعات مسجلة بعد", "No sales reported yet")}
            </div>
          ) : (
            <div className="space-y-3">
              {salesHistory.map((sale: any) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-semibold">
                      {sale.salesAmount} {merchant.currency}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("الشهر:", "Month:")} {sale.reportMonth}
                    </div>
                    {sale.notes && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {sale.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {sale.commissionAmount} {merchant.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("عمولة 1%", "1% commission")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

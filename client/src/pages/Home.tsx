import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Store, Package, Calculator, TrendingUp, Moon, Sun, Languages } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  const { data: merchant, isLoading: merchantLoading } = trpc.merchant.getMyMerchant.useQuery(
    undefined,
    { enabled: !!user }
  );

  useEffect(() => {
    if (!loading && user) {
      if (merchant) {
        setLocation("/dashboard");
      } else if (!merchantLoading) {
        setLocation("/setup");
      }
    }
  }, [user, loading, merchant, merchantLoading, setLocation]);

  if (loading || (user && merchantLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">OrderFlow</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              >
                <Languages className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {!isAuthenticated && (
                <Button onClick={() => window.location.href = getLoginUrl()}>
                  {t("تسجيل الدخول", "Sign In")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("منصة التجارة الإلكترونية الأسهل", "The Easiest E-Commerce Platform")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t(
              "أنشئ متجرك الإلكتروني في دقائق وابدأ البيع عبر الواتساب بسهولة",
              "Create your online store in minutes and start selling via WhatsApp easily"
            )}
          </p>
          <Button size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = getLoginUrl()}>
            {t("ابدأ الآن مجاناً", "Start Now for Free")}
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("إنشاء سريع", "Quick Setup")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("أنشئ متجرك في دقائق معدودة", "Create your store in minutes")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("إدارة المنتجات", "Product Management")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("أضف وعدل منتجاتك بسهولة", "Add and edit products easily")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("طلبات واتساب", "WhatsApp Orders")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("استقبل الطلبات مباشرة على الواتساب", "Receive orders directly on WhatsApp")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("حاسبة العمولة", "Commission Calculator")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("احسب عمولتك بسهولة", "Calculate your commission easily")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-12 text-center">
            <h3 className="text-2xl font-bold mb-4">
              {t("جاهز للبدء؟", "Ready to Start?")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("انضم إلى مئات التجار الذين يستخدمون OrderFlow", "Join hundreds of merchants using OrderFlow")}
            </p>
            <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
              {t("ابدأ الآن", "Start Now")}
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 OrderFlow. {t("جميع الحقوق محفوظة", "All rights reserved")}</p>
        </div>
      </footer>
    </div>
  );
}

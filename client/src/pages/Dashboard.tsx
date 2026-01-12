import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Package, Settings, Calculator, Instagram, Moon, Sun, Languages } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import ProductsTab from "@/components/dashboard/ProductsTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import CommissionTab from "@/components/dashboard/CommissionTab";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  const { data: merchant, isLoading: merchantLoading } = trpc.merchant.getMyMerchant.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (authLoading || merchantLoading) {
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

  if (!merchant) {
    setLocation("/setup");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("لوحة التحكم", "Dashboard")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {merchant.shopName}
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

              {/* Contact Button */}
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open("https://www.instagram.com/3lbod?igsh=MWhhbDFuMWdoYzM1MA%3D%3D&utm_source=qr", "_blank")}
                className="gap-2"
              >
                <Instagram className="h-4 w-4" />
                {t("تواصل معنا", "Contact Us")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              {t("المنتجات", "Products")}
            </TabsTrigger>
            <TabsTrigger value="commission" className="gap-2">
              <Calculator className="h-4 w-4" />
              {t("حاسبة العمولة", "Commission Calculator")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              {t("الإعدادات", "Settings")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab merchant={merchant} />
          </TabsContent>

          <TabsContent value="commission">
            <CommissionTab merchant={merchant} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab merchant={merchant} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

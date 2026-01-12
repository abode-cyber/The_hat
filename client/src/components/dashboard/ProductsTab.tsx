import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2, Edit, Trash2, Image as ImageIcon, Package } from "lucide-react";
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

type Product = {
  id: number;
  merchantId: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  imageKey: string | null;
  stock: number | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface ProductsTabProps {
  merchant: Merchant;
}

export default function ProductsTab({ merchant }: ProductsTabProps) {
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [uploadedImageKey, setUploadedImageKey] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: 0,
  });

  const { data: products = [], isLoading } = trpc.product.getMyProducts.useQuery();

  const uploadImageMutation = trpc.product.uploadImage.useMutation({
    onSuccess: (data) => {
      setUploadedImageUrl(data.url);
      setUploadedImageKey(data.key);
      toast.success(t("تم رفع الصورة بنجاح", "Image uploaded successfully"));
    },
    onError: () => {
      toast.error(t("فشل رفع الصورة", "Failed to upload image"));
    },
  });

  const createProductMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      utils.product.getMyProducts.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success(t("تم إضافة المنتج بنجاح", "Product added successfully"));
    },
    onError: () => {
      toast.error(t("فشل إضافة المنتج", "Failed to add product"));
    },
  });

  const updateProductMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      utils.product.getMyProducts.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      toast.success(t("تم تحديث المنتج بنجاح", "Product updated successfully"));
    },
    onError: () => {
      toast.error(t("فشل تحديث المنتج", "Failed to update product"));
    },
  });

  const deleteProductMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      utils.product.getMyProducts.invalidate();
      toast.success(t("تم حذف المنتج بنجاح", "Product deleted successfully"));
    },
    onError: () => {
      toast.error(t("فشل حذف المنتج", "Failed to delete product"));
    },
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", stock: 0 });
    setImagePreview("");
    setUploadedImageUrl("");
    setUploadedImageKey("");
    setEditingProduct(null);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Compress and upload
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              uploadImageMutation.mutate({
                imageData: base64,
                mimeType: file.type,
              });
            };
            reader.readAsDataURL(blob);
          }
        },
        file.type,
        0.8
      );
    };

    img.src = URL.createObjectURL(file);
  };

  const handleAddProduct = () => {
    if (!formData.name || !formData.price) {
      toast.error(t("يرجى ملء جميع الحقول المطلوبة", "Please fill all required fields"));
      return;
    }

    createProductMutation.mutate({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      imageUrl: uploadedImageUrl,
      imageKey: uploadedImageKey,
      stock: formData.stock,
    });
  };

  const handleEditProduct = () => {
    if (!editingProduct || !formData.name || !formData.price) {
      toast.error(t("يرجى ملء جميع الحقول المطلوبة", "Please fill all required fields"));
      return;
    }

    updateProductMutation.mutate({
      id: editingProduct.id,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      imageUrl: uploadedImageUrl || editingProduct.imageUrl || undefined,
      imageKey: uploadedImageKey || editingProduct.imageKey || undefined,
      stock: formData.stock,
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock || 0,
    });
    setImagePreview(product.imageUrl || "");
    setUploadedImageUrl(product.imageUrl || "");
    setUploadedImageKey(product.imageKey || "");
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t("إدارة المنتجات", "Manage Products")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("أضف وعدل منتجاتك", "Add and edit your products")}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("إضافة منتج", "Add Product")}
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square relative bg-muted">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
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
                <span className="text-sm text-muted-foreground">
                  {t("المخزون:", "Stock:")} {product.stock}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => openEditDialog(product)}
                >
                  <Edit className="h-4 w-4" />
                  {t("تعديل", "Edit")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    if (confirm(t("هل أنت متأكد من حذف هذا المنتج؟", "Are you sure you want to delete this product?"))) {
                      deleteProductMutation.mutate({ id: product.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("حذف", "Delete")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {t("لا توجد منتجات بعد. ابدأ بإضافة منتجك الأول!", "No products yet. Start by adding your first product!")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("إضافة منتج جديد", "Add New Product")}</DialogTitle>
            <DialogDescription>
              {t("أضف منتج جديد إلى متجرك", "Add a new product to your store")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t("صورة المنتج", "Product Image")}</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("تغيير", "Change")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-32"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name">{t("اسم المنتج", "Product Name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("أدخل اسم المنتج", "Enter product name")}
              />
            </div>

            <div>
              <Label htmlFor="description">{t("الوصف", "Description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("أدخل وصف المنتج", "Enter product description")}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="price">{t("السعر", "Price")} *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="stock">{t("المخزون", "Stock")}</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button onClick={handleAddProduct} disabled={createProductMutation.isPending}>
              {createProductMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("إضافة", "Add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("تعديل المنتج", "Edit Product")}</DialogTitle>
            <DialogDescription>
              {t("عدل بيانات المنتج", "Edit product details")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t("صورة المنتج", "Product Image")}</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("تغيير", "Change")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-32"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-name">{t("اسم المنتج", "Product Name")} *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("أدخل اسم المنتج", "Enter product name")}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">{t("الوصف", "Description")}</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("أدخل وصف المنتج", "Enter product description")}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-price">{t("السعر", "Price")} *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="edit-stock">{t("المخزون", "Stock")}</Label>
              <Input
                id="edit-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button onClick={handleEditProduct} disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("حفظ", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

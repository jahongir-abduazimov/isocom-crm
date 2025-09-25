import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductComponentsStore } from "@/store/product-components.store";
import { useProductsStore } from "@/store/products.store";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface AddProductComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductComponentModal({
  isOpen,
  onClose,
}: AddProductComponentModalProps) {
  const { addProductComponent, loading, error } = useProductComponentsStore();
  const { products, fetchProducts } = useProductsStore();
  const { t } = useTranslation();

  // Form validation schema
  const formSchema = z.object({
    finished_product: z
      .string()
      .nonempty(t("productComponents.validation.finishedProductRequired")),
    semi_finished_product: z
      .string()
      .nonempty(t("productComponents.validation.semiFinishedProductRequired")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      finished_product: "",
      semi_finished_product: "",
    },
  });

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, fetchProducts]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await addProductComponent({
        finished_product: data.finished_product,
        semi_finished_product: data.semi_finished_product,
      });
      onClose();
    } catch (e) {
      // Error handled by Zustand store
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 relative">
        <div className="px-6 pt-4 pb-2 text-lg font-semibold">
          {t("productComponents.addComponent")}
        </div>
        <div className="px-6 py-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Finished Product Selection */}
            <div className="flex flex-col gap-2">
              <Label>{t("productComponents.finishedProduct")}</Label>
              <Select
                onValueChange={(val) => setValue("finished_product", val)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("productComponents.selectFinishedProduct")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter((product) => product.type === "FINISHED_PRODUCT")
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id!}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.finished_product && (
                <p className="text-red-500 text-sm">
                  {errors.finished_product.message}
                </p>
              )}
            </div>

            {/* Semi-finished Product Selection */}
            <div className="flex flex-col gap-2">
              <Label>{t("productComponents.semiFinishedProduct")}</Label>
              <Select
                onValueChange={(val) => setValue("semi_finished_product", val)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "productComponents.selectSemiFinishedProduct"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter(
                      (product) => product.type === "SEMI_FINISHED_PRODUCT"
                    )
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id!}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.semi_finished_product && (
                <p className="text-red-500 text-sm">
                  {errors.semi_finished_product.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                {t("products.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("products.saving") : t("products.save")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

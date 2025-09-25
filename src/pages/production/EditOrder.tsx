import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProductionStore } from "@/store/production.store";
import { useProductsStore } from "@/store/products.store";
import { notifySuccess, notifyError } from "@/lib/notification";
import { useTranslation } from "@/hooks/useTranslation";

// Form validation schema
const formSchema = z.object({
  produced_product: z.string().min(1, "Maxsulot tanlash majburiy"),
  unit_of_measure: z.string().min(1, "O'lchov birligi majburiy"),
  produced_quantity: z.string().min(1, "Ishlab chiqarish miqdori majburiy"),
  status: z.string().min(1, "Holat majburiy"),
  description: z
    .string()
    .min(5, "Tavsif kamida 5 ta belgidan iborat bo'lishi kerak"),
  start_date: z.string().min(1, "Boshlanish sanasi majburiy"),
  completion_date: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditOrderPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { selectedOrder, fetchOrderById, updateOrder, loading, error } =
    useProductionStore();
  const { products, fetchProducts } = useProductsStore();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      produced_product: "",
      unit_of_measure: "KG",
      produced_quantity: "",
      status: "PENDING",
      description: "",
      start_date: "",
      completion_date: "",
    },
  });

  // Watch form values for Select components
  const watchedValues = watch();

  // Fetch products and order data on component mount
  useEffect(() => {
    fetchProducts();
    if (id) {
      fetchOrderById(id);
    }
  }, [fetchProducts, fetchOrderById, id]);

  // Clear selectedOrder when component unmounts or when id changes
  useEffect(() => {
    return () => {
      // Clear selectedOrder when component unmounts
      useProductionStore.getState().setSelectedOrder(null);
    };
  }, []);

  // Clear selectedOrder when id changes to prevent showing old data
  useEffect(() => {
    useProductionStore.getState().setSelectedOrder(null);
  }, [id]);

  // Populate form when order data is loaded
  useEffect(() => {
    if (selectedOrder) {
      reset({
        produced_product: selectedOrder.produced_product || "",
        unit_of_measure: selectedOrder.unit_of_measure,
        produced_quantity: selectedOrder.produced_quantity,
        status: selectedOrder.status,
        description: selectedOrder.description,
        start_date: selectedOrder.start_date
          ? new Date(selectedOrder.start_date).toISOString().slice(0, 16)
          : "",
        completion_date: selectedOrder.completion_date
          ? new Date(selectedOrder.completion_date).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [selectedOrder, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;

    try {
      const orderData = {
        produced_product: data.produced_product,
        unit_of_measure: data.unit_of_measure,
        produced_quantity: data.produced_quantity,
        status: data.status as
          | "PENDING"
          | "IN_PROGRESS"
          | "COMPLETED"
          | "CANCELLED",
        description: data.description,
        start_date: data.start_date,
        completion_date: data.completion_date || null,
      };

      await updateOrder(id, orderData);
      notifySuccess(t("production.editOrder.orderUpdated"));
      navigate("/production/orders");
    } catch (e) {
      notifyError(t("production.editOrder.updateError"));
    }
  };

  if (loading || !selectedOrder) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("production.editOrder.loadingOrder")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedOrder && !loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Button
          variant={"ghost"}
          className="mb-5"
          onClick={() => navigate("/production/orders")}
        >
          <ArrowLeft />
          <span>Ortga</span>
        </Button>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">{t("production.editOrder.orderNotFound")}</h1>
          <p className="text-gray-600 mb-6">
            {t("production.editOrder.orderNotFoundDesc")}
          </p>
          <Button onClick={() => navigate("/production/orders")}>
            {t("production.editOrder.backToOrders")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/production/orders")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("production.editOrder.title")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("production.editOrder.subtitle")}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Produced Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="produced_product" className="text-sm font-medium">
                {t("production.addOrder.product")} *
              </Label>
              <Select
                onValueChange={(val) => setValue("produced_product", val)}
                value={watchedValues.produced_product || ""}
              >
                <SelectTrigger className={errors.produced_product ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("production.addOrder.selectProduct")} />
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
              {errors.produced_product && (
                <p className="text-red-500 text-xs">{errors.produced_product.message}</p>
              )}
            </div>

            {/* Unit of Measure */}
            <div className="space-y-2">
              <Label htmlFor="unit_of_measure" className="text-sm font-medium">
                {t("production.addOrder.unitOfMeasure")} *
              </Label>
              <Select
                onValueChange={(val) => setValue("unit_of_measure", val)}
                value={watchedValues.unit_of_measure || "KG"}
              >
                <SelectTrigger className={errors.unit_of_measure ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("production.addOrder.selectUnit")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">{t("production.addOrder.kilogram")}</SelectItem>
                  <SelectItem value="METER">{t("production.addOrder.meter")}</SelectItem>
                  <SelectItem value="METER_SQUARE">{t("production.addOrder.squareMeter")}</SelectItem>
                  <SelectItem value="METER_CUBIC">{t("production.addOrder.cubicMeter")}</SelectItem>
                  <SelectItem value="PIECE">{t("production.addOrder.piece")}</SelectItem>
                  <SelectItem value="LITER">{t("production.addOrder.liter")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit_of_measure && (
                <p className="text-red-500 text-xs">{errors.unit_of_measure.message}</p>
              )}
            </div>

            {/* Produced Quantity */}
            <div className="space-y-2">
              <Label htmlFor="produced_quantity" className="text-sm font-medium">
                {t("production.addOrder.quantity")} *
              </Label>
              <Input
                id="produced_quantity"
                placeholder={t("production.addOrder.enterQuantity")}
                className={errors.produced_quantity ? "border-red-500" : ""}
                {...register("produced_quantity")}
              />
              {errors.produced_quantity && (
                <p className="text-red-500 text-xs">{errors.produced_quantity.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                {t("production.addOrder.status")} *
              </Label>
              <Select
                onValueChange={(val) => setValue("status", val)}
                value={watchedValues.status || "PENDING"}
              >
                <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("production.addOrder.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">{t("production.orders.pending")}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t("production.orders.inProgress")}</SelectItem>
                  <SelectItem value="COMPLETED">{t("production.orders.completed")}</SelectItem>
                  <SelectItem value="CANCELLED">{t("production.orders.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-xs">{errors.status.message}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium">
                {t("production.addOrder.startDate")} *
              </Label>
              <Input
                id="start_date"
                type="datetime-local"
                className={errors.start_date ? "border-red-500" : ""}
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="text-red-500 text-xs">{errors.start_date.message}</p>
              )}
            </div>

            {/* Completion Date */}
            <div className="space-y-2">
              <Label htmlFor="completion_date" className="text-sm font-medium">
                {t("production.addOrder.completionDate")}
              </Label>
              <Input
                id="completion_date"
                type="datetime-local"
                className={errors.completion_date ? "border-red-500" : ""}
                {...register("completion_date")}
              />
              {errors.completion_date && (
                <p className="text-red-500 text-xs">{errors.completion_date.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("production.addOrder.description")} *
            </Label>
            <Textarea
              id="description"
              placeholder={t("production.addOrder.enterDescription")}
              rows={3}
              className={errors.description ? "border-red-500" : ""}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {loading ? t("production.editOrder.updating") : t("production.editOrder.updateOrder")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/production/orders")}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

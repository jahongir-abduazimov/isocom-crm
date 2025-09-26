import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useProductsStore } from "@/store/products.store";
import { useProductionStore } from "@/store/production.store";
import {
  ProductionService,
  type ProductionOutput,
} from "@/services/production.service";
import { notifySuccess, notifyError } from "@/lib/notification";
import { useTranslation } from "@/hooks/useTranslation";

// Form validation schema
const formSchema = z.object({
  step_execution: z.string().min(1, "Qadam bajarilishi majburiy"),
  product: z.string().min(1, "Maxsulot tanlash majburiy"),
  unit_of_measure: z.string().min(1, "O'lchov birligi majburiy"),
  quantity: z.string().min(1, "Miqdor majburiy"),
  weight: z.string().min(1, "Og'irlik majburiy"),
  quality_status: z.string().min(1, "Sifat holati majburiy"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddProductionOutputPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { products, fetchProducts } = useProductsStore();
  const { orders, fetchOrders } = useProductionStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      step_execution: "",
      product: "",
      unit_of_measure: "KG",
      quantity: "",
      weight: "",
      quality_status: "PASSED",
      notes: "",
    },
  });

  // Fetch data when component mounts
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders]);

  const onSubmit = async (data: FormValues) => {
    try {
      const outputData: Omit<ProductionOutput, "id" | "product_name"> = {
        step_execution: data.step_execution,
        product: data.product,
        unit_of_measure: data.unit_of_measure,
        quantity: data.quantity,
        weight: data.weight,
        quality_status: data.quality_status,
        notes: data.notes || "",
      };

      await ProductionService.createProductionOutput(outputData);
      notifySuccess(t("production.addOutput.outputCreated"));
      navigate("/production/outputs");
    } catch (err: any) {
      notifyError(t("production.addOutput.createError"));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/production/outputs")}
          className="flex items-center gap-2 w-fit"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("production.addOutput.title")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("production.addOutput.subtitle")}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Step Execution Selection */}
            <div className="space-y-2">
              <Label htmlFor="step_execution" className="text-sm font-medium">
                {t("production.addOutput.stepExecution")} *
              </Label>
              <Select onValueChange={(val) => setValue("step_execution", val)}>
                <SelectTrigger className={errors.step_execution ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("production.addOutput.selectStepExecution")} />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) =>
                    order.step_executions?.map((execution) => (
                      <SelectItem key={execution.id} value={execution.id}>
                        {order.produced_product_name} -{" "}
                        {execution.production_step_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.step_execution && (
                <p className="text-red-500 text-xs">{errors.step_execution.message}</p>
              )}
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product" className="text-sm font-medium">
                {t("production.addOutput.product")} *
              </Label>
              <Select onValueChange={(val) => setValue("product", val)}>
                <SelectTrigger className={errors.product ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("production.addOutput.selectProduct")} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id!}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.product && (
                <p className="text-red-500 text-xs">{errors.product.message}</p>
              )}
            </div>

            {/* Unit of Measure */}
            <div className="space-y-2">
              <Label htmlFor="unit_of_measure" className="text-sm font-medium">
                {t("production.addOutput.unitOfMeasure")} *
              </Label>
              <Select
                onValueChange={(val) => setValue("unit_of_measure", val)}
                defaultValue="KG"
              >
                <SelectTrigger className={errors.unit_of_measure ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("production.addOutput.selectUnit")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">{t("production.addOutput.kilogram")}</SelectItem>
                  <SelectItem value="METER">{t("production.addOutput.meter")}</SelectItem>
                  <SelectItem value="METER_SQUARE">{t("production.addOutput.squareMeter")}</SelectItem>
                  <SelectItem value="METER_CUBIC">{t("production.addOutput.cubicMeter")}</SelectItem>
                  <SelectItem value="PIECE">{t("production.addOutput.piece")}</SelectItem>
                  <SelectItem value="LITER">{t("production.addOutput.liter")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit_of_measure && (
                <p className="text-red-500 text-xs">{errors.unit_of_measure.message}</p>
              )}
            </div>

            {/* Quality Status */}
            <div className="space-y-2">
              <Label htmlFor="quality_status" className="text-sm font-medium">
                {t("production.addOutput.qualityStatus")} *
              </Label>
              <Select
                onValueChange={(val) => setValue("quality_status", val)}
                defaultValue="PASSED"
              >
                <SelectTrigger className={errors.quality_status ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("production.addOutput.selectQualityStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASSED">{t("production.addOutput.passed")}</SelectItem>
                  <SelectItem value="FAILED">{t("production.addOutput.failed")}</SelectItem>
                  <SelectItem value="PENDING">{t("production.addOutput.pending")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.quality_status && (
                <p className="text-red-500 text-xs">{errors.quality_status.message}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                {t("production.addOutput.quantity")} *
              </Label>
              <Input
                id="quantity"
                placeholder={t("production.addOutput.enterQuantity")}
                className={errors.quantity ? "border-red-500" : ""}
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs">{errors.quantity.message}</p>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium">
                {t("production.addOutput.weight")} *
              </Label>
              <Input
                id="weight"
                placeholder={t("production.addOutput.enterWeight")}
                className={errors.weight ? "border-red-500" : ""}
                {...register("weight")}
              />
              {errors.weight && (
                <p className="text-red-500 text-xs">{errors.weight.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              {t("production.addOutput.notes")}
            </Label>
            <Textarea
              id="notes"
              placeholder={t("production.addOutput.enterNotes")}
              rows={3}
              {...register("notes")}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="submit"
              className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[120px]"
            >
              {t("production.addOutput.createOutput")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/production/outputs")}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

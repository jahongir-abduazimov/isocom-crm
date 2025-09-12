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
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProductionStore } from "@/store/production.store";
import { useProductsStore } from "@/store/products.store";
import { notifySuccess, notifyError } from "@/lib/notification";

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

export default function AddOrderPage() {
  const navigate = useNavigate();
  const { createOrder, loading, error } = useProductionStore();
  const { products, fetchProducts } = useProductsStore();

  const {
    register,
    handleSubmit,
    setValue,
    // watch,
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

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onSubmit = async (data: FormValues) => {
    try {
      const orderData = {
        produced_product: data.produced_product,
        unit_of_measure: data.unit_of_measure,
        produced_quantity: data.produced_quantity,
        operators: [],
        operators_names: [],
        status: data.status as
          | "PENDING"
          | "IN_PROGRESS"
          | "COMPLETED"
          | "CANCELLED",
        description: data.description,
        start_date: data.start_date,
        completion_date: data.completion_date || null,
        used_materials: [],
        step_executions: [],
        completion_percentage: 0,
        current_step: {} as any, // This will be set by the backend
      };

      await createOrder(orderData);
      notifySuccess("Buyurtma muvaffaqiyatli yaratildi!");
      navigate("/production/orders");
    } catch (e) {
      notifyError("Buyurtma yaratishda xatolik yuz berdi");
    }
  };

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
            Create New Order
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Create a new production order
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
                Product *
              </Label>
              <Select onValueChange={(val) => setValue("produced_product", val)}>
                <SelectTrigger className={errors.produced_product ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select product" />
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
                Unit of Measure *
              </Label>
              <Select
                onValueChange={(val) => setValue("unit_of_measure", val)}
                defaultValue="KG"
              >
                <SelectTrigger className={errors.unit_of_measure ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">Kilogram</SelectItem>
                  <SelectItem value="METER">Meter</SelectItem>
                  <SelectItem value="METER_SQUARE">Square Meter</SelectItem>
                  <SelectItem value="METER_CUBIC">Cubic Meter</SelectItem>
                  <SelectItem value="PIECE">Piece</SelectItem>
                  <SelectItem value="LITER">Liter</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit_of_measure && (
                <p className="text-red-500 text-xs">{errors.unit_of_measure.message}</p>
              )}
            </div>

            {/* Produced Quantity */}
            <div className="space-y-2">
              <Label htmlFor="produced_quantity" className="text-sm font-medium">
                Quantity *
              </Label>
              <Input
                id="produced_quantity"
                placeholder="Enter quantity"
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
                Status *
              </Label>
              <Select
                onValueChange={(val) => setValue("status", val)}
                defaultValue="PENDING"
              >
                <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-xs">{errors.status.message}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium">
                Start Date *
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
                Completion Date
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
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Enter order description"
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
              {loading ? "Creating..." : "Create Order"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/production/orders")}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

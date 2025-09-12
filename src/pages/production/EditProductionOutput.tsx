import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditProductionOutputPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { products, fetchProducts } = useProductsStore();
    const { orders, fetchOrders } = useProductionStore();
    const [loading, setLoading] = useState(true);
    const [output, setOutput] = useState<ProductionOutput | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
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
        const fetchData = async () => {
            try {
                setLoading(true);
                await Promise.all([fetchProducts(), fetchOrders()]);

                if (id) {
                    const outputData = await ProductionService.getProductionOutputById(id);
                    setOutput(outputData);

                    // Populate form with existing data
                    reset({
                        step_execution: outputData.step_execution,
                        product: outputData.product,
                        unit_of_measure: outputData.unit_of_measure,
                        quantity: outputData.quantity,
                        weight: outputData.weight,
                        quality_status: outputData.quality_status,
                        notes: outputData.notes || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                notifyError("Ma'lumotlarni yuklashda xatolik yuz berdi");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, fetchProducts, fetchOrders, reset]);

    const onSubmit = async (data: FormValues) => {
        if (!id) return;

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

            await ProductionService.updateProductionOutput(id, outputData);
            notifySuccess("Ishlab chiqarish natijasi muvaffaqiyatli yangilandi!");
            navigate("/production/outputs");
        } catch (err: any) {
            notifyError("Ishlab chiqarish natijasini yangilashda xatolik yuz berdi");
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    if (!output) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="text-center py-12">
                    <p className="text-red-500 text-lg">
                        Ishlab chiqarish natijasi topilmadi
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/production/outputs")}
                        className="mt-4"
                    >
                        Ortga qaytish
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
                    onClick={() => navigate("/production/outputs")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        Edit Production Output
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm lg:text-base">
                        Update production output details
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Step Execution Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="step_execution" className="text-sm font-medium">
                                Step Execution *
                            </Label>
                            <Select
                                onValueChange={(val) => setValue("step_execution", val)}
                                defaultValue={output.step_execution}
                            >
                                <SelectTrigger className={errors.step_execution ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select step execution" />
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
                                Product *
                            </Label>
                            <Select
                                onValueChange={(val) => setValue("product", val)}
                                defaultValue={output.product}
                            >
                                <SelectTrigger className={errors.product ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select product" />
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
                                Unit of Measure *
                            </Label>
                            <Select
                                onValueChange={(val) => setValue("unit_of_measure", val)}
                                defaultValue={output.unit_of_measure}
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

                        {/* Quality Status */}
                        <div className="space-y-2">
                            <Label htmlFor="quality_status" className="text-sm font-medium">
                                Quality Status *
                            </Label>
                            <Select
                                onValueChange={(val) => setValue("quality_status", val)}
                                defaultValue={output.quality_status}
                            >
                                <SelectTrigger className={errors.quality_status ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select quality status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PASSED">Passed</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.quality_status && (
                                <p className="text-red-500 text-xs">{errors.quality_status.message}</p>
                            )}
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-sm font-medium">
                                Quantity *
                            </Label>
                            <Input
                                id="quantity"
                                placeholder="Enter quantity"
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
                                Weight (kg) *
                            </Label>
                            <Input
                                id="weight"
                                placeholder="Enter weight"
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
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Enter additional notes"
                            rows={3}
                            {...register("notes")}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                        <Button
                            type="submit"
                            className="flex items-center gap-2 w-full sm:w-auto"
                        >
                            Update Output
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/production/outputs")}
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

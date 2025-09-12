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
import { notifySuccess, notifyError } from "@/lib/notification";

// Form validation schema
const formSchema = z.object({
    finished_product: z.string().nonempty("Tayyor maxsulot tanlanishi kerak"),
    semi_finished_product: z.string().nonempty("Yarim tayyor maxsulot tanlanishi kerak"),
}).refine(data => data.finished_product !== data.semi_finished_product, {
    message: "Tayyor va yarim tayyor maxsulot bir xil bo'lishi mumkin emas",
    path: ["semi_finished_product"],
});

type FormValues = z.infer<typeof formSchema>;

interface EditProductComponentModalProps {
    isOpen: boolean;
    onClose: () => void;
    componentId: string | null;
}

export default function EditProductComponentModal({
    isOpen,
    onClose,
    componentId,
}: EditProductComponentModalProps) {
    const { updateProductComponent, productComponents, loading, error } = useProductComponentsStore();
    const { products, fetchProducts } = useProductsStore();

    const {
        setValue,
        reset,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            finished_product: "",
            semi_finished_product: "",
        },
    });

    const watchedValues = watch();

    // Get current component data
    const currentComponent = componentId ? productComponents.find(c => c.id === componentId) : null;

    // Fetch products when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen, fetchProducts]);

    // Set form values when component data is available
    useEffect(() => {
        if (isOpen && currentComponent) {
            setValue("finished_product", currentComponent.finished_product, { shouldValidate: true });
            setValue("semi_finished_product", currentComponent.semi_finished_product, { shouldValidate: true });
        }
    }, [isOpen, currentComponent, setValue]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            reset({
                finished_product: "",
                semi_finished_product: "",
            });
        }
    }, [isOpen, reset]);

    const onSubmit = async (data: FormValues) => {
        if (!componentId) {
            notifyError("Komponent ID topilmadi");
            return;
        }

        try {
            const success = await updateProductComponent(componentId, {
                finished_product: data.finished_product,
                semi_finished_product: data.semi_finished_product,
            });

            if (success) {
                notifySuccess("Komponent muvaffaqiyatli tahrirlandi!");
                onClose();
            } else {
                notifyError("Komponent tahrirlanmadi yoki xatolik yuz berdi");
            }
        } catch (e) {
            notifyError("Xatolik yuz berdi");
        }
    };

    if (!isOpen) return null;

    // Get product options
    const finishedProducts = products.filter(p => p.type === "FINISHED_PRODUCT");
    const semiFinishedProducts = products.filter(p => p.type === "SEMI_FINISHED_PRODUCT");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 relative">
                <div className="px-6 pt-4 pb-2 text-lg font-semibold">
                    Komponentni tahrirlash
                </div>
                <div className="px-6 py-2">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        {/* Finished Product Selection */}
                        <div className="flex flex-col gap-2">
                            <Label>Tayyor maxsulot</Label>
                            <Select
                                key={`finished-${componentId}-${watchedValues.finished_product}`}
                                value={watchedValues.finished_product || ""}
                                onValueChange={(val) => setValue("finished_product", val, { shouldValidate: true })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tayyor maxsulot tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {finishedProducts.map((product) => (
                                        <SelectItem key={product.id} value={product.id!}>
                                            {product.name} ({product.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.finished_product && (
                                <p className="text-red-500 text-sm">
                                    {errors.finished_product.message}
                                </p>
                            )}
                            {finishedProducts.length === 0 && (
                                <p className="text-yellow-600 text-xs">
                                    Tayyor maxsulotlar topilmadi. Avval tayyor maxsulot yarating.
                                </p>
                            )}
                        </div>

                        {/* Semi-finished Product Selection */}
                        <div className="flex flex-col gap-2">
                            <Label>Yarim tayyor maxsulot</Label>
                            <Select
                                key={`semi-${componentId}-${watchedValues.semi_finished_product}`}
                                value={watchedValues.semi_finished_product || ""}
                                onValueChange={(val) => setValue("semi_finished_product", val, { shouldValidate: true })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Yarim tayyor maxsulot tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semiFinishedProducts.map((product) => (
                                        <SelectItem key={product.id} value={product.id!}>
                                            {product.name} ({product.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.semi_finished_product && (
                                <p className="text-red-500 text-sm">
                                    {errors.semi_finished_product.message}
                                </p>
                            )}
                            {semiFinishedProducts.length === 0 && (
                                <p className="text-yellow-600 text-xs">
                                    Yarim tayyor maxsulotlar topilmadi. Avval yarim tayyor maxsulot yarating.
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
                                Bekor qilish
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || finishedProducts.length === 0 || semiFinishedProducts.length === 0}
                            >
                                {loading ? "Saqlanmoqda..." : "Saqlash"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkerStore } from "@/store/worker.store";
import { showNotification } from "@/lib/notification";
import SuccessModal from "@/components/ui/success-modal";

export default function ConfirmationPage() {
  const { id, stepId } = useParams<{ id: string; stepId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    selectedOperator,
    selectedOrder,
    selectedStep,
    selectedItems,
    submitBulkCreate,
    clearSelectedItems,
  } = useWorkerStore();

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      showNotification("Kamida bitta element tanlanishi kerak!", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitBulkCreate();

      if (result.success && result.data) {
        // Show success modal instead of toast
        setSuccessMessage(result.data.message || "Material ishlatish ma'lumotlari muvaffaqiyatli saqlandi!");
        setShowSuccessModal(true);
      } else {
        showNotification(result.error || "Xato yuz berdi", "error");
      }
    } catch (error) {
      showNotification("Server bilan bog'lanishda xato!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/worker/orders/${id}/steps/${stepId}`);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Clear selected items and navigate back
    clearSelectedItems();
    navigate("/worker/orders");
  };

  if (
    !selectedOperator ||
    !selectedOrder ||
    !selectedStep ||
    selectedItems.length === 0
  ) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Ma'lumotlar topilmadi</h1>
        <p className="text-gray-600 mb-6">
          Tasdiqlash uchun kerakli ma'lumotlar mavjud emas
        </p>
        <Button onClick={() => navigate("/worker/orders")}>
          Buyurtmalar ro'yxatiga qaytish
        </Button>
      </div>
    );
  }

  const totalItems = selectedItems.length;
  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Tasdiqlash
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Material ishlatish ma'lumotlarini tekshiring va tasdiqlang
            </p>
          </div>
        </div>
      </div>

      {/* Operator Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Operator ma'lumotlari
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Operator ismi</p>
            <p className="font-medium text-gray-900">
              {selectedOperator.first_name && selectedOperator.last_name
                ? `${selectedOperator.first_name} ${selectedOperator.last_name}`
                : selectedOperator.username || selectedOperator.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-gray-900">
              {selectedOperator.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Rol</p>
            <p className="font-medium text-gray-900">{selectedOperator.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Workcenter</p>
            <p className="font-medium text-gray-900">
              {selectedOperator.work_center || "Yo'q"}
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Buyurtma ma'lumotlari
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Mahsulot nomi</p>
            <p className="font-medium text-gray-900">
              {selectedOrder.produced_product__name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Buyurtma ID</p>
            <p className="font-medium text-gray-900">
              {selectedOrder.id.slice(0, 8)}...
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Miqdor</p>
            <p className="font-medium text-gray-900">
              {selectedOrder.produced_quantity}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Holat</p>
            <p className="font-medium text-gray-900">{selectedOrder.status}</p>
          </div>
        </div>
      </div>

      {/* Step Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Qadam ma'lumotlari
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Qadam nomi</p>
            <p className="font-medium text-gray-900">{selectedStep.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Qadam turi</p>
            <p className="font-medium text-gray-900">
              {selectedStep.step_type}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Workcenter</p>
            <p className="font-medium text-gray-900">
              {selectedStep.work_center_name || "Yo'q"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Davomiyligi</p>
            <p className="font-medium text-gray-900">
              {selectedStep.duration_hours
                ? `${selectedStep.duration_hours} soat`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Items Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Tanlangan elementlar ({totalItems})
          </h2>
        </div>

        <div className="space-y-3">
          {selectedItems.map((item, index) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.type === "material" ? "Material" : "Mahsulot"} •
                    Mavjud: {item.available_quantity} {item.unit_of_measure || "PIECE"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {item.quantity} {item.unit_of_measure || "PIECE"}
                </p>
                <p className="text-sm text-gray-600">
                  {item.type === "material" ? "Material" : "Mahsulot"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
              <p className="text-sm text-gray-600">Jami elementlar</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {totalQuantity}
              </p>
              <p className="text-sm text-gray-600">Jami miqdor</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {
                  selectedItems.filter((item) => item.type === "material")
                    .length
                }
              </p>
              <p className="text-sm text-gray-600">Materiallar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Yuborilmoqda...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Tasdiqlash va yuborish
            </>
          )}
        </Button>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900 mb-1">Diqqat</h4>
            <p className="text-sm text-yellow-700">
              Bu amalni bajarishdan so'ng, material ishlatish ma'lumotlari
              saqlanadi va buyurtma holati o'zgarishi mumkin. Amalni bekor
              qilish mumkin emas.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        onConfirm={handleSuccessModalClose}
        title="Muvaffaqiyat!"
        message={successMessage}
        confirmText="Davom etish"
      />
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ArrowRight,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkerStore } from "@/store/worker.store";

export default function WorkerDashboardPage() {
  const navigate = useNavigate();
  const { fetchOrders, ordersLoading, ordersError } = useWorkerStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStartWorkflow = () => {
    navigate("/worker/orders");
  };

  if (ordersLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Ma'lumotlar yuklanmoqda...</span>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Xato</h1>
        <p className="text-gray-600 mb-6">{ordersError}</p>
        <Button onClick={() => fetchOrders()}>Qayta urinish</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Operator paneli
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Material ishlatish jarayonini boshqarish uchun operator paneliga xush
          kelibsiz
        </p>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Usage Card */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Material ishlatish
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Ishlab chiqarish buyurtmalari uchun material va mahsulot ishlatish
              jarayonini boshqaring
            </p>
            <div className="flex justify-end">
              <Button
                onClick={handleStartWorkflow}
                size="lg"
                className="flex items-center gap-2"
              >
                Jarayonni boshlash
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bunker Management Card */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ekstruder Baklar
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Ekstruder baklarini boshqarish, to'ldirish va smena jarayonlarini kuzatish
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => navigate("/worker/bunkers")}
                size="lg"
                variant="outline"
                className="flex items-center gap-2"
              >
                Baklar boshqaruvi
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">
            1. Buyurtma tanlash
          </h3>
          <p className="text-xs text-gray-600">
            Ishlab chiqarish buyurtmasini tanlang
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">
            2. Qadam tanlash
          </h3>
          <p className="text-xs text-gray-600">
            Ishlab chiqarish qadamini tanlang
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">
            3. Material tanlash
          </h3>
          <p className="text-xs text-gray-600">
            Material va mahsulotlarni tanlang
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">
            4. Tasdiqlash
          </h3>
          <p className="text-xs text-gray-600">
            Ma'lumotlarni tekshiring va tasdiqlang
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Ruxsat etilgan rollar
              </h4>
              <p className="text-sm text-blue-700">
                Bu panel faqat quyidagi rollarga ega foydalanuvchilar uchun:
                WORKER, SMENA_BOSHLIGI, KATTA_MUTAXASSIS, KICHIK_MUTAXASSIS,
                STAJER
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900 mb-1">
                Jarayon haqida
              </h4>
              <p className="text-sm text-green-700">
                Material ishlatish jarayoni 4 bosqichdan iborat. Operator tanlash
                global bo'lib, tizimga kirganda avtomatik ravishda amalga oshiriladi.
                Har bir bosqichda kerakli ma'lumotlarni to'ldiring va keyingi bosqichga
                o'ting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

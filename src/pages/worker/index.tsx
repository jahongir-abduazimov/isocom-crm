import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkerStore } from "@/store/worker.store";
// import QuickAccessMenu from "@/components/ui/quick-access-menu";

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
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-10">
          Operator paneli
        </h1>
      </div>

      {/* Main Action Cards - Compact 3 in a row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Material Usage Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col items-center justify-between h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Material ishlatish
              </h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Ishlab chiqarish buyurtmalari uchun material va mahsulot
                ishlatish jarayonini boshqaring
              </p>
            </div>
            <Button
              onClick={handleStartWorkflow}
              size="sm"
              variant="outline"
              className="w-full h-10 text-sm font-semibold border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center gap-1 rounded-lg"
            >
              Jarayonni boshlash
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Production Outputs Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col items-center justify-between h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Ishlab chiqarish natijalari
              </h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Ishlab chiqarish natijalarini ko'rish va yangi natijalar
                qo'shish
              </p>
            </div>
            <Button
              onClick={() => navigate("/worker/production-outputs")}
              size="sm"
              variant="outline"
              className="w-full h-10 text-sm font-semibold border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white flex items-center justify-center gap-1 rounded-lg"
            >
              Natijalarni ko'rish
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bunker Management Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col items-center justify-between h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Ekstruder Baklar
              </h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Ekstruder baklarini boshqarish, to'ldirish va smena
                jarayonlarini kuzatish
              </p>
            </div>
            <Button
              onClick={() => navigate("/worker/bunkers/list")}
              size="sm"
              variant="outline"
              className="w-full h-10 text-sm font-semibold border border-green-600 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center gap-1 rounded-lg"
            >
              Baklar boshqaruvi
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Access Menu */}
      {/* <QuickAccessMenu /> */}
    </div>
  );
}

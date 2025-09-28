import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Factory,
  TrendingUp,
  List,
  BarChart3,
  RefreshCw,
  Play,
} from "lucide-react";
import { useScrapStore } from "@/store/scrap.store";
import { useRecyclingStore } from "@/store/recycling.store";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ScrapIndexPage() {
  const navigate = useNavigate();
  const { realTimeData, statistics, loading, refreshData } = useScrapStore();
  const { currentBatch, currentTotals, startRecyclingBatch, getCurrentTotals, fetchRecyclingBatches } =
    useRecyclingStore();
  const [startingBatch, setStartingBatch] = useState(false);

  // Avtomatik ma'lumotlarni yuklash sahifaga kirganda
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Scrap ma'lumotlarini yuklash
        await refreshData();
        // Recycling ma'lumotlarini yuklash
        await Promise.all([
          getCurrentTotals(),
          fetchRecyclingBatches()
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [refreshData, getCurrentTotals, fetchRecyclingBatches]);

  const handleStartRecycling = async () => {
    setStartingBatch(true);
    try {
      const success = await startRecyclingBatch();
      if (success) {
        toast.success("Qayta ishlash partiyasi boshlandi!");
        navigate("/scrap/recycling-workflow");
      } else {
        toast.error("Qayta ishlashni boshlashda xatolik yuz berdi");
      }
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setStartingBatch(false);
    }
  };

  const menuItems = [
    {
      title: "Brak Ro'yxati",
      description: "Barcha brak materiallarni ko'rish va boshqarish",
      icon: <List className="h-8 w-8" />,
      color: "bg-blue-500",
      href: "/scrap/scrap-list",
      badge: realTimeData
        ? `${realTimeData.today_total.total_weight} kg`
        : "0 kg",
    },
    {
      title: "Dashboard",
      description: "Real-time brak monitoring va statistikasi",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "bg-green-500",
      href: "/scrap/scrap-dashboard",
      badge: statistics ? `${statistics.total_quantity} kg` : "0 kg",
    },
    {
      title: "Qayta Ishlash Jarayoni",
      description: "To'liq qayta ishlash workflow boshqaruvi",
      icon: <RefreshCw className="h-8 w-8" />,
      color: "bg-purple-500",
      href: "/scrap/recycling-workflow",
      badge: currentBatch ? "Faol" : "Kutilmoqda",
    },
    {
      title: "Eski Qayta Ishlash",
      description: "Legacy qayta ishlash tizimi (eski ma'lumotlar)",
      icon: <Factory className="h-8 w-8" />,
      color: "bg-gray-500",
      href: "/scrap/reprocessing",
      badge: "Legacy",
    },
  ];

  const canStartRecycling =
    currentTotals &&
    (currentTotals.hard_scrap > 0 || currentTotals.soft_scrap > 0) &&
    !currentBatch;

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brak Tizimi</h1>
          <p className="text-gray-600 mt-2">
            Brak materiallar boshqaruvi va qayta ishlash tizimi
          </p>
        </div>
        <Button
          onClick={() => refreshData()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Yangilash
        </Button>
      </div>

      {/* Joriy holat kartasi */}
      {currentTotals && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Package className="h-5 w-5" />
              Joriy Brak Holati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <Factory className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-red-600">
                  {currentTotals.hard_scrap} kg
                </div>
                <div className="text-sm text-red-800">Qattiq Brak</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-blue-600">
                  {currentTotals.soft_scrap} kg
                </div>
                <div className="text-sm text-blue-800">Yumshoq Brak</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-600">
                  {(
                    currentTotals.hard_scrap + currentTotals.soft_scrap
                  ).toFixed(1)}{" "}
                  kg
                </div>
                <div className="text-sm text-green-800">Jami Og'irlik</div>
              </div>
            </div>

            {canStartRecycling && (
              <div className="mt-6 text-center">
                <Button
                  onClick={handleStartRecycling}
                  disabled={startingBatch}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  {startingBatch
                    ? "Boshlanmoqda..."
                    : "Qayta Ishlashni Boshlash"}
                </Button>
              </div>
            )}

            {currentBatch && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Faol Partiya: {currentBatch.batch_number}
                    </h3>
                    <p className="text-sm text-blue-700">
                      Holat: {currentBatch.status_display}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/scrap/recycling-workflow")}
                    variant="outline"
                    size="sm"
                  >
                    Ko'rish
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Asosiy menyu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            onClick={() => navigate(item.href)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${item.color} text-white`}>
                  {item.icon}
                </div>
                <Badge
                  variant={item.badge === "Legacy" ? "secondary" : "default"}
                  className={
                    item.badge === "Faol" ? "bg-green-100 text-green-800" : ""
                  }
                >
                  {item.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ma'lumot yo'q */}
      {!loading && !currentTotals && !realTimeData && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ma'lumotlar mavjud emas
            </h3>
            <p className="text-gray-600 mb-4">
              Brak ma'lumotlari hali yuklanmagan yoki mavjud emas
            </p>
            <Button onClick={() => refreshData()} variant="outline">
              Ma'lumotlarni Yuklash
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Yükleme holati */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
          </div>
        </div>
      )}
    </div>
  );
}

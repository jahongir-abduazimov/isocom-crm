import { useState, useEffect } from "react";
import {
  Factory,
  Package,
  TrendingUp,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScrapStore } from "@/store/scrap.store";
import { toast } from "sonner";

export default function ScrapDashboard() {
  const {
    realTimeData,
    statistics,
    loading,
    error,
    getRealTimeScrap,
    getScrapStatistics,
    refreshData,
    clearError,
  } = useScrapStore();

  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([getRealTimeScrap(), getScrapStatistics()]);
    };

    loadData();
  }, [getRealTimeScrap, getScrapStatistics]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Avtomatik yangilash
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      await refreshData();
    }, 30000); // 30 soniya

    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  const handleRefresh = async () => {
    await refreshData();
    toast.success("Ma'lumotlar yangilandi");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "IN_DROBIL":
        return <Activity className="h-4 w-4 text-blue-600" />;
      case "RECYCLED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "MOVED":
        return <Package className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading && !realTimeData && !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Dashboard ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sarlavha va boshqaruv */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brak Dashboard</h1>
          <p className="text-gray-600">
            Real-time brak monitoring va statistikasi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {autoRefresh ? "Avtomatik" : "Qo'lda"}
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Bugungi umumiy ma'lumotlar */}
      {realTimeData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qattiq Brak</CardTitle>
              <Factory className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {realTimeData.today_total.hard_scrap} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Bugungi jami qattiq brak
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Yumshoq Brak
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {realTimeData.today_total.soft_scrap} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Bugungi jami yumshoq brak
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jami Og'irlik
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {realTimeData.today_total.total_weight} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Bugungi jami brak og'irligi
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ishlab chiqarish joylari bo'yicha taqsimlash */}
      {realTimeData && Object.keys(realTimeData.by_workcenter).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Ishlab Chiqarish Joylari Bo'yicha Braklar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(realTimeData.by_workcenter).map(
                ([workcenter, data]) => (
                  <div
                    key={workcenter}
                    className="bg-gray-50 rounded-lg p-4 border"
                  >
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {workcenter}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Qattiq:</span>
                        <Badge
                          variant="outline"
                          className="text-red-600 border-red-200"
                        >
                          {data.hard_scrap} kg
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Yumshoq:</span>
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-200"
                        >
                          {data.soft_scrap} kg
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-medium text-gray-900">
                          Jami:
                        </span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {data.total_weight} kg
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Umumiy statistikalar */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jami Braklar
              </CardTitle>
              <Package className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.by_type?.reduce((total, type) => total + type.count, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Barcha vaqtlar uchun
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kutilmoqda</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.by_status?.find(s => s.status === 'PENDING')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Qayta ishlash uchun
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Qayta Ishlangan
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.by_status?.find(s => s.status === 'RECYCLED')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Muvaffaqiyatli qayta ishlangan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Samaradorlik
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.total_weight > 0 ? ((statistics.by_status?.find(s => s.status === 'RECYCLED')?.total_weight || 0) / statistics.total_weight * 100).toFixed(1) : "0.0"}%
              </div>
              <p className="text-xs text-muted-foreground">
                Qayta ishlash samaradorligi
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Holatlar bo'yicha taqsimlash */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Braklar Holati Bo'yicha Taqsimlash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon("PENDING")}
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {statistics.by_status?.find(s => s.status === 'PENDING')?.count || 0}
                </div>
                <div className="text-sm text-yellow-800">Kutilmoqda</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon("IN_DROBIL")}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.by_status?.find(s => s.status === 'IN_DROBIL')?.count || 0}
                </div>
                <div className="text-sm text-blue-800">Drobilkada</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon("RECYCLED")}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {statistics.by_status?.find(s => s.status === 'RECYCLED')?.count || 0}
                </div>
                <div className="text-sm text-green-800">Qayta Ishlangan</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon("MOVED")}
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {statistics.by_status?.find(s => s.status === 'MOVED')?.count || 0}
                </div>
                <div className="text-sm text-gray-800">VT ga O'tkazilgan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ma'lumot yo'q */}
      {!loading && !realTimeData && !statistics && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ma'lumotlar mavjud emas
          </h3>
          <p className="text-gray-600">Brak ma'lumotlari hali yuklanmagan</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            Ma'lumotlarni Yuklash
          </Button>
        </div>
      )}
    </div>
  );
}

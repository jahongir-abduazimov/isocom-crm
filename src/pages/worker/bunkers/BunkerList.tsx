import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bunkerService, type Bunker } from "@/services/bunker.service";

const BunkerList: React.FC = () => {
  const [bunkers, setBunkers] = useState<Bunker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBunkers();
  }, []);

  const fetchBunkers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await bunkerService.fetchBunkers();
      setBunkers(data);
    } catch (error) {
      console.error("Error fetching bunkers:", error);
      setError("Baklar ma'lumotlarini olishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const getFillPercentage = (current: string, capacity: string) => {
    const currentNum = parseFloat(current);
    const capacityNum = parseFloat(capacity);
    return capacityNum > 0 ? (currentNum / capacityNum) * 100 : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Baklar yuklanmoqda...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Xato</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={fetchBunkers}>Qayta urinish</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ekstruder Baklar</h1>
          <p className="text-gray-600 mt-2">
            Barcha ekstruder baklarining holati va ma'lumotlari
          </p>
        </div>
        <Button onClick={fetchBunkers} variant="outline">
          Yangilash
        </Button>
      </div>

      {/* Bunkers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bunkers.map((bunker) => {
          const fillPercentage = getFillPercentage(
            bunker.current_level_kg,
            bunker.capacity_kg
          );

          return (
            <div
              key={bunker.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              {/* Bunker Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {bunker.bunker_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {bunker.work_center_name}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bunker.is_filled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {bunker.is_filled ? "To'ldirilgan" : "Bo'sh"}
                </div>
              </div>

              {/* Capacity Info */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Hajm
                  </span>
                  <span className="text-sm text-gray-600">
                    {parseFloat(bunker.current_level_kg).toFixed(1)}/
                    {bunker.capacity_kg}kg
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressColor(
                      fillPercentage
                    )}`}
                    style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {fillPercentage.toFixed(1)}% to'ldirilgan
                  </span>
                  <span className="text-xs text-gray-500">
                    {(
                      parseFloat(bunker.capacity_kg) -
                      parseFloat(bunker.current_level_kg)
                    ).toFixed(1)}
                    kg bo'sh
                  </span>
                </div>
              </div>

              {/* Material Type */}
              {bunker.material_type && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600">Material: </span>
                  <span className="text-sm font-medium text-gray-900">
                    {bunker.material_type}
                  </span>
                </div>
              )}

              {/* Last Filled */}
              {bunker.filled_at && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600">
                    Oxirgi to'ldirish:{" "}
                  </span>
                  <span className="text-sm text-gray-900">
                    {new Date(bunker.filled_at).toLocaleString("uz-UZ")}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    (window.location.href = `/worker/bunkers/${bunker.id}/fill`)
                  }
                >
                  To'ldirish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `/worker/bunkers/${bunker.id}/status`)
                  }
                >
                  Holat
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {bunkers.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Baklar topilmadi
          </h3>
          <p className="text-gray-600">
            Hozircha hech qanday ekstruder bak mavjud emas
          </p>
        </div>
      )}
    </div>
  );
};

export default BunkerList;

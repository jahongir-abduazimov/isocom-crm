import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bunkerService, type Bunker } from "@/services/bunker.service";
import { useNavigate } from "react-router-dom";

const BunkerList: React.FC = () => {
  const [bunkers, setBunkers] = useState<Bunker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/worker")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Orqaga
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ekstruder Baklar</h1>
          <p className="text-gray-600 mt-2">
            Barcha ekstruder baklarining holati va ma'lumotlari
          </p>
        </div>
        </div>
        <Button onClick={fetchBunkers} variant="outline">
          Yangilash
        </Button>
      </div>

      {/* Bunkers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bunkers.map((bunker) => {
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
              </div>

              {/* Capacity Info */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Hajm
                  </span>
                  <span className="text-sm text-gray-600">
                    {bunker.capacity_kg}kg
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
              <div className="space-y-2">
                <Button
                  size="sm"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() =>
                    (window.location.href = `/worker/bunkers/${bunker.id}/end-shift`)
                  }
                >
                  Smena Oxiri To'ldirish
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

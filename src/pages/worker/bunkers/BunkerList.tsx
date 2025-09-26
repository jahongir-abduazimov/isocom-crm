import React, { useEffect } from "react";
import { Loader2, AlertCircle, Package, ArrowLeft, Container as ContainerIcon, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBunkerStore } from "@/store/bunker.store";
import { useNavigate } from "react-router-dom";

const BunkerList: React.FC = () => {
  const navigate = useNavigate();
  const {
    bunkers,
    bunkersLoading,
    bunkersError,
    fetchBunkers
  } = useBunkerStore();

  useEffect(() => {
    fetchBunkers();
  }, [fetchBunkers]);

  if (bunkersLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Baklar yuklanmoqda...</span>
      </div>
    );
  }

  if (bunkersError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Xato</h1>
        <p className="text-gray-600 mb-6">{bunkersError}</p>
        <Button onClick={fetchBunkers}>Qayta urinish</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
      {bunkers.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Baklar mavjud emas
          </h2>
          <p className="text-gray-500 mb-6">
            Hali hech qanday bunker yaratilmagan
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bunkers.map((bunker) => (
            <Card key={bunker.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    {bunker.name}
                  </CardTitle>
                  <Badge
                    variant={bunker.is_filled ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {bunker.is_filled ? "To'ldirilgan" : "Bo'sh"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Work Center</p>
                    <p className="font-semibold">{bunker.work_center_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Sig'im</p>
                    <p className="font-semibold">{bunker.capacity_kg} kg</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-500">Holat</span>
                    <span className="font-semibold">
                      {bunker.is_filled ? "To'ldirilgan" : "Bo'sh"}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/worker/bunkers/${bunker.id}/status`)}
                      className="flex-1 flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Holat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/worker/bunkers/${bunker.id}/containers`)}
                      className="flex-1 flex items-center gap-1"
                    >
                      <ContainerIcon size={14} />
                      Containerlar
                    </Button>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/worker/bunkers/${bunker.id}/fill`)}
                      className="flex-1"
                    >
                      To'ldirish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/worker/bunkers/${bunker.id}/containers/add`)}
                      className="flex items-center gap-1"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BunkerList;

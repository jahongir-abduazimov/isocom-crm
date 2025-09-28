import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  Container as ContainerIcon,
  User,
  Calendar,
  Weight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBunkerStore } from "@/store/bunker.store";

const BunkerStatus: React.FC = () => {
  const { bunkerId } = useParams<{ bunkerId: string }>();
  const navigate = useNavigate();
  const {
    currentFillSession,
    statusLoading,
    statusError,
    processRemainingLoading,
    processRemainingError,
    fetchBunkerStatus,
    processRemainingMaterials,
  } = useBunkerStore();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (bunkerId) {
      fetchBunkerStatus(bunkerId);
    }
  }, [bunkerId, fetchBunkerStatus]);

  const handleProcessRemaining = async () => {
    if (!currentFillSession?.id) return;

    setIsProcessing(true);
    try {
      await processRemainingMaterials(currentFillSession.id);
    } catch (error) {
      console.error("Error processing remaining materials:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Bunker holati yuklanmoqda...</span>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Xato</h1>
        <p className="text-gray-600 mb-6">{statusError}</p>
        <Button onClick={() => bunkerId && fetchBunkerStatus(bunkerId)}>
          Qayta urinish
        </Button>
      </div>
    );
  }

  if (!currentFillSession) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          Bunker bo'sh
        </h2>
        <p className="text-gray-500 mb-6">Bu bunker hali to'ldirilmagan</p>
        <Button onClick={() => navigate(`/worker/bunkers/${bunkerId}/fill`)}>
          Bunkerni To'ldirish
        </Button>
      </div>
    );
  }

  const fillPercentage =
    (parseFloat(currentFillSession.total_materials_added) /
      parseFloat(currentFillSession.bunker_capacity_kg)) *
    100;
  const remainingPercentage =
    (parseFloat(currentFillSession.bunker_remaining_kg) /
      parseFloat(currentFillSession.bunker_capacity_kg)) *
    100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Orqaga
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentFillSession.bunker_name} - Holat
            </h1>
            <p className="text-gray-600 mt-2">
              Bunker to'ldirish sessiyasi ma'lumotlari
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/worker/bunkers/${bunkerId}/fill`)}
            variant="outline"
          >
            Yangi To'ldirish
          </Button>
          {!currentFillSession.is_remaining_processed && (
            <Button
              onClick={handleProcessRemaining}
              disabled={isProcessing || processRemainingLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessing || processRemainingLoading ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              Qoldiq Materiallarni Ayrish
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">To'ldirilgan</p>
                <p className="text-2xl font-bold">
                  {currentFillSession.total_materials_added} kg
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Progress value={fillPercentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {fillPercentage.toFixed(1)}% to'ldirilgan
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qoldiq</p>
                <p className="text-2xl font-bold">
                  {currentFillSession.bunker_remaining_kg} kg
                </p>
              </div>
              <Weight className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Progress value={remainingPercentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {remainingPercentage.toFixed(1)}% qoldiq
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sig'im</p>
                <p className="text-2xl font-bold">
                  {currentFillSession.bunker_capacity_kg} kg
                </p>
              </div>
              <ContainerIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Holat</p>
                <Badge
                  variant={
                    currentFillSession.is_remaining_processed
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {currentFillSession.is_remaining_processed
                    ? "Yakunlangan"
                    : "Jarayonda"}
                </Badge>
              </div>
              {currentFillSession.is_remaining_processed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-yellow-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fill Session Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>To'ldirish Ma'lumotlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">To'ldirgan operator</p>
                <p className="font-semibold">
                  {currentFillSession.filled_by_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ContainerIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Container</p>
                <p className="font-semibold">
                  {currentFillSession.container_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">To'ldirilgan vaqt</p>
                <p className="font-semibold">
                  {new Date(currentFillSession.filled_at).toLocaleString(
                    "uz-UZ"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Weight className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">
                  Container oldingi og'irligi
                </p>
                <p className="font-semibold">
                  {currentFillSession.container_previous_weight_kg} kg
                </p>
              </div>
            </div>

            {currentFillSession.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Izohlar</p>
                <p className="text-sm bg-gray-50 p-3 rounded-md">
                  {currentFillSession.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materials Information */}
        <Card>
          <CardHeader>
            <CardTitle>Materiallar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentFillSession.materials &&
                currentFillSession.materials.length > 0 ? (
                currentFillSession.materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="font-semibold">{material.material_name}</p>
                      <p className="text-sm text-gray-600">
                        {material.material_code}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{material.quantity_kg} kg</p>
                      <p className="text-sm text-gray-600">
                        {(
                          (parseFloat(material.quantity_kg) /
                            parseFloat(
                              currentFillSession.total_materials_added
                            )) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Materiallar mavjud emas</p>
                </div>
              )}
            </div>

            {/* Material Percentages */}
            {currentFillSession.material_percentages &&
              Object.keys(currentFillSession.material_percentages).length >
              0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-3">Material Ulushlari</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      currentFillSession.material_percentages
                    ).map(([material, percentage]) => (
                      <div
                        key={material}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{material}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Summary */}
      {currentFillSession.daily_material_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Kunlik Materiallar Xulosa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">PVD Qo'shilgan</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentFillSession.daily_material_summary.total_pvd_added} kg
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">VT Qo'shilgan</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentFillSession.daily_material_summary.total_vt_added} kg
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Jami Qo'shilgan</p>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    currentFillSession.daily_material_summary
                      .total_materials_added
                  }{" "}
                  kg
                </p>
              </div>
            </div>

            {currentFillSession.daily_material_summary &&
              currentFillSession.daily_material_summary.operators &&
              currentFillSession.daily_material_summary.operators.length >
              0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-3">Operatorlar</h4>
                  <div className="space-y-2">
                    {currentFillSession.daily_material_summary.operators.map(
                      (operator, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium">
                              {operator.operator_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {operator.material_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {operator.quantity} kg
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(operator.added_at).toLocaleTimeString(
                                "uz-UZ"
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Remaining Materials Processing */}
      {!currentFillSession.is_remaining_processed && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">
              Qoldiq Materiallarni Ayrish
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-orange-700">
                Bunker to'ldirilgach, qoldiq materiallarni ayrish kerak. Bu
                jarayon PVD va VT materiallarining ulushlarini hisoblab, qoldiq
                materiallarni UsedMaterial dan ayriladi.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-md border">
                  <p className="text-sm text-gray-600">Qoldiq PVD foizi</p>
                  <p className="text-xl font-bold text-blue-600">
                    {currentFillSession.remaining_material_percentages?.remaining_pvd_percentage?.toFixed(
                      1
                    ) || "0.0"}
                    %
                  </p>
                </div>
                <div className="p-4 bg-white rounded-md border">
                  <p className="text-sm text-gray-600">Qoldiq VT foizi</p>
                  <p className="text-xl font-bold text-green-600">
                    {currentFillSession.remaining_material_percentages?.remaining_vt_percentage?.toFixed(
                      1
                    ) || "0.0"}
                    %
                  </p>
                </div>
              </div>

              {processRemainingError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">
                    {processRemainingError}
                  </p>
                </div>
              )}

              <Button
                onClick={handleProcessRemaining}
                disabled={isProcessing || processRemainingLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isProcessing || processRemainingLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}
                Qoldiq Materiallarni Ayrish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BunkerStatus;

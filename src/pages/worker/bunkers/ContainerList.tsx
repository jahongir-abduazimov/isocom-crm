import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
//   Package,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Container as ContainerIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBunkerStore } from "@/store/bunker.store";
// import type { Container } from "@/services/bunker.service";

const ContainerList: React.FC = () => {
  const { bunkerId } = useParams<{ bunkerId: string }>();
  const navigate = useNavigate();
  const {
    containers,
    containersLoading,
    containersError,
    fetchContainersByBunker,
    deleteContainer,
    // currentBunker,
  } = useBunkerStore();

  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (bunkerId) {
      fetchContainersByBunker(bunkerId);
    }
  }, [bunkerId, fetchContainersByBunker]);

  const handleDelete = async (containerId: string) => {
    if (!confirm("Bu containerni o'chirishni xohlaysizmi?")) return;

    setDeleteLoading(containerId);
    try {
      await deleteContainer(containerId);
    } catch (error) {
      console.error("Error deleting container:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (containerId: string) => {
    navigate(`/worker/bunkers/${bunkerId}/containers/${containerId}/edit`);
  };

  const handleAdd = () => {
    navigate(`/worker/bunkers/${bunkerId}/containers/add`);
  };

  if (containersLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Containerlar yuklanmoqda...</span>
      </div>
    );
  }

  if (containersError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Xato</h1>
        <p className="text-gray-600 mb-6">{containersError}</p>
        <Button onClick={() => bunkerId && fetchContainersByBunker(bunkerId)}>
          Qayta urinish
        </Button>
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
            onClick={() => navigate(`/worker/bunkers/list`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Orqaga
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {containers[0]?.bunker_name} - Containerlar
            </h1>
            <p className="text-gray-600 mt-2">
              Bunker containerlarining ro'yxati va boshqaruvi
            </p>
          </div>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus size={16} />
          Yangi Container
        </Button>
      </div>

      {/* Containers Grid */}
      {containers.length === 0 ? (
        <div className="text-center py-12">
          <ContainerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Containerlar mavjud emas
          </h2>
          <p className="text-gray-500 mb-6">
            Bu bunker uchun hali containerlar yaratilmagan
          </p>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus size={16} />
            Birinchi containerni yaratish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {containers.map((container) => (
            <Card
              key={container.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ContainerIcon className="h-5 w-5 text-blue-600" />
                    {container.container_name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(container.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(container.id)}
                      disabled={deleteLoading === container.id}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleteLoading === container.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Bo'sh og'irlik</p>
                    <p className="font-semibold">
                      {container.empty_weight_kg} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Maksimal sig'im</p>
                    <p className="font-semibold">
                      {container.max_capacity_kg} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Joriy sig'im</p>
                    <p className="font-semibold">
                      {container.current_capacity_kg} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Holat</p>
                    <Badge
                      variant={
                        parseFloat(container.current_capacity_kg) > 0
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {parseFloat(container.current_capacity_kg) > 0
                        ? "To'ldirilgan"
                        : "Bo'sh"}
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Foydalanish foizi</span>
                    <span className="font-semibold">
                      {(
                        (parseFloat(container.current_capacity_kg) /
                          parseFloat(container.max_capacity_kg)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (parseFloat(container.current_capacity_kg) /
                            parseFloat(container.max_capacity_kg)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/worker/bunkers/${bunkerId}/containers/${container.id}`
                      )
                    }
                    className="w-full"
                  >
                    Batafsil ko'rish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContainerList;

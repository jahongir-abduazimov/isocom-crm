import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Edit,
  Package,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Container,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBunkerStore } from "@/store/bunker.store";

const BunkerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const {
    bunkers,
    fetchBunkers,
    containers,
    fetchContainers,
    deleteContainer,
    containersLoading,
    containersError,
  } = useBunkerStore();

  const [bunker, setBunker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBunker = async () => {
      try {
        setLoading(true);
        await fetchBunkers();
        await fetchContainers();
      } catch (error) {
        console.error("Error loading bunker:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBunker();
  }, [id, fetchBunkers, fetchContainers]);

  // Separate useEffect to handle bunker selection when bunkers are loaded
  useEffect(() => {
    if (id && bunkers.length > 0) {
      const foundBunker = bunkers.find((b) => b.id === id);
      setBunker(foundBunker);
    }
  }, [id, bunkers]);

  // Filter containers for this bunker
  const bunkerContainers = containers.filter(
    (container) => container.bunker === id
  );

  const handleDeleteContainer = async (containerId: string) => {
    if (window.confirm(t("containers.deleteConfirm"))) {
      try {
        await deleteContainer(containerId);
        await fetchContainers(); // Refresh the list
      } catch (error) {
        console.error("Error deleting container:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t("bunkers.loadingBunker")}</span>
      </div>
    );
  }

  if (!bunker) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">
          {t("bunkers.bunkerNotFound")}
        </h1>
        <p className="text-gray-600 mb-6">{t("bunkers.bunkerNotFoundDesc")}</p>
        <Button onClick={() => navigate("/bunkers")}>
          {t("bunkers.backToBunkers")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/bunkers")}
            className="flex items-center gap-2 w-fit"
          >
            <ArrowLeft size={16} />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{bunker.name}</h1>
            <p className="text-gray-600 mt-2 text-sm lg:text-base">{bunker.work_center_name}</p>
          </div>
        </div>
      </div>

      {/* Status and Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  {t("bunkers.status")}
                </p>
                <Badge
                  variant={bunker.is_filled ? "default" : "secondary"}
                  className="mt-1"
                >
                  {bunker.is_filled
                    ? t("bunkers.active")
                    : t("bunkers.inactive")}
                </Badge>
              </div>
              {bunker.is_filled ? (
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  {t("bunkers.capacity")}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {bunker.capacity_kg} kg
                </p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {bunker.description && (
        <Card>
          <CardHeader>
            <CardTitle>{t("bunkers.description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {bunker.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Containers Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Container size={20} className="sm:w-6 sm:h-6" />
              {t("containers.title")}
            </CardTitle>
            <Button
              onClick={() => navigate(`/bunkers/${bunker.id}/containers/add`)}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus size={16} />
              {t("containers.addContainer")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {containersLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                {t("containers.loadingContainers")}
              </span>
            </div>
          ) : containersError ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 mb-4">{containersError}</p>
              <Button onClick={fetchContainers} size="sm">
                {t("common.retry")}
              </Button>
            </div>
          ) : bunkerContainers.length === 0 ? (
            <div className="text-center py-8">
              <Container className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("containers.noContainersFound")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("containers.noContainersDesc")}
              </p>
              <Button
                onClick={() => navigate(`/bunkers/${bunker.id}/containers/add`)}
              >
                <Plus size={20} className="mr-2" />
                {t("containers.addFirstContainer")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bunkerContainers.map((container) => (
                <Card
                  key={container.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {container.container_name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {container.bunker_name}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">
                          {t("containers.emptyWeight")}:
                        </span>
                        <span className="font-medium">
                          {container.empty_weight_kg} kg
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">
                          {t("containers.availableCapacity")}:
                        </span>
                        <span className="font-medium text-green-600">
                          {(
                            parseFloat(container.max_capacity_kg) -
                            parseFloat(container.current_capacity_kg)
                          ).toFixed(2)}{" "}
                          kg
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/bunkers/${bunker.id}/containers/${container.id}/edit`
                          )
                        }
                        className="text-xs sm:text-sm"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContainer(container.id)}
                        className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BunkerDetailPage;

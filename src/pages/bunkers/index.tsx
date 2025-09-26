import React, { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Package,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useBunkerStore } from "@/store/bunker.store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BunkersPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bunkers, bunkersLoading, bunkersError, fetchBunkers, deleteBunker } =
    useBunkerStore();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bunkerToDelete, setBunkerToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchBunkers();
  }, [fetchBunkers]);

  const handleDeleteBunker = (bunkerId: string) => {
    setBunkerToDelete(bunkerId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (bunkerToDelete) {
      try {
        await deleteBunker(bunkerToDelete);
        fetchBunkers(); // Refresh the list
        setDeleteModalOpen(false);
        setBunkerToDelete(null);
      } catch (error) {
        console.error("Error deleting bunker:", error);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setBunkerToDelete(null);
  };

  if (bunkersLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          {t("bunkers.loadingBunkers")}
        </span>
      </div>
    );
  }

  if (bunkersError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t("common.error")}</h1>
        <p className="text-gray-600 mb-6">{bunkersError}</p>
        <Button onClick={fetchBunkers}>{t("common.retry")}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("bunkers.title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("bunkers.subtitle")}</p>
        </div>
        <Button
          onClick={() => navigate("/bunkers/add")}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          {t("bunkers.addBunker")}
        </Button>
      </div>

      {/* Bunkers List */}
      {bunkers.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("bunkers.noBunkersFound")}
          </h3>
          <p className="text-gray-600 mb-6">{t("bunkers.noBunkersDesc")}</p>
          <Button onClick={() => navigate("/bunkers/add")}>
            <Plus size={20} className="mr-2" />
            {t("bunkers.addFirstBunker")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bunkers.map((bunker) => (
            <Card key={bunker.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {bunker.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {bunker.work_center_name}
                    </p>
                  </div>
                  <Badge variant={bunker.is_filled ? "default" : "secondary"}>
                    {bunker.is_filled
                      ? t("bunkers.filled")
                      : t("bunkers.notFilled")}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t("bunkers.capacity")}:
                    </span>
                    <span className="font-medium">{bunker.capacity_kg} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t("bunkers.workCenter")}:
                    </span>
                    <span className="font-medium">
                      {bunker.work_center_name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t("bunkers.isFilled")}:
                    </span>
                    <span className="font-medium">
                      {bunker.is_filled
                        ? t("bunkers.filled")
                        : t("bunkers.notFilled")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/bunkers/${bunker.id}`)}
                    className="flex-1"
                  >
                    <Eye size={16} className="mr-1" />
                    {t("common.view")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/bunkers/${bunker.id}/edit`)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBunker(bunker.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title={t("bunkers.deleteConfirm")}
        description={t("bunkers.deleteConfirm")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default BunkersPage;

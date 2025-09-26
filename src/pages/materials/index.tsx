import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Search, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useMaterialsStore } from "@/store/materials.store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const MaterialsPage = () => {
  // Use Zustand store
  const { materials, loading, error, fetchMaterials, deleteMaterial } = useMaterialsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.code && m.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.type && m.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMaterial(deleteId);
      setModalOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("materials.title")}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={() => navigate("/materials/add")}
        >
          <Plus size={20} />
          {t("materials.newMaterial")}
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder={t("materials.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">{t("materials.loadingMaterials")}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t("materials.loadingError")}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={modalOpen}
        title={t("materials.deleteMaterial")}
        description={t("materials.deleteConfirm")}
        confirmText={t("materials.deleteButton")}
        cancelText={t("materials.cancelButton")}
        onConfirm={handleDelete}
        onCancel={() => { setModalOpen(false); setDeleteId(null); }}
      />

      {/* Materials Table - Desktop */}
      {!loading && !error && (
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("materials.materialName")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("materials.code")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("materials.type")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("materials.unit")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("materials.price")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("materials.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("materials.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[200px] truncate">
                        {material.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.code || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.type || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.unit_of_measure || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.price ? Number(material.price).toLocaleString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${material.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {material.is_active ? t("materials.active") : t("materials.inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm px-3"
                          onClick={() => navigate(`/materials/${material.id}/edit`)}
                        >
                          <Edit size={14} className="mr-1" />
                          {t("materials.editButton")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm px-3 text-red-600 hover:text-red-700"
                          onClick={() => { setDeleteId(material.id); setModalOpen(true); }}
                        >
                          <Trash2 size={14} className="mr-1" />
                          {t("materials.deleteButtonAction")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Materials Cards - Mobile */}
      {!loading && !error && (
        <div className="lg:hidden space-y-4">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="space-y-3">
                {/* Material Name */}
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{t("materials.materialName")}</h3>
                  <p className="text-sm text-gray-600 truncate">{material.name}</p>
                </div>

                {/* Code and Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("materials.code")}</h4>
                    <p className="text-sm text-gray-600">{material.code || "-"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("materials.type")}</h4>
                    <p className="text-sm text-gray-600">{material.type || "-"}</p>
                  </div>
                </div>

                {/* Unit and Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("materials.unit")}</h4>
                    <p className="text-sm text-gray-600">{material.unit_of_measure || "-"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("materials.price")}</h4>
                    <p className="text-sm text-gray-600">
                      {material.price ? Number(material.price).toLocaleString() : "-"}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h4 className="font-medium text-gray-900 text-xs">{t("materials.status")}</h4>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${material.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {material.is_active ? t("materials.active") : t("materials.inactive")}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/materials/${material.id}/edit`)}
                  >
                    <Edit size={12} className="mr-1" />
                    {t("materials.editButton")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs text-red-600 hover:text-red-700"
                    onClick={() => { setDeleteId(material.id); setModalOpen(true); }}
                  >
                    <Trash2 size={12} className="mr-1" />
                    {t("materials.deleteButtonAction")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t("materials.noMaterialsFound")}
          </p>
        </div>
      )}
    </div>
  );
}

export default MaterialsPage;

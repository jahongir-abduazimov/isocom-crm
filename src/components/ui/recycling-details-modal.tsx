import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Recycling } from "@/services/recycling.service";
import { useState, useEffect } from "react";
import { ProductionService } from "@/services/production.service";

interface RecyclingDetailsModalProps {
  open: boolean;
  onClose: () => void;
  recycling: Recycling | null;
}

export default function RecyclingDetailsModal({
  open,
  onClose,
  recycling,
}: RecyclingDetailsModalProps) {
  const [materialNames, setMaterialNames] = useState<Record<string, string>>(
    {}
  );
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (recycling) {
      fetchMaterialAndUserNames();
    }
  }, [recycling]);

  const fetchMaterialAndUserNames = async () => {
    if (!recycling) return;

    try {
      // Fetch materials and users data
      const [materialsResponse, usersResponse] = await Promise.all([
        ProductionService.getMaterials(),
        ProductionService.getUsers(),
      ]);

      // Create material names mapping
      const materialMap: Record<string, string> = {};
      if (materialsResponse.results) {
        materialsResponse.results.forEach((material: any) => {
          materialMap[material.id] = material.name;
        });
      }
      setMaterialNames(materialMap);

      // Create user names mapping
      const userMap: Record<string, string> = {};
      if (usersResponse.results) {
        usersResponse.results.forEach((user: any) => {
          userMap[user.id] =
            user.full_name || `${user.first_name} ${user.last_name}`;
        });
      }
      setUserNames(userMap);
    } catch (error) {
      console.error("Error fetching material and user names:", error);
    }
  };

  if (!recycling) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getScrapTypeColor = (scrapType: string) => {
    switch (scrapType) {
      case "HARD":
        return "bg-red-100 text-red-800";
      case "SOFT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "RECYCLED":
        return "bg-blue-100 text-blue-800";
      case "WRITTEN_OFF":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "MATERIAL_DEFECT":
        return "bg-red-100 text-red-800";
      case "MACHINE_ERROR":
        return "bg-orange-100 text-orange-800";
      case "OPERATOR_ERROR":
        return "bg-purple-100 text-purple-800";
      case "QUALITY_ISSUE":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Brak Qayta Ishlandi Tafsilotlari
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recycling Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Qayta Ishlandi Ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Qayta Ishlandi ID
                </label>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {recycling.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Qayta Ishlandi Miqdori
                </label>
                <p className="mt-1 text-sm text-gray-900 font-semibold">
                  {recycling.recycled_quantity}{" "}
                  {recycling.scrap_details.unit_of_measure}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Qayta Ishlandi Material
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {materialNames[recycling.recycled_to] ||
                    recycling.recycled_to}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Qayta Ishlagan Shaxs
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {userNames[recycling.recycled_by] ||
                    recycling.recycled_by_name ||
                    "Noma'lum"}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  ID: {recycling.recycled_by}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Qayta Ishlandi Vaqt
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(recycling.recycled_at)}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Qayta Ishlandi Izohlari
                </label>
                <p className="mt-1 text-sm text-gray-900 bg-white p-3 rounded border">
                  {recycling.notes || "Izoh yo'q"}
                </p>
              </div>
            </div>
          </div>

          {/* Original Scrap Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Asl Brak Ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Brak ID
                </label>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {recycling.scrap_details.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Brak Turi
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getScrapTypeColor(
                    recycling.scrap_details.scrap_type
                  )}`}
                >
                  {recycling.scrap_details.scrap_type_display}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Asl Miqdor
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {recycling.scrap_details.quantity}{" "}
                  {recycling.scrap_details.unit_of_measure}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Holat
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(
                    recycling.scrap_details.status
                  )}`}
                >
                  {recycling.scrap_details.status_display}
                </span>
              </div>
            </div>
          </div>

          {/* Reason and Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sabab va Tafsilotlar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sabab
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getReasonColor(
                    recycling.scrap_details.reason
                  )}`}
                >
                  {recycling.scrap_details.reason_display}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Material
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {materialNames[recycling.scrap_details.material] ||
                    recycling.scrap_details.material}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  ID: {recycling.scrap_details.material}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Izohlar
                </label>
                <p className="mt-1 text-sm text-gray-900 bg-white p-3 rounded border">
                  {recycling.scrap_details.notes || "Izoh yo'q"}
                </p>
              </div>
            </div>
          </div>

          {/* Production Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ishlab Chiqarish Ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ishlab Chiqarish Bosqichi
                </label>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {recycling.scrap_details.production_step}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mahsulot
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {recycling.scrap_details.product
                    ? recycling.scrap_details.product
                    : "Mahsulot ko'rsatilmagan"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Narx
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {recycling.scrap_details.cost
                    ? `${recycling.scrap_details.cost} so'm`
                    : "Narx ko'rsatilmagan"}
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Foydalanuvchi Ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Xabar Beruvchi
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {userNames[recycling.scrap_details.reported_by] ||
                    recycling.scrap_details.reported_by_name}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  ID: {recycling.scrap_details.reported_by}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tasdiqlovchi
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {recycling.scrap_details.confirmed_by
                    ? userNames[recycling.scrap_details.confirmed_by] ||
                    recycling.scrap_details.confirmed_by
                    : "Hali tasdiqlanmagan"}
                </p>
                {recycling.scrap_details.confirmed_by && (
                  <p className="text-xs text-gray-500 font-mono">
                    ID: {recycling.scrap_details.confirmed_by}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vaqt Belgilari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Xabar Berilgan Vaqt
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(recycling.scrap_details.reported_at)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tasdiqlangan Vaqt
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {recycling.scrap_details.confirmed_at
                    ? formatDate(recycling.scrap_details.confirmed_at)
                    : "Hali tasdiqlanmagan"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Yaratilgan Vaqt
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(recycling.created_at)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Yangilangan Vaqt
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(recycling.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

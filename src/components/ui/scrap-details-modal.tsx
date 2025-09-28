import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Scrap } from "@/services/scrap.service";

interface ScrapDetailsModalProps {
  open: boolean;
  onClose: () => void;
  scrap: Scrap | null;
}

export default function ScrapDetailsModal({
  open,
  onClose,
  scrap,
}: ScrapDetailsModalProps) {
  if (!scrap) return null;

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Brak Tafsilotlari
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Asosiy Ma'lumotlar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Brak ID
                </label>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {scrap.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Brak Turi
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getScrapTypeColor(
                    scrap.scrap_type
                  )}`}
                >
                  {scrap.scrap_type}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Miqdor
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {scrap.quantity} {scrap.unit_of_measure}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Holat
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(
                    scrap.status
                  )}`}
                >
                  {scrap.status}
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
                    scrap.reason
                  )}`}
                >
                  {scrap.reason}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Og'irlik
                </label>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {scrap.weight} {scrap.unit_of_measure}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Izohlar
                </label>
                <p className="mt-1 text-sm text-gray-900 bg-white p-3 rounded border">
                  {scrap.notes || "Izoh yo'q"}
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
                  Bosqich ID
                </label>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {scrap.step_execution}
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
                  Yozuvchi
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {scrap.recorded_by?.full_name || "Noma'lum"}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {scrap.recorded_by?.username || "Noma'lum"}
                </p>
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
                  Yaratilgan Vaqt
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(scrap.created_at)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Yangilangan Vaqt
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(scrap.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  User,
  CheckCircle,
  Search,
  Loader2,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useAuthStore } from "@/store/auth.store";
import { useWorkerStore } from "@/store/worker.store";

interface OperatorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OperatorSelectionModal({
  isOpen,
  onClose,
}: OperatorSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(
    null
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { selectedOperator, setSelectedOperator, logout } = useAuthStore();
  const { operators, operatorsLoading, operatorsError, fetchOperators } =
    useWorkerStore();

  // Filter operators based on search term
  const filteredOperators = useMemo(() => {
    if (!searchTerm.trim()) {
      return operators;
    }

    const term = searchTerm.toLowerCase();
    return operators.filter((operator) => {
      const fullName = `${operator.first_name || ""} ${operator.last_name || ""
        }`.toLowerCase();
      const username = (operator.username || "").toLowerCase();
      const email = (operator.email || "").toLowerCase();
      const role = (operator.role || "").toLowerCase();
      const workCenter = (operator.work_center || "").toLowerCase();

      return (
        fullName.includes(term) ||
        username.includes(term) ||
        email.includes(term) ||
        role.includes(term) ||
        workCenter.includes(term)
      );
    });
  }, [operators, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      fetchOperators();
      // Set current selected operator if exists
      if (selectedOperator) {
        setSelectedOperatorId(selectedOperator.id);
      }
    }
  }, [isOpen, fetchOperators, selectedOperator]);

  const handleOperatorSelect = (operator: any) => {
    setSelectedOperatorId(operator.id);
  };

  const handleConfirm = () => {
    if (selectedOperatorId) {
      const operator = operators.find((op) => op.id === selectedOperatorId);
      if (operator) {
        // Convert Operator to User type for auth store
        const userOperator = {
          id: operator.id,
          username: operator.username || operator.email,
          first_name: operator.first_name,
          last_name: operator.last_name,
          full_name: `${operator.first_name} ${operator.last_name}`,
          email: operator.email,
          phone_number: null,
          role: operator.role,
          role_display: operator.role,
          role_display_uz: operator.role,
          employee_id: null,
          is_active: true,
          is_staff: false,
          is_superuser: false,
          shift: null,
          is_operator: true,
          is_supervisor: false,
          is_specialist: false,
          role_level: 0,
          profile_picture: null,
          date_joined: new Date().toISOString(),
          last_login: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setSelectedOperator(userOperator);
        onClose();
      }
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
    onClose();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Operator tanlash
            </h2>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Tizimdan chiqish
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(90vh-130px)]">
          <p className="text-gray-600 mb-1 text-center">
            Ishni boshlashdan oldin operatorlar ro'yxatidan o'zingizni tanlang.
          </p>
          <p className="text-gray-600 mb-6 text-center font-medium">
            <span className="font-medium text-red-500">Ogohlantiramiz: </span>O'zingizni tanlamasangiz sizga 50 000 so'm jarima qo'llaniladi.
          </p>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Operator qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading State */}
          {operatorsLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                Operatorlar yuklanmoqda...
              </span>
            </div>
          )}

          {/* Error State */}
          {operatorsError && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Xato</h3>
              <p className="text-gray-600 mb-6">{operatorsError}</p>
              <Button onClick={() => fetchOperators()}>Qayta urinish</Button>
            </div>
          )}

          {/* Operators List */}
          {!operatorsLoading && !operatorsError && (
            <>
              {operators.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Operatorlar topilmadi
                  </h3>
                  <p className="text-gray-600">
                    Tizimda mavjud operatorlar mavjud emas
                  </p>
                </div>
              ) : filteredOperators.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Qidiruv natijasi topilmadi
                  </h3>
                  <p className="text-gray-600">
                    "{searchTerm}" bo'yicha operatorlar topilmadi. Boshqa kalit
                    so'z bilan qidiring.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOperators.map((operator) => (
                    <div
                      key={operator.id}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${selectedOperatorId === operator.id
                        ? "bg-blue-50 border-blue-500"
                        : "border-gray-200 hover:bg-gray-50"
                        }`}
                      onClick={() => handleOperatorSelect(operator)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="operator"
                              checked={selectedOperatorId === operator.id}
                              onChange={() => handleOperatorSelect(operator)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-900">
                              {operator.first_name && operator.last_name
                                ? `${operator.first_name} ${operator.last_name}`
                                : operator.username || operator.email}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {operator.email}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-gray-700">
                                  Rol:
                                </span>
                                <span className="text-xs text-gray-600">
                                  {operator.role}
                                </span>
                              </div>
                              {operator.work_center && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-medium text-gray-700">
                                    Workcenter:
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {operator.work_center}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedOperatorId === operator.id && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Tanlangan
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedOperatorId ? (
              <span className="text-green-600 font-medium">
                Operator tanlandi
              </span>
            ) : (
              <span>Operator tanlang</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleConfirm}
              disabled={!selectedOperatorId}
              className="flex items-center gap-2"
            >
              Tasdiqlash
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={showLogoutConfirm}
        title="Tizimdan chiqish"
        description="Tizimdan chiqishni xohlaysizmi?"
        confirmText="Chiqish"
        cancelText="Bekor qilish"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Users,
  User,
  CheckCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkerStore } from "@/store/worker.store";

export default function OperatorSelectionPage() {
  const navigate = useNavigate();
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const {
    operators,
    operatorsLoading,
    operatorsError,
    fetchOperators,
    setSelectedOperator,
  } = useWorkerStore();

  // Filter operators based on search term
  const filteredOperators = useMemo(() => {
    if (!searchTerm.trim()) {
      return operators;
    }

    const term = searchTerm.toLowerCase();
    return operators.filter((operator) => {
      const fullName = `${operator.first_name || ''} ${operator.last_name || ''}`.toLowerCase();
      const username = (operator.username || '').toLowerCase();
      const email = (operator.email || '').toLowerCase();
      const role = (operator.role || '').toLowerCase();
      const workCenter = (operator.work_center || '').toLowerCase();

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
    fetchOperators();
  }, [fetchOperators]);

  const handleOperatorSelect = (operator: any) => {
    setSelectedOperator(operator);
    setSelectedOperatorId(operator.id);
  };

  const handleContinue = () => {
    if (selectedOperatorId) {
      navigate("/worker/orders");
    }
  };

  if (operatorsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Operatorlar yuklanmoqda...</span>
      </div>
    );
  }

  if (operatorsError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Xato</h1>
        <p className="text-gray-600 mb-6">{operatorsError}</p>
        <Button onClick={() => fetchOperators()}>Qayta urinish</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Operator tanlash
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Material ishlatish jarayonini amalga oshiradigan operatorni tanlang
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <span className="ml-2 text-sm font-medium text-blue-600">
              Operator
            </span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-500">
              Buyurtma
            </span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="ml-2 text-sm font-medium text-gray-500">
              Qadam
            </span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
              4
            </div>
            <span className="ml-2 text-sm font-medium text-gray-500">
              Material
            </span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
              5
            </div>
            <span className="ml-2 text-sm font-medium text-gray-500">
              Tasdiqlash
            </span>
          </div>
        </div>
      </div>

      {/* Operators List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Mavjud operatorlar ({filteredOperators.length})
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Material ishlatish jarayonini amalga oshiradigan operatorni tanlang
          </p>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Operator qidirish (ism, email, rol, workcenter)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

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
              "{searchTerm}" bo'yicha operatorlar topilmadi. Boshqa kalit so'z bilan qidiring.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOperators.map((operator) => (
              <div
                key={operator.id}
                className={`p-6 transition-colors cursor-pointer ${selectedOperatorId === operator.id
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "hover:bg-gray-50"
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
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {operator.first_name && operator.last_name
                          ? `${operator.first_name} ${operator.last_name}`
                          : operator.username || operator.email}
                      </h4>
                      <p className="text-sm text-gray-600">{operator.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-700">
                            Rol:
                          </span>
                          <span className="text-sm text-gray-600">
                            {operator.role}
                          </span>
                        </div>
                        {operator.work_center && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-700">
                              Workcenter:
                            </span>
                            <span className="text-sm text-gray-600">
                              {operator.work_center}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedOperatorId === operator.id && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Tanlangan</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continue Button */}
      {selectedOperatorId && (
        <div className="flex justify-end">
          <Button onClick={handleContinue} className="flex items-center gap-2">
            Davom etish
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Ma'lumot</h4>
            <p className="text-sm text-blue-700">
              Operator tanlash uchun radio button ni bosing. Tanlangan operator
              material ishlatish jarayonini amalga oshiradi va barcha amallar
              uning nomiga qayd etiladi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

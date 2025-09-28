import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRecyclingStore } from "@/store/recycling.store";
import { useWorkcentersStore } from "@/store/workcenters.store";
import { useUsersStore } from "@/store/users.store";
import { Settings, Users, Package } from "lucide-react";

interface StartDrobilkaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  drobilkaType: "HARD" | "SOFT";
  recyclingBatch?: string;
  availableQuantity?: number;
}

export default function StartDrobilkaModal({
  open,
  onClose,
  onSuccess,
  drobilkaType,
  recyclingBatch,
  availableQuantity = 0,
}: StartDrobilkaModalProps) {
  const { startDrobilka, loading, error } = useRecyclingStore();
  const { workcenters, fetchWorkcenters } = useWorkcentersStore();
  const { users, fetchUsers } = useUsersStore();

  const [workCenter, setWorkCenter] = useState("");
  const [inputQuantity, setInputQuantity] = useState("");
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [leadOperator, setLeadOperator] = useState("");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter workcenters for BRAK_MAYDALAGICH type
  const drobilkaWorkcenters = workcenters.filter(
    (wc) => wc.type === "BRAK_MAYDALAGICH" && wc.is_active
  );

  // Filter operators (workers va operatorlar)
  const availableOperators = users.filter(
    (user) => (user.role === "WORKER" || user.is_operator) && user.is_active
  );

  useEffect(() => {
    if (open) {
      fetchWorkcenters();
      fetchUsers({ is_active: true });
      if (availableQuantity > 0) {
        setInputQuantity(availableQuantity.toString());
      }
      setFormErrors({});
    }
  }, [open, availableQuantity, fetchWorkcenters, fetchUsers]);

  const handleOperatorToggle = (operatorId: string) => {
    setSelectedOperators(prev => {
      if (prev.includes(operatorId)) {
        return prev.filter(id => id !== operatorId);
      } else if (prev.length < 3) {
        return [...prev, operatorId];
      }
      return prev;
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!workCenter) {
      errors.workCenter = "Drobilka stanogi tanlanishi shart";
    }

    if (!inputQuantity || parseFloat(inputQuantity) <= 0) {
      errors.inputQuantity = "Kirish miqdori 0 dan katta bo'lishi kerak";
    }

    if (availableQuantity > 0 && parseFloat(inputQuantity) > availableQuantity) {
      errors.inputQuantity = `Miqdor ${availableQuantity} dan katta bo'lmasligi kerak`;
    }

    if (selectedOperators.length < 2) {
      errors.operators = "Kamida 2 ta operator tanlanishi shart";
    }

    if (selectedOperators.length > 3) {
      errors.operators = "Maksimal 3 ta operator tanlash mumkin";
    }

    if (!leadOperator) {
      errors.leadOperator = "Bosh operator tanlanishi shart";
    }

    if (!recyclingBatch) {
      errors.recyclingBatch = "Qayta ishlash partiyasi tanlanishi shart";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartDrobilka = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const success = await startDrobilka({
        recycling_batch: recyclingBatch || "",
        drobilka_type: drobilkaType,
        work_center: workCenter,
        input_quantity: Math.abs(parseFloat(inputQuantity)), // Ensure positive quantity
        operators: selectedOperators,
        lead_operator: leadOperator,
        notes: notes.trim() || undefined,
      });

      if (success) {
        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error("Error starting drobilka:", error);
    }
  };

  const handleClose = () => {
    setWorkCenter("");
    setInputQuantity("");
    setSelectedOperators([]);
    setLeadOperator("");
    setNotes("");
    setFormErrors({});
    onClose();
  };

  const isValidQuantity = !inputQuantity || (parseFloat(inputQuantity) > 0 && (availableQuantity === 0 || parseFloat(inputQuantity) <= availableQuantity));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {drobilkaType === "HARD" ? "Qattiq" : "Yumshoq"} Drobilka Jarayonini Boshlash
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Available Quantity Info */}
          {availableQuantity > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Mavjud {drobilkaType === "HARD" ? "qattiq" : "yumshoq"} brak miqdori
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {availableQuantity.toFixed(2)} KG
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Work Center Selection */}
            <div>
              <Label htmlFor="workCenter">Drobilka Stanok</Label>
              <Select value={workCenter} onValueChange={setWorkCenter}>
                <SelectTrigger className={formErrors.workCenter ? "border-red-500" : ""}>
                  <SelectValue placeholder="Stanok tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {drobilkaWorkcenters.map((workcenter) => (
                    <SelectItem key={workcenter.id} value={workcenter.id}>
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        {workcenter.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.workCenter && (
                <p className="text-sm text-red-600 mt-1">{formErrors.workCenter}</p>
              )}
              {drobilkaWorkcenters.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  BRAK_MAYDALAGICH turidagi stanoklar topilmadi
                </p>
              )}
            </div>

            {/* Input Quantity */}
            <div>
              <Label htmlFor="inputQuantity">Kirish Miqdori (KG)</Label>
              <Input
                id="inputQuantity"
                type="number"
                step="0.01"
                min="0"
                max={availableQuantity || undefined}
                value={inputQuantity}
                onChange={(e) => setInputQuantity(e.target.value)}
                placeholder="0.00"
                className={formErrors.inputQuantity ? "border-red-500" : ""}
              />
              {formErrors.inputQuantity && (
                <p className="text-sm text-red-600 mt-1">{formErrors.inputQuantity}</p>
              )}
              {!formErrors.inputQuantity && !isValidQuantity && inputQuantity && (
                <p className="text-sm text-red-600 mt-1">
                  Miqdor 0 dan katta bo'lishi kerak{availableQuantity > 0 ? ` va ${availableQuantity} dan kichik` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Operator Selection */}
          <div>
            <Label>Operatorlar (2-3 ta tanlang)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-48 overflow-y-auto">
              {availableOperators.map((operator) => (
                <div
                  key={operator.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 ${formErrors.operators ? "border-red-200" : ""
                    }`}
                >
                  <Checkbox
                    id={operator.id}
                    checked={selectedOperators.includes(operator.id)}
                    onCheckedChange={() => handleOperatorToggle(operator.id)}
                    disabled={!selectedOperators.includes(operator.id) && selectedOperators.length >= 3}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{operator.full_name}</p>
                      <p className="text-xs text-gray-500">@{operator.username}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {formErrors.operators && (
              <p className="text-sm text-red-600 mt-1">{formErrors.operators}</p>
            )}
            {!formErrors.operators && selectedOperators.length < 2 && selectedOperators.length > 0 && (
              <p className="text-sm text-red-600 mt-1">
                Kamida 2 ta operator tanlashingiz kerak
              </p>
            )}
            {selectedOperators.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Tanlangan operatorlar: {selectedOperators.length}/3
              </p>
            )}
            {availableOperators.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                Mavjud operatorlar topilmadi
              </p>
            )}
          </div>

          {/* Lead Operator Selection */}
          <div>
            <Label htmlFor="leadOperator">Bosh Operator</Label>
            <Select value={leadOperator} onValueChange={setLeadOperator}>
              <SelectTrigger className={formErrors.leadOperator ? "border-red-500" : ""}>
                <SelectValue placeholder="Bosh operator tanlang" />
              </SelectTrigger>
              <SelectContent>
                {availableOperators.map((operator) => (
                  <SelectItem key={operator.id} value={operator.id}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {operator.full_name} (@{operator.username})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.leadOperator && (
              <p className="text-sm text-red-600 mt-1">{formErrors.leadOperator}</p>
            )}
            {availableOperators.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                Mavjud operatorlar topilmadi
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Izohlar</Label>
            <Textarea
              id="notes"
              placeholder="Drobilka jarayoni haqida qo'shimcha ma'lumotlar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Bekor qilish
            </Button>
            <Button
              onClick={handleStartDrobilka}
              disabled={
                loading ||
                !workCenter ||
                !inputQuantity ||
                !isValidQuantity ||
                selectedOperators.length < 2 ||
                !leadOperator ||
                !recyclingBatch
              }
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Boshlanmoqda...
                </div>
              ) : (
                "Boshlash"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
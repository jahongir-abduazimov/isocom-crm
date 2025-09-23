import { useState } from "react";
import { Factory, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useRecyclingStore } from "@/store/recycling.store";
import { type Workcenter } from "@/store/workcenters.store";
import { type User } from "@/services/users.service";
import { type RecyclingBatch } from "@/services/recycling.service";
import { toast } from "sonner";

interface StartDrobilkaModalProps {
  open: boolean;
  onClose: () => void;
  currentBatch: RecyclingBatch | null;
  workcenters: Workcenter[];
  operators: User[];
  onSuccess: () => void;
}

export default function StartDrobilkaModal({
  open,
  onClose,
  currentBatch,
  workcenters,
  operators,
  onSuccess,
}: StartDrobilkaModalProps) {
  const { startDrobilka, loading } = useRecyclingStore();

  const [drobilkaType, setDrobilkaType] = useState<"HARD" | "SOFT">("HARD");
  const [workCenter, setWorkCenter] = useState("");
  const [inputQuantity, setInputQuantity] = useState("");
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const handleOperatorToggle = (operatorId: string) => {
    setSelectedOperators((prev) => {
      if (prev.includes(operatorId)) {
        return prev.filter((id) => id !== operatorId);
      } else {
        return [...prev, operatorId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBatch) {
      toast.error("Qayta ishlash partiyasi mavjud emas");
      return;
    }

    if (!workCenter) {
      toast.error("Stanokni tanlang");
      return;
    }

    if (!inputQuantity || parseFloat(inputQuantity) <= 0) {
      toast.error("Noto'g'ri miqdor kiritildi");
      return;
    }

    if (selectedOperators.length < 2) {
      toast.error("Kamida 2 ta operator tanlanishi kerak");
      return;
    }

    if (selectedOperators.length > 3) {
      toast.error("Maksimal 3 ta operator tanlash mumkin");
      return;
    }

    const success = await startDrobilka({
      recycling_batch: currentBatch.id,
      drobilka_type: drobilkaType,
      work_center: workCenter,
      input_quantity: inputQuantity,
      operators: selectedOperators,
    });

    if (success) {
      toast.success("Drobilka jarayoni muvaffaqiyatli boshlandi");
      onSuccess();
      handleClose();
    } else {
      toast.error("Drobilka jarayonini boshlashda xatolik yuz berdi");
    }
  };

  const handleClose = () => {
    setDrobilkaType("HARD");
    setWorkCenter("");
    setInputQuantity("");
    setSelectedOperators([]);
    setNotes("");
    onClose();
  };

  const filteredWorkcenters = workcenters.filter(
    (w) => w.type === "BRAK_MAYDALAGICH"
  );
  const filteredOperators = operators.filter(
    (u) => u.is_operator && u.is_active
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Drobilka Jarayonini Boshlash
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch Info */}
          {currentBatch && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">
                Qayta Ishlash Partiyasi
              </h3>
              <p className="text-sm text-blue-600">
                {currentBatch.batch_number}
              </p>
            </div>
          )}

          {/* Drobilka Type */}
          <div className="space-y-2">
            <Label htmlFor="drobilka-type">Drobilka Turi</Label>
            <Select
              value={drobilkaType}
              onValueChange={(value: "HARD" | "SOFT") => setDrobilkaType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Drobilka turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HARD">Qattiq Braklar</SelectItem>
                <SelectItem value="SOFT">Yumshoq Braklar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work Center */}
          <div className="space-y-2">
            <Label htmlFor="work-center">Stanok</Label>
            <Select value={workCenter} onValueChange={setWorkCenter}>
              <SelectTrigger>
                <SelectValue placeholder="Stankni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {filteredWorkcenters.map((wc) => (
                  <SelectItem key={wc.id} value={wc.id}>
                    {wc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Quantity */}
          <div className="space-y-2">
            <Label htmlFor="input-quantity">Kirim Miqdori (KG)</Label>
            <Input
              id="input-quantity"
              type="number"
              step="0.01"
              min="0"
              value={inputQuantity}
              onChange={(e) => setInputQuantity(e.target.value)}
              placeholder="Kirim miqdorini kiriting"
              required
            />
          </div>

          {/* Operators */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Operatorlar (2-3 ta tanlang)
            </Label>
            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
              {filteredOperators.map((operator) => (
                <div key={operator.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={operator.id}
                    checked={selectedOperators.includes(operator.id)}
                    onCheckedChange={() => handleOperatorToggle(operator.id)}
                  />
                  <Label htmlFor={operator.id} className="text-sm">
                    {operator.full_name} ({operator.username})
                  </Label>
                </div>
              ))}
            </div>
            {selectedOperators.length > 0 && (
              <p className="text-sm text-gray-600">
                Tanlangan operatorlar: {selectedOperators.length}/3
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Izohlar</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Qo'shimcha izohlar..."
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Boshlanmoqda..." : "Boshlash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

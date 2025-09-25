import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ProductionService, type User } from "@/services/production.service";
import { useProductionStore } from "@/store/production.store";
import { notifySuccess, notifyError } from "@/lib/notification";
import { useTranslation } from "@/hooks/useTranslation";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "SKIPPED", label: "Skipped" },
];

export default function AddProductionStepExecutionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { orders, fetchOrders } = useProductionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productionSteps, setProductionSteps] = useState<any[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [workCenters, setWorkCenters] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    order: "",
    production_step: "",
    status: "PENDING",
    assigned_operator: "",
    work_center: "",
    start_time: "",
    end_time: "",
    actual_duration_hours: "",
    notes: "",
    quality_notes: "",
    quantity_processed: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchProductionSteps(),
        fetchWorkers(),
        fetchWorkCenters(),
      ]);
    } catch (err) {
      setError("Failed to load initial data");
      console.error("Error fetching initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionSteps = async () => {
    try {
      const response = await ProductionService.getProductionSteps();
      setProductionSteps(response.results);
    } catch (err) {
      console.error("Error fetching production steps:", err);
    }
  };

  const fetchWorkers = async () => {
    try {
      const workers = await ProductionService.getWorkers();
      setOperators(workers);
    } catch (err) {
      console.error("Error fetching workers:", err);
    }
  };

  const fetchWorkCenters = async () => {
    try {
      const response = await ProductionService.getWorkCenters();
      setWorkCenters(response);
    } catch (err) {
      console.error("Error fetching work centers:", err);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.order) {
      newErrors.order = t("production.addStepExecution.orderRequired");
    }

    if (!formData.production_step) {
      newErrors.production_step = t("production.addStepExecution.productionStepRequired");
    }

    if (!formData.status) {
      newErrors.status = t("production.addStepExecution.statusRequired");
    }

    if (
      formData.actual_duration_hours &&
      (isNaN(Number(formData.actual_duration_hours)) ||
        Number(formData.actual_duration_hours) < 0)
    ) {
      newErrors.actual_duration_hours = t("production.addStepExecution.durationPositive");
    }

    if (
      formData.quantity_processed &&
      (isNaN(Number(formData.quantity_processed)) ||
        Number(formData.quantity_processed) < 0)
    ) {
      newErrors.quantity_processed = t("production.addStepExecution.quantityPositive");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        order: formData.order,
        production_step: formData.production_step,
        status: formData.status as any,
        assigned_operator: formData.assigned_operator || null,
        operators: formData.assigned_operator ? [formData.assigned_operator] : [],
        operators_count: formData.assigned_operator ? 1 : 0,
        operators_names: formData.assigned_operator ?
          [operators.find(op => op.id === formData.assigned_operator)?.full_name?.trim() ||
            `${operators.find(op => op.id === formData.assigned_operator)?.first_name} ${operators.find(op => op.id === formData.assigned_operator)?.last_name}`.trim() ||
            operators.find(op => op.id === formData.assigned_operator)?.username || ''] : [],
        work_center: formData.work_center || null,
        work_center_name: formData.work_center ?
          workCenters.find(wc => wc.id === formData.work_center)?.name || null : null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        actual_duration_hours: formData.actual_duration_hours || null,
        notes: formData.notes || null,
        quality_notes: formData.quality_notes || null,
        quantity_processed: formData.quantity_processed || null,
      };

      await ProductionService.createStepExecution(submitData);

      notifySuccess(t("production.addStepExecution.executionCreated"));
      navigate("/production/step-executions");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("production.addStepExecution.createError");
      setError(errorMessage);
      notifyError(errorMessage);
      console.error("Error creating production step execution:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/production/step-executions");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("production.addStepExecution.title")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("production.addStepExecution.subtitle")}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Selection */}
            <div className="space-y-2">
              <Label htmlFor="order" className="text-sm font-medium">
                {t("production.addStepExecution.order")} *
              </Label>
              <Select
                value={formData.order}
                onValueChange={(value) => handleInputChange("order", value)}
              >
                <SelectTrigger className={errors.order ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("production.addStepExecution.selectOrder")} />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id.substring(0, 8)}... -{" "}
                      {order.produced_product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.order && (
                <p className="text-red-500 text-xs">{errors.order}</p>
              )}
            </div>

            {/* Production Step Selection */}
            <div className="space-y-2">
              <Label htmlFor="production_step" className="text-sm font-medium">
                {t("production.addStepExecution.productionStep")} *
              </Label>
              <Select
                value={formData.production_step}
                onValueChange={(value) =>
                  handleInputChange("production_step", value)
                }
              >
                <SelectTrigger
                  className={errors.production_step ? "border-red-500" : ""}
                >
                  <SelectValue placeholder={t("production.addStepExecution.selectProductionStep")} />
                </SelectTrigger>
                <SelectContent>
                  {productionSteps.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.name} ({step.step_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.production_step && (
                <p className="text-red-500 text-xs">{errors.production_step}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                {t("production.addStepExecution.status")} *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger
                  className={errors.status ? "border-red-500" : ""}
                >
                  <SelectValue placeholder={t("production.addStepExecution.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-xs">{errors.status}</p>
              )}
            </div>

            {/* Assigned Operator */}
            <div className="space-y-2">
              <Label
                htmlFor="assigned_operator"
                className="text-sm font-medium"
              >
                {t("production.addStepExecution.assignedOperator")}
              </Label>
              <Select
                value={formData.assigned_operator}
                onValueChange={(value) =>
                  handleInputChange("assigned_operator", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("production.addStepExecution.selectOperator")} />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.full_name?.trim() || `${operator.first_name} ${operator.last_name}`.trim() || operator.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Work Center */}
            <div className="space-y-2">
              <Label htmlFor="work_center" className="text-sm font-medium">
                {t("production.addStepExecution.workCenter")}
              </Label>
              <Select
                value={formData.work_center}
                onValueChange={(value) =>
                  handleInputChange("work_center", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("production.addStepExecution.selectWorkCenter")} />
                </SelectTrigger>
                <SelectContent>
                  {workCenters.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-sm font-medium">
                {t("production.addStepExecution.startTime")}
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) =>
                  handleInputChange("start_time", e.target.value)
                }
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-sm font-medium">
                {t("production.addStepExecution.endTime")}
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleInputChange("end_time", e.target.value)}
              />
            </div>

            {/* Actual Duration Hours */}
            <div className="space-y-2">
              <Label
                htmlFor="actual_duration_hours"
                className="text-sm font-medium"
              >
                {t("production.addStepExecution.actualDuration")}
              </Label>
              <Input
                id="actual_duration_hours"
                type="number"
                step="0.01"
                min="0"
                value={formData.actual_duration_hours}
                onChange={(e) =>
                  handleInputChange("actual_duration_hours", e.target.value)
                }
                placeholder={t("production.addStepExecution.enterDuration")}
                className={errors.actual_duration_hours ? "border-red-500" : ""}
              />
              {errors.actual_duration_hours && (
                <p className="text-red-500 text-xs">
                  {errors.actual_duration_hours}
                </p>
              )}
            </div>

            {/* Quantity Processed */}
            <div className="space-y-2">
              <Label
                htmlFor="quantity_processed"
                className="text-sm font-medium"
              >
                {t("production.addStepExecution.quantityProcessed")}
              </Label>
              <Input
                id="quantity_processed"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity_processed}
                onChange={(e) =>
                  handleInputChange("quantity_processed", e.target.value)
                }
                placeholder={t("production.addStepExecution.enterQuantity")}
                className={errors.quantity_processed ? "border-red-500" : ""}
              />
              {errors.quantity_processed && (
                <p className="text-red-500 text-xs">
                  {errors.quantity_processed}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              {t("production.addStepExecution.notes")}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder={t("production.addStepExecution.enterNotes")}
              rows={3}
            />
          </div>

          {/* Quality Notes */}
          <div className="space-y-2">
            <Label htmlFor="quality_notes" className="text-sm font-medium">
              {t("production.addStepExecution.qualityNotes")}
            </Label>
            <Textarea
              id="quality_notes"
              value={formData.quality_notes}
              onChange={(e) =>
                handleInputChange("quality_notes", e.target.value)
              }
              placeholder={t("production.addStepExecution.enterQualityNotes")}
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {loading ? t("production.addStepExecution.creating") : t("production.addStepExecution.createExecution")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

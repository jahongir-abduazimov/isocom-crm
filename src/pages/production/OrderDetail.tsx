import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Calendar, Clock, Package, Users, TrendingUp, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductionStore } from "@/store/production.store";
import { STATUS_MAPPINGS } from "@/config/api.config";
import ConfirmModal from "@/components/ui/confirm-modal";

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const {
        selectedOrder,
        loading,
        error,
        fetchOrderById,
        deleteOrder,
        setSelectedOrder
    } = useProductionStore();

    useEffect(() => {
        if (id) {
            fetchOrderById(id);
        }

        return () => {
            setSelectedOrder(null);
        };
    }, [id, fetchOrderById, setSelectedOrder]);

    const formatStatus = (status: string) => {
        return (
            STATUS_MAPPINGS.ORDER_STATUS[
            status.toUpperCase() as keyof typeof STATUS_MAPPINGS.ORDER_STATUS
            ] || status
        );
    };

    const formatUnitOfMeasure = (unit: string) => {
        return (
            STATUS_MAPPINGS.UNIT_OF_MEASURE[
            unit as keyof typeof STATUS_MAPPINGS.UNIT_OF_MEASURE
            ] || unit
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "COMPLETED":
                return "bg-green-100 text-green-800 border-green-200";
            case "IN_PROGRESS":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "CANCELLED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case "COMPLETED":
                return <CheckCircle className="h-4 w-4" />;
            case "IN_PROGRESS":
                return <Loader2 className="h-4 w-4 animate-spin" />;
            case "PENDING":
                return <Clock className="h-4 w-4" />;
            case "CANCELLED":
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getStepStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "COMPLETED":
                return "bg-green-50 text-green-700 border-green-200";
            case "IN_PROGRESS":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "PENDING":
                return "bg-gray-50 text-gray-700 border-gray-200";
            case "FAILED":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const handleDeleteClick = () => {
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (id) {
            try {
                await deleteOrder(id);
                setDeleteModalOpen(false);
                navigate("/production/orders");
            } catch (error) {
                console.error("Failed to delete order:", error);
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading order details...</span>
            </div>
        );
    }

    if (error || !selectedOrder) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
                <p className="text-gray-600 mb-6">
                    {error || "The requested order could not be found."}
                </p>
                <Button onClick={() => navigate("/production/orders")}>
                    Back to Orders
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/production/orders")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Orders
                    </Button>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            Order Details
                        </h1>
                        <p className="text-gray-600 mt-1 text-sm lg:text-base">
                            Order #{selectedOrder.id.slice(0, 8)}...
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/production/orders/${selectedOrder.id}/edit`)}
                        className="flex items-center gap-2"
                    >
                        <Edit size={16} />
                        Edit Order
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteClick}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 size={16} />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Order Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {selectedOrder.produced_product_name || "N/A"}
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {selectedOrder.description}
                                </p>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                {getStatusIcon(selectedOrder.status)}
                                {formatStatus(selectedOrder.status)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Quantity</p>
                                    <p className="font-medium text-gray-900">
                                        {selectedOrder.produced_quantity} {formatUnitOfMeasure(selectedOrder.unit_of_measure)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Progress</p>
                                    <p className="font-medium text-gray-900">
                                        {selectedOrder.completion_percentage}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Completion Progress</span>
                                <span className="font-medium text-gray-900">
                                    {selectedOrder.completion_percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${selectedOrder.completion_percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Start Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDate(selectedOrder.start_date)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Completion Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDate(selectedOrder.completion_date)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Created</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDate(selectedOrder.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Production Steps */}
            {selectedOrder.step_executions && selectedOrder.step_executions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Steps</h3>
                    <div className="space-y-3">
                        {selectedOrder.step_executions.map((step, index) => (
                            <div
                                key={step.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {step.production_step_name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {step.assigned_operator_name || "Unassigned"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStepStatusColor(step.status)}`}>
                                        {getStatusIcon(step.status)}
                                        {formatStatus(step.status)}
                                    </span>
                                    {step.start_time && (
                                        <span className="text-sm text-gray-600">
                                            {formatDate(step.start_time)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Used Materials */}
            {selectedOrder.used_materials && selectedOrder.used_materials.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Used Materials</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 text-sm font-medium text-gray-600">Material</th>
                                    <th className="text-left py-2 text-sm font-medium text-gray-600">Quantity</th>
                                    <th className="text-left py-2 text-sm font-medium text-gray-600">Work Center</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.used_materials.map((material) => (
                                    <tr key={material.id} className="border-b">
                                        <td className="py-3 text-sm text-gray-900">
                                            {material.material_name}
                                        </td>
                                        <td className="py-3 text-sm text-gray-900">
                                            {material.quantity}
                                        </td>
                                        <td className="py-3 text-sm text-gray-900">
                                            {material.workcenter_name}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Operators */}
            {selectedOrder.operators_names && selectedOrder.operators_names.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Operators</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedOrder.operators_names.map((operator, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                            >
                                <Users className="h-4 w-4" />
                                {operator}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={deleteModalOpen}
                title="Delete Production Order"
                description="Are you sure you want to delete this production order? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </div>
    );
}

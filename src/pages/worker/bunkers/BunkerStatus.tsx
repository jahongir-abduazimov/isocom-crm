import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Package, TrendingUp, Clock, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bunkerService, type BunkerStatus as BunkerStatusType } from "@/services/bunker.service";


const BunkerStatus: React.FC = () => {
    const { bunkerId } = useParams<{ bunkerId: string }>();
    const navigate = useNavigate();

    const [status, setStatus] = useState<BunkerStatusType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStatus();
    }, [bunkerId]);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await bunkerService.fetchBunkerStatus(bunkerId!);
            setStatus(data);
        } catch (error) {
            console.error("Error fetching bunker status:", error);
            setError("Bak holatini olishda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return "bg-red-500";
        if (percentage >= 70) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStatusIcon = (percentage: number) => {
        if (percentage >= 90) return "🔴";
        if (percentage >= 70) return "🟡";
        return "🟢";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Bak holati yuklanmoqda...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Xato</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={fetchStatus}>Qayta urinish</Button>
            </div>
        );
    }

    if (!status) {
        return (
            <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bak holati topilmadi</h3>
                <p className="text-gray-600">Bu bak uchun ma'lumot mavjud emas</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{status.bunker_name} Holati</h1>
                        <p className="text-gray-600">Bakning to'liq holati va ma'lumotlari</p>
                    </div>
                </div>
                <Button onClick={fetchStatus} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Yangilash
                </Button>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Work Center */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Work Center</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{status.work_center}</p>
                </div>

                {/* Current Level */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Joriy Hajm</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {status.current_level_kg.toFixed(1)}kg
                    </p>
                    <p className="text-sm text-gray-600">
                        {status.capacity_kg}kg dan
                    </p>
                </div>

                {/* Available Capacity */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Bo'sh Joy</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {status.available_capacity_kg.toFixed(1)}kg
                    </p>
                    <p className="text-sm text-gray-600">
                        Qoldiq hajm
                    </p>
                </div>

                {/* Fill Percentage */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-lg">{getStatusIcon(status.fill_percentage)}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">To'ldirilgan</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {status.fill_percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                        {status.is_full ? 'To\'liq' : 'Qisman'}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">To'ldirish Darajasi</h3>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Hajm</span>
                        <span className="text-sm text-gray-600">
                            {status.current_level_kg.toFixed(1)}/{status.capacity_kg}kg
                        </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${getProgressColor(status.fill_percentage)}`}
                            style={{ width: `${Math.min(status.fill_percentage, 100)}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">0kg</span>
                        <span className="font-medium text-gray-700">
                            {status.fill_percentage.toFixed(1)}% to'ldirilgan
                        </span>
                        <span className="text-gray-500">{status.capacity_kg}kg</span>
                    </div>
                </div>
            </div>

            {/* Material Type */}
            {status.material_type && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Material Turi</h3>
                    <p className="text-gray-600">{status.material_type}</p>
                </div>
            )}

            {/* Recent Fills */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Oxirgi To'ldirishlar</h3>

                {status.recent_fills && status.recent_fills.length > 0 ? (
                    <div className="space-y-3">
                        {status.recent_fills.map((fill, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Package className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{fill.material_name}</p>
                                        <p className="text-sm text-gray-600">{fill.quantity_kg}kg</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                        <User className="h-3 w-3" />
                                        <span>{fill.operator}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(fill.filled_at).toLocaleString('uz-UZ')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Hozircha to'ldirish tarixi mavjud emas</p>
                    </div>
                )}
            </div>

            {/* Last Updated */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Oxirgi yangilanish: {new Date(status.last_updated).toLocaleString('uz-UZ')}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/worker/bunkers")}
                    className="flex-1"
                >
                    Baklar Ro'yxatiga Qaytish
                </Button>
                <Button
                    onClick={() => navigate(`/worker/bunkers/${bunkerId}/fill`)}
                    className="flex-1"
                >
                    Bakni To'ldirish
                </Button>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/worker/bunkers/${bunkerId}/shift`)}
                    className="flex-1"
                >
                    Smena Boshqaruvi
                </Button>
            </div>
        </div>
    );
};

export default BunkerStatus;

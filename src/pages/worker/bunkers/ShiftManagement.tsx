import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Clock, Play, Square, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bunkerService, type ShiftStatus, type StartShiftRequest, type EndShiftRequest } from "@/services/bunker.service";


const ShiftManagement: React.FC = () => {
    const { bunkerId } = useParams<{ bunkerId: string }>();
    const navigate = useNavigate();

    const [shiftId, setShiftId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [shiftData, setShiftData] = useState<ShiftStatus | null>(null);

    useEffect(() => {
        fetchShiftStatus();
    }, [bunkerId]);

    const fetchShiftStatus = async () => {
        try {
            setLoading(true);
            const data = await bunkerService.fetchShiftStatus(bunkerId!);
            setShiftData(data);
        } catch (error) {
            console.error("Error fetching shift status:", error);
            setError("Smena holatini olishda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const startShift = async () => {
        if (!shiftId.trim()) {
            setError("Smena ID kiritilishi shart!");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const request: StartShiftRequest = { shift_id: shiftId };
            await bunkerService.startShift(bunkerId!, request);
            setSuccess("Smena boshlanganda bak holati saqlandi!");
            setShiftData(prev => prev ? { ...prev, status: 'started', started_at: new Date().toISOString() } : null);

            // Clear shift ID after successful start
            setShiftId("");

        } catch (error) {
            console.error("Error starting shift:", error);
            setError(error instanceof Error ? error.message : "Smena boshlashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const endShift = async () => {
        if (!shiftData?.shift_id) {
            setError("Aktiv smena topilmadi!");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const request: EndShiftRequest = { shift_id: shiftData.shift_id };
            const result = await bunkerService.endShift(bunkerId!, request);
            setSuccess(`Smena tugatildi. Sarf: ${result.consumption_kg || 0}kg`);
            setShiftData(prev => prev ? {
                ...prev,
                status: 'ended',
                ended_at: new Date().toISOString(),
                consumption_kg: result.consumption_kg
            } : null);

        } catch (error) {
            console.error("Error ending shift:", error);
            setError(error instanceof Error ? error.message : "Smena tugatishda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'started':
                return 'bg-green-100 text-green-800';
            case 'ended':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'started':
                return 'Smena boshlangan';
            case 'ended':
                return 'Smena tugatilgan';
            default:
                return 'Smena boshlanmagan';
        }
    };

    if (loading && !shiftData) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Smena ma'lumotlari yuklanmoqda...</span>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Smena Boshqaruvi</h1>
                        <p className="text-gray-600">Ekstruder bak uchun smena jarayonini boshqaring</p>
                    </div>
                </div>
            </div>

            {/* Current Status */}
            {shiftData && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Joriy Smena Holati</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Smena ID</Label>
                            <p className="text-gray-900 font-mono">{shiftData.shift_id || 'Belgilanmagan'}</p>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-gray-700">Holat</Label>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shiftData.status)}`}>
                                {getStatusText(shiftData.status)}
                            </span>
                        </div>

                        {shiftData.started_at && (
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Boshlangan vaqt</Label>
                                <p className="text-gray-900">{new Date(shiftData.started_at).toLocaleString('uz-UZ')}</p>
                            </div>
                        )}

                        {shiftData.ended_at && (
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Tugatilgan vaqt</Label>
                                <p className="text-gray-900">{new Date(shiftData.ended_at).toLocaleString('uz-UZ')}</p>
                            </div>
                        )}

                        {shiftData.consumption_kg !== undefined && (
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Sarf qilingan miqdor</Label>
                                <p className="text-gray-900 font-semibold">{shiftData.consumption_kg.toFixed(2)} kg</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Shift Management Form */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Smena Boshqaruvi</h3>

                <div className="space-y-6">
                    {/* Shift ID Input */}
                    <div className="space-y-2">
                        <Label htmlFor="shift_id" className="text-sm font-medium text-gray-700">
                            Smena ID *
                        </Label>
                        <Input
                            id="shift_id"
                            type="text"
                            value={shiftId}
                            onChange={(e) => {
                                setShiftId(e.target.value);
                                setError(null);
                            }}
                            placeholder="Masalan: SMENA-2024-001"
                            disabled={shiftData?.status === 'started'}
                        />
                        <p className="text-xs text-gray-500">
                            Smena boshlash uchun unikal ID kiriting
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <span className="text-red-700">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-green-700">{success}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/worker/bunkers")}
                            className="flex-1"
                        >
                            Orqaga
                        </Button>

                        <Button
                            onClick={startShift}
                            disabled={loading || shiftData?.status === 'started' || !shiftId.trim()}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Yuklanmoqda...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Smena Boshlash
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={endShift}
                            disabled={loading || shiftData?.status !== 'started'}
                            variant="destructive"
                            className="flex-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Yuklanmoqda...
                                </>
                            ) : (
                                <>
                                    <Square className="h-4 w-4 mr-2" />
                                    Smena Tugatish
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShiftManagement;

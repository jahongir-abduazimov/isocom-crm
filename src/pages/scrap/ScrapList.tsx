import { useState, useEffect } from "react";
import { Search, Eye, RefreshCw, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrapStore } from "@/store/scrap.store";
import { type Scrap } from "@/services/scrap.service";
import ScrapDetailsModal from "@/components/ui/scrap-details-modal";
import { toast } from "sonner";

export default function ScrapListPage() {
    const {
        scraps,
        loading,
        error,
        totalCount,
        fetchScraps,
        refreshData,
        clearError
    } = useScrapStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterScrapType, setFilterScrapType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedScrap, setSelectedScrap] = useState<Scrap | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchScraps();
    }, [fetchScraps]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    // Filtrlash
    const filteredScraps = scraps.filter((scrap) => {
        const matchesSearch =
            scrap.scrap_type_display
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            scrap.reason_display
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            scrap.recorded_by_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            scrap.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesScrapTypeFilter =
            filterScrapType === "all" || scrap.scrap_type === filterScrapType;

        const matchesStatusFilter =
            filterStatus === "all" || scrap.status === filterStatus;

        return matchesSearch && matchesScrapTypeFilter && matchesStatusFilter;
    });

    // Brak turi rangini belgilash
    const getScrapTypeColor = (scrapType: string) => {
        switch (scrapType) {
            case "HARD":
                return "bg-red-100 text-red-800 border-red-200";
            case "SOFT":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Holat rangini belgilash
    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "IN_DROBIL":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "RECYCLED":
                return "bg-green-100 text-green-800 border-green-200";
            case "MOVED":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Noqayt turlari
    const uniqueScrapTypes = Array.from(
        new Set(scraps.map((scrap) => scrap.scrap_type))
    );

    // Noqayt holatlari
    const uniqueStatuses = Array.from(
        new Set(scraps.map((scrap) => scrap.status))
    );

    const handleRefresh = async () => {
        await refreshData();
        toast.success("Ma'lumotlar yangilandi");
    };

    const handleScrapClick = (scrap: Scrap) => {
        setSelectedScrap(scrap);
        setModalOpen(true);
    };

    if (loading && scraps.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-gray-600">Brak ma'lumotlari yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sarlavha */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Brak Ro'yxati</h1>
                    <p className="text-gray-600">
                        Jami {totalCount} ta brak topildi
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Yangilash
                </Button>
            </div>

            {/* Filtrlar va Qidiruv */}
            {!loading && !error && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <Search
                                    size={20}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <Input
                                    placeholder="Braklar bo'yicha qidiruv..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <Select
                                value={filterScrapType}
                                onValueChange={setFilterScrapType}
                            >
                                <SelectTrigger className="w-full sm:min-w-[140px]">
                                    <SelectValue placeholder="Brak turi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Barcha turlar</SelectItem>
                                    {uniqueScrapTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {scraps.find((s) => s.scrap_type === type)?.scrap_type_display || type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-full sm:min-w-[140px]">
                                    <SelectValue placeholder="Holat" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Barcha holatlar</SelectItem>
                                    {uniqueStatuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {scraps.find((s) => s.status === status)?.status_display || status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}

            {/* Xatolik */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <RefreshCw className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Brak kartlari */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredScraps.map((scrap) => (
                        <Card
                            key={scrap.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleScrapClick(scrap)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">
                                        {scrap.scrap_type_display || scrap.scrap_type}
                                    </CardTitle>
                                    <Eye className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="flex gap-2">
                                    <Badge className={getScrapTypeColor(scrap.scrap_type)}>
                                        {scrap.scrap_type}
                                    </Badge>
                                    <Badge className={getStatusColor(scrap.status)}>
                                        {scrap.status_display || scrap.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Miqdor:</p>
                                        <p className="font-medium">
                                            {scrap.quantity} {scrap.unit_of_measure}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Og'irlik:</p>
                                        <p className="font-medium">{scrap.weight} kg</p>
                                    </div>
                                </div>

                                <div className="text-sm">
                                    <p className="text-gray-600">Sabab:</p>
                                    <p className="font-medium">
                                        {scrap.reason_display || scrap.reason}
                                    </p>
                                </div>

                                <div className="text-sm">
                                    <p className="text-gray-600">Qayd etdi:</p>
                                    <p className="font-medium">
                                        {scrap.recorded_by_name || "Avtomatik"}
                                    </p>
                                </div>

                                <div className="text-sm">
                                    <p className="text-gray-600">Vaqt:</p>
                                    <p className="font-medium">
                                        {new Date(scrap.created_at).toLocaleString('uz-UZ')}
                                    </p>
                                </div>

                                {scrap.notes && (
                                    <div className="text-sm">
                                        <p className="text-gray-600">Izoh:</p>
                                        <p className="font-medium text-gray-700 line-clamp-2">
                                            {scrap.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Ma'lumot yo'q */}
            {!loading && !error && filteredScraps.length === 0 && (
                <div className="text-center py-12">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Braklar topilmadi
                    </h3>
                    <p className="text-gray-600">
                        Qidiruv shartlariga mos braklar mavjud emas
                    </p>
                </div>
            )}

            {/* Brak detallari modali */}
            {selectedScrap && (
                <ScrapDetailsModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    scrap={selectedScrap}
                />
            )}
        </div>
    );
}

import { useNavigate } from "react-router-dom";
import { Package, TrendingUp, Clock, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BunkersDashboard() {
    const navigate = useNavigate();

    const handleNavigateToBunkers = () => {
        navigate("/worker/bunkers/list");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Ekstruder Bak Tizimi
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Ekstruder baklarini boshqarish, to'ldirish va smena jarayonlarini kuzatish
                </p>
            </div>

            {/* Main Action Card */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Baklar Boshqaruvi
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                        Barcha ekstruder baklarining holatini ko'ring, material to'ldiring va smena jarayonlarini boshqaring
                    </p>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleNavigateToBunkers}
                            size="lg"
                            className="flex items-center gap-2"
                        >
                            Baklar ro'yxatini ko'rish
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Baklar Ro'yxati</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Barcha ekstruder baklarining holati va ma'lumotlari
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/worker/bunkers/list")}
                        className="w-full"
                    >
                        Ko'rish
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bak To'ldirish</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Material bilan baklarni to'ldirish jarayoni
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/worker/bunkers/list")}
                        className="w-full"
                    >
                        To'ldirish
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Smena Boshqaruvi</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Smena boshlash va tugatish jarayonlari
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/worker/bunkers/list")}
                        className="w-full"
                    >
                        Boshqarish
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bak Holati</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Batafsil holat va to'ldirish tarixi
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/worker/bunkers/list")}
                        className="w-full"
                    >
                        Holat
                    </Button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">
                                Bak Tizimi Xususiyatlari
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Real-time bak holati kuzatuvi</li>
                                <li>• Material to'ldirish jarayoni</li>
                                <li>• Smena boshqaruvi</li>
                                <li>• To'ldirish tarixi</li>
                                <li>• Progress bar va vizual ko'rsatkichlar</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-green-900 mb-1">
                                Jarayon Haqida
                            </h4>
                            <p className="text-sm text-green-700">
                                Ekstruder bak tizimi orqali materiallarni samarali boshqaring.
                                Baklarni to'ldiring, smena jarayonlarini kuzating va ishlab chiqarish
                                jarayonini optimallashtiring. Barcha operatsiyalar real-time kuzatiladi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

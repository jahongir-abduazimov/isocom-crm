import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "./button";

interface BreadcrumbItem {
    label: string;
    path?: string;
}

const pathLabels: Record<string, string> = {
    "/worker": "Operator paneli",
    "/worker/orders": "Buyurtmalar",
    "/worker/production-outputs": "Ishlab chiqarish natijalari",
    "/worker/bunkers": "Ekstruder Baklar",
    "/worker/bunkers/list": "Baklar ro'yxati",
    "/worker/bunkers/end-shift": "Smena tugatish",
};

export default function Breadcrumb() {
    const location = useLocation();
    const navigate = useNavigate();

    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        const pathSegments = location.pathname.split("/").filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [];

        // Always start with home
        breadcrumbs.push({ label: "Asosiy", path: "/worker" });

        // Build breadcrumbs from path segments
        let currentPath = "";
        for (const segment of pathSegments) {
            currentPath += `/${segment}`;
            const label = pathLabels[currentPath] || segment;
            breadcrumbs.push({
                label,
                path: currentPath === location.pathname ? undefined : currentPath
            });
        }

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <nav className="flex items-center space-x-2 text-sm bg-white rounded-lg shadow-sm border p-4 mb-6">
            {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                    {index === 0 && <Home className="h-4 w-4 text-gray-500 mr-1" />}
                    {item.path ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(item.path!)}
                            className="text-gray-600 hover:text-gray-900 p-1 h-auto font-normal"
                        >
                            {item.label}
                        </Button>
                    ) : (
                        <span className="text-gray-900 font-medium">{item.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                    )}
                </div>
            ))}
        </nav>
    );
}

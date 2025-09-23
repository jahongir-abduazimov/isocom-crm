import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  CheckCircle,
  BarChart3,
  Menu,
  Home,
  Plus,
  FileText,
  Warehouse,
} from "lucide-react";
import { Button } from "./button";

interface QuickAccessMenuProps {
  className?: string;
}

export default function QuickAccessMenu({
  className = "",
}: QuickAccessMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Asosiy panel",
      path: "/worker",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: <Package className="h-6 w-6" />,
      label: "Material ishlatish",
      path: "/worker/orders",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      label: "Ishlab chiqarish natijalari",
      path: "/worker/production-outputs",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      icon: <Warehouse className="h-6 w-6" />,
      label: "Braklar",
      path: "/reprocessing",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      label: "Baklar ro'yxati",
      path: "/worker/bunkers/list",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      label: "Inventar logi",
      path: "/stock/inventory-movement-logs",
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Menu Items */}
      <div
        className={`absolute bottom-14 right-0 space-y-2 transition-all duration-300 ${isOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        {menuItems.map((item, index) => (
          <div
            key={item.path}
            className="flex items-center gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[180px] hover:shadow-xl transition-all duration-200 hover:scale-105"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${item.color}`}
            >
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-xs">{item.label}</p>
            </div>
            <Button
              size="sm"
              onClick={() => handleItemClick(item.path)}
              className="h-6 px-2 text-xs font-medium"
            >
              O'tish
            </Button>
          </div>
        ))}
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={`w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${isOpen
          ? "bg-red-600 hover:bg-red-700 rotate-45"
          : "bg-blue-600 hover:bg-blue-700 rotate-0"
          }`}
      >
        {isOpen ? (
          <Plus className="text-white" />
        ) : (
          <Menu className="text-white" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

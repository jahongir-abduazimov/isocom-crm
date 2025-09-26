import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Box,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  Factory,
  Settings,
  Warehouse,
  Package,
  Users,
  Wrench,
  Shield,
  X,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";

const getNavItems = (t: any) => [
  {
    path: "/",
    label: t("navigation.dashboard"),
    icon: <BarChart3 size={20} />,
  },
  {
    label: t("navigation.products"),
    icon: <Box size={20} />,
    isCollapsible: true,
    menuKey: "products",
    children: [
      { path: "/products", label: t("navigation.products") },
      {
        path: "/products-components",
        label: t("navigation.productComponents"),
      },
    ],
  },
  {
    path: "/materials",
    label: t("navigation.materials"),
    icon: <Layers size={20} />,
  },
  {
    path: "/workcenters",
    label: t("navigation.workcenters"),
    icon: <Settings size={20} />,
  },
  { path: "/users", label: t("navigation.users"), icon: <Users size={20} /> },
  {
    path: "/worker",
    label: t("navigation.operatorPanel"),
    icon: <Wrench size={20} />,
  },
  {
    path: "/bunkers",
    label: t("navigation.bunkers"),
    icon: <Package size={20} />,
  },
  {
    label: t("navigation.warehouse"),
    icon: <Warehouse size={20} />,
    isCollapsible: true,
    menuKey: "warehouse",
    children: [
      { path: "/warehouse/locations", label: t("navigation.locations") },
      { path: "/warehouse/warehouses", label: t("navigation.warehouses") },
    ],
  },
  {
    label: t("navigation.production"),
    icon: <Factory size={20} />,
    isCollapsible: true,
    menuKey: "production",
    children: [
      { path: "/production/orders", label: t("navigation.orders") },
      { path: "/production/outputs", label: t("navigation.productionOutputs") },
      {
        path: "/production/step-executions",
        label: t("navigation.stepExecutions"),
      },
      { path: "/production/steps", label: t("navigation.productionSteps") },
      {
        path: "/production/used-materials",
        label: t("navigation.usedMaterials"),
      },
    ],
  },
  {
    label: t("navigation.stock"),
    icon: <Package size={20} />,
    isCollapsible: true,
    menuKey: "stock",
    children: [
      {
        path: "/stock/inventory-movement-logs",
        label: t("navigation.inventoryMovements"),
      },
      { path: "/stock/stock-levels", label: t("navigation.stockLevels") },
    ],
  },
  {
    label: t("navigation.scrap"),
    icon: <Shield size={20} />,
    isCollapsible: true,
    menuKey: "scrap",
    children: [
      { path: "/scrap/reprocessing", label: t("navigation.reprocessing") },
      { path: "/scrap/defects", label: t("navigation.defects") },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    products: false,
    warehouse: false,
    production: false,
    stock: false,
    scrap: false,
    bunkers: false,
  });

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Operator rolini tekshirish
  const isOperator = user?.role === "WORKER" || user?.is_operator;

  // Agar operator bo'lsa, sidebar'ni ko'rsatmaslik
  if (isOperator) {
    return null;
  }

  // Superadmin rollari uchun Operator panelini olib tashlash
  const navItems = getNavItems(t);
  const filteredNavItems = navItems.filter((item) => {
    if (item.path === "/worker") {
      return false; // Operator panelini olib tashlash
    }
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static top-0 left-0 z-50 lg:z-auto
        h-full lg:h-[calc(100vh-16px)]
        w-66 lg:w-74
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:block
      `}
      >
        <ScrollArea className="h-full bg-primary to-blue-700 text-white flex flex-col shadow-lg lg:rounded-xl lg:m-2">
          {/* Header with close button for mobile */}
          <div className="min-h-16 flex items-center justify-between px-4 text-2xl font-extrabold tracking-wide border-b border-white/10">
            <span className="drop-shadow">{t("common.appName")}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden text-white hover:bg-white/10 p-2"
            >
              <X size={20} />
            </Button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {filteredNavItems.map((item, index) => {
              if (item.isCollapsible) {
                const isExpanded = expandedMenus[item.menuKey!];
                return (
                  <div key={index}>
                    <button
                      onClick={() => toggleMenu(item.menuKey!)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-base font-medium hover:bg-white/10 hover:scale-[1.03] w-full text-left"
                    >
                      {item.icon}
                      {item.label}
                      {isExpanded ? (
                        <ChevronUp size={16} className="ml-auto" />
                      ) : (
                        <ChevronDown size={16} className="ml-auto" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children?.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={onClose} // Close sidebar on mobile when navigating
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                isActive
                                  ? "bg-white text-primary shadow font-semibold"
                                  : "hover:bg-white/10 hover:scale-[1.03]"
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  onClick={onClose} // Close sidebar on mobile when navigating
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-base font-medium ${
                      isActive
                        ? "bg-white text-primary shadow font-semibold"
                        : "hover:bg-white/10 hover:scale-[1.03]"
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
}

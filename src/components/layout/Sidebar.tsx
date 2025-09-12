import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Box, BarChart3, Layers, ChevronDown, ChevronUp, Factory, Settings, Warehouse, Package, Users } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: <BarChart3 size={20} /> },
  {
    label: "Maxsulotlar",
    icon: <Box size={20} />,
    isCollapsible: true,
    menuKey: "products",
    children: [
      { path: "/products", label: "Maxsulotlar" },
      { path: "/products-components", label: "Maxsulot komponentlari" }
    ]
  },
  { path: "/materials", label: "Materiallar", icon: <Layers size={20} /> },
  { path: "/workcenters", label: "Stanoklar", icon: <Settings size={20} /> },
  { path: "/users", label: "Foydalanuvchilar", icon: <Users size={20} /> },
  {
    label: "Warehouse",
    icon: <Warehouse size={20} />,
    isCollapsible: true,
    menuKey: "warehouse",
    children: [
      { path: "/warehouse/locations", label: "Locations" },
      { path: "/warehouse/warehouses", label: "Warehouses" }
    ]
  },
  {
    label: "Production",
    icon: <Factory size={20} />,
    isCollapsible: true,
    menuKey: "production",
    children: [
      { path: "/production/orders", label: "Orders" },
      { path: "/production/outputs", label: "Production outputs" },
      { path: "/production/step-executions", label: "Production step executions" },
      { path: "/production/steps", label: "Production steps" },
      { path: "/production/used-materials", label: "Used materials" }
    ]
  },
  {
    label: "Stock",
    icon: <Package size={20} />,
    isCollapsible: true,
    menuKey: "stock",
    children: [
      { path: "/stock/inventory-movement-logs", label: "Inventory movement logs" },
      { path: "/stock/stock-levels", label: "Stock levels" }
    ]
  }
];

export default function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    products: false,
    warehouse: false,
    production: false,
    stock: false,
  });

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  return (
    <aside className="max-w-54 min-w-54 lg:min-w-64 lg:max-w-64 h-[calc(100vh-16px)] bg-primary to-blue-700 text-white flex flex-col shadow-lg rounded-xl m-2">
      <div className="min-h-16 flex items-center justify-center text-2xl font-extrabold tracking-wide border-b border-white/10">
        <span className="drop-shadow">ISOCOM</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => {
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
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${isActive ? "bg-white text-primary shadow font-semibold" : "hover:bg-white/10 hover:scale-[1.03]"
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
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-base font-medium ${isActive ? "bg-white text-primary shadow font-semibold" : "hover:bg-white/10 hover:scale-[1.03]"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-white/70 border-t border-white/10 mt-auto">© 2025 ISOCOM</div>
    </aside>
  );
}

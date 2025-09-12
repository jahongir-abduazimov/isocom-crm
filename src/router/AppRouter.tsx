import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/router/ProtectedRoute";

import DashboardPage from "@/pages/dashboard";
import LoginPage from "@/pages/auth/LoginPage";
import ProductsPage from "@/pages/products";
import ProductsComponentsPage from "@/pages/products-components"
import MaterialsPage from "@/pages/materials";
import AddMaterialPage from "@/pages/materials/AddMaterial";
import EditMaterialPage from "@/pages/materials/EditMaterial";
import WorkcentersPage from "@/pages/workcenters";
import AddWorkcenterPage from "@/pages/workcenters/AddWorkcenter";
import EditWorkcenterPage from "@/pages/workcenters/EditWorkcenter";
import AddProductPage from "@/pages/products/AddProduct";
import EditProductPage from "@/pages/products/EditProduct";

// Production pages
import OrdersPage from "@/pages/production";
import AddOrderPage from "@/pages/production/AddOrder";
import EditOrderPage from "@/pages/production/EditOrder";
import ProductionOutputsPage from "@/pages/production/ProductionOutputs";
import AddProductionOutputPage from "@/pages/production/AddProductionOutput";
import EditProductionOutputPage from "@/pages/production/EditProductionOutput";
import ProductionStepExecutionsPage from "@/pages/production/ProductionStepExecutions";
import AddProductionStepExecutionPage from "@/pages/production/AddProductionStepExecution";
import EditProductionStepExecutionPage from "@/pages/production/EditProductionStepExecution";
import ProductionStepsPage from "@/pages/production/ProductionSteps";
import AddProductionStepPage from "@/pages/production/AddProductionStep";
import EditProductionStepPage from "@/pages/production/EditProductionStep";
import UsedMaterialsPage from "@/pages/production/UsedMaterials";
import AddUsedMaterialPage from "@/pages/production/AddUsedMaterial";
import EditUsedMaterialPage from "@/pages/production/EditUsedMaterial";

// Warehouse pages
import WarehousesPage from "@/pages/warehouse/index";
import AddWarehousePage from "@/pages/warehouse/AddWarehouse";
import EditWarehousePage from "@/pages/warehouse/EditWarehouse";
import LocationsPage from "@/pages/warehouse/Locations";
import AddLocationPage from "@/pages/warehouse/AddLocation";
import EditLocationPage from "@/pages/warehouse/EditLocation";

// Stock pages
import { InventoryMovementLogs, StockLevels } from "@/pages/stock";
import AddInventoryMovementPage from "@/pages/stock/AddInventoryMovement";
import EditInventoryMovementPage from "@/pages/stock/EditInventoryMovement";
import AddStockLevelPage from "@/pages/stock/AddStockLevel";
import EditStockLevelPage from "@/pages/stock/EditStockLevel";

// Users pages
import UsersPage from "@/pages/users";
import AddUserPage from "@/pages/users/AddUser";
import EditUserPage from "@/pages/users/EditUser";

// import QCPage from "@/pages/qc/QCPage";
// import PackagingPage from "@/pages/packaging/PackagingPage";
// import ReportsPage from "@/pages/reports/ReportsPage";
// import SettingsPage from "@/pages/settings/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<LoginPage />} />
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/add" element={<AddProductPage />} />
          <Route path="/products/:id/edit" element={<EditProductPage />} />
          <Route path="/products-components" element={<ProductsComponentsPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/add" element={<AddMaterialPage />} />
          <Route path="/materials/:id/edit" element={<EditMaterialPage />} />
          <Route path="/workcenters" element={<WorkcentersPage />} />
          <Route path="/workcenters/add" element={<AddWorkcenterPage />} />
          <Route path="/workcenters/:id/edit" element={<EditWorkcenterPage />} />

          {/* Production Routes */}
          <Route path="/production/orders" element={<OrdersPage />} />
          <Route path="/production/orders/add" element={<AddOrderPage />} />
          <Route path="/production/orders/:id/edit" element={<EditOrderPage />} />
          <Route path="/production/outputs" element={<ProductionOutputsPage />} />
          <Route path="/production/outputs/add" element={<AddProductionOutputPage />} />
          <Route path="/production/outputs/:id/edit" element={<EditProductionOutputPage />} />
          <Route path="/production/step-executions" element={<ProductionStepExecutionsPage />} />
          <Route path="/production/step-executions/add" element={<AddProductionStepExecutionPage />} />
          <Route path="/production/step-executions/:id/edit" element={<EditProductionStepExecutionPage />} />
          <Route path="/production/steps" element={<ProductionStepsPage />} />
          <Route path="/production/steps/add" element={<AddProductionStepPage />} />
          <Route path="/production/steps/:id/edit" element={<EditProductionStepPage />} />
          <Route path="/production/used-materials" element={<UsedMaterialsPage />} />
          <Route path="/production/used-materials/add" element={<AddUsedMaterialPage />} />
          <Route path="/production/used-materials/:id/edit" element={<EditUsedMaterialPage />} />

          {/* Warehouse Routes */}
          <Route path="/warehouse/locations" element={<LocationsPage />} />
          <Route path="/warehouse/locations/add" element={<AddLocationPage />} />
          <Route path="/warehouse/locations/:id/edit" element={<EditLocationPage />} />
          <Route path="/warehouse/warehouses" element={<WarehousesPage />} />
          <Route path="/warehouse/warehouses/add" element={<AddWarehousePage />} />
          <Route path="/warehouse/warehouses/:id/edit" element={<EditWarehousePage />} />

          {/* Stock Routes */}
          <Route path="/stock/inventory-movement-logs" element={<InventoryMovementLogs />} />
          <Route path="/stock/inventory-movement-logs/add" element={<AddInventoryMovementPage />} />
          <Route path="/stock/inventory-movement-logs/:id/edit" element={<EditInventoryMovementPage />} />
          <Route path="/stock/stock-levels" element={<StockLevels />} />
          <Route path="/stock/stock-levels/add" element={<AddStockLevelPage />} />
          <Route path="/stock/stock-levels/:id/edit" element={<EditStockLevelPage />} />

          {/* Users Routes */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/add" element={<AddUserPage />} />
          <Route path="/users/:id/edit" element={<EditUserPage />} />

          <Route path="/qc" element={"qc"} />
          <Route path="/packaging" element={"packaging"} />
          <Route path="/reports" element={"reports"} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

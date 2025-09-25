import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/router/ProtectedRoute";
import OperatorProtectedRoute from "@/router/OperatorProtectedRoute";

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
import OrderDetailPage from "@/pages/production/OrderDetail";
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

// Worker pages
import WorkerDashboardPage from "@/pages/worker";
import WorkerOrderListPage from "@/pages/worker/OrderList";
import WorkerOrderDetailPage from "@/pages/worker/OrderDetail";
import WorkerStockSelectionPage from "@/pages/worker/StockSelection";
import WorkerConfirmationPage from "@/pages/worker/Confirmation";
import WorkerProductionOutputsPage from "@/pages/worker/ProductionOutputs";
import WorkerAddProductionOutputPage from "@/pages/worker/AddProductionOutput";
import WorkerEditProductionOutputPage from "@/pages/worker/EditProductionOutput";

// New Workflow pages
import WorkcenterSelectionPage from "@/pages/worker/WorkcenterSelection";
import OrderSelectionByWorkcenterTypePage from "@/pages/worker/OrderSelectionByWorkcenterType";
import ProductionStepSelectionByWorkcenterTypePage from "@/pages/worker/ProductionStepSelectionByWorkcenterType";
import MaterialUsageNewWorkflowPage from "@/pages/worker/MaterialUsageNewWorkflow";

// Worker Bunker pages
import BunkersDashboardPage from "@/pages/worker/bunkers";
import BunkerListPage from "@/pages/worker/bunkers/BunkerList";
import EndShiftBunkerPage from "@/pages/worker/bunkers/EndShiftBunker";

// Worker Reprocessing page
import WorkerReprocessingPage from "@/pages/worker/Reprocessing";


// Worker QR Codes page
import QRCodesPage from "@/pages/worker/QRCodes";

// Scrap pages
import DefectsPage from "@/pages/scrap/Defects";
import ReprocessingPage from "@/pages/scrap/Reprocessing";

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
          {/* Operator Routes - No additional protection needed */}
          <Route path="/worker" element={<WorkerDashboardPage />} />

          {/* New Workflow Routes */}
          <Route path="/worker/workcenter-selection" element={<WorkcenterSelectionPage />} />
          <Route path="/worker/workcenter-type/:workcenterType" element={<OrderSelectionByWorkcenterTypePage />} />
          <Route path="/worker/workcenter-type/:workcenterType/order/:orderId" element={<ProductionStepSelectionByWorkcenterTypePage />} />
          <Route path="/worker/workcenter-type/:workcenterType/order/:orderId/step/:stepId" element={<MaterialUsageNewWorkflowPage />} />

          {/* Legacy Workflow Routes */}
          <Route path="/worker/orders" element={<WorkerOrderListPage />} />
          <Route path="/worker/orders/:id" element={<WorkerOrderDetailPage />} />
          <Route path="/worker/orders/:id/steps/:stepId" element={<WorkerStockSelectionPage />} />
          <Route path="/worker/orders/:id/steps/:stepId/confirm" element={<WorkerConfirmationPage />} />

          {/* Worker Bunker Routes */}
          <Route path="/worker/bunkers" element={<BunkersDashboardPage />} />
          <Route path="/worker/bunkers/list" element={<BunkerListPage />} />
          <Route path="/worker/bunkers/:bunkerId/end-shift" element={<EndShiftBunkerPage />} />

          {/* Worker Production Output Routes */}
          <Route path="/worker/production-outputs" element={<WorkerProductionOutputsPage />} />
          <Route path="/worker/production-outputs/add" element={<WorkerAddProductionOutputPage />} />
          <Route path="/worker/production-outputs/:id/edit" element={<WorkerEditProductionOutputPage />} />

          {/* Worker Reprocessing Routes */}
          <Route path="/reprocessing" element={<WorkerReprocessingPage />} />

          {/* Worker QR Codes Routes */}
          <Route path="/worker/qr-codes" element={<QRCodesPage />} />

          {/* Stock Routes - Operators can access these */}
          <Route path="/stock/inventory-movement-logs" element={<InventoryMovementLogs />} />
          <Route path="/stock/stock-levels" element={<StockLevels />} />

          {/* Superadmin Routes - Protected from operators */}
          <Route path="/" element={<OperatorProtectedRoute><DashboardPage /></OperatorProtectedRoute>} />
          <Route path="/products" element={<OperatorProtectedRoute><ProductsPage /></OperatorProtectedRoute>} />
          <Route path="/products/add" element={<OperatorProtectedRoute><AddProductPage /></OperatorProtectedRoute>} />
          <Route path="/products/:id/edit" element={<OperatorProtectedRoute><EditProductPage /></OperatorProtectedRoute>} />
          <Route path="/products-components" element={<OperatorProtectedRoute><ProductsComponentsPage /></OperatorProtectedRoute>} />
          <Route path="/materials" element={<OperatorProtectedRoute><MaterialsPage /></OperatorProtectedRoute>} />
          <Route path="/materials/add" element={<OperatorProtectedRoute><AddMaterialPage /></OperatorProtectedRoute>} />
          <Route path="/materials/:id/edit" element={<OperatorProtectedRoute><EditMaterialPage /></OperatorProtectedRoute>} />
          <Route path="/workcenters" element={<OperatorProtectedRoute><WorkcentersPage /></OperatorProtectedRoute>} />
          <Route path="/workcenters/add" element={<OperatorProtectedRoute><AddWorkcenterPage /></OperatorProtectedRoute>} />
          <Route path="/workcenters/:id/edit" element={<OperatorProtectedRoute><EditWorkcenterPage /></OperatorProtectedRoute>} />

          {/* Production Routes */}
          <Route path="/production/orders" element={<OperatorProtectedRoute><OrdersPage /></OperatorProtectedRoute>} />
          <Route path="/production/orders/add" element={<OperatorProtectedRoute><AddOrderPage /></OperatorProtectedRoute>} />
          <Route path="/production/orders/:id" element={<OperatorProtectedRoute><OrderDetailPage /></OperatorProtectedRoute>} />
          <Route path="/production/orders/:id/edit" element={<OperatorProtectedRoute><EditOrderPage /></OperatorProtectedRoute>} />
          <Route path="/production/outputs" element={<OperatorProtectedRoute><ProductionOutputsPage /></OperatorProtectedRoute>} />
          <Route path="/production/outputs/add" element={<OperatorProtectedRoute><AddProductionOutputPage /></OperatorProtectedRoute>} />
          <Route path="/production/outputs/:id/edit" element={<OperatorProtectedRoute><EditProductionOutputPage /></OperatorProtectedRoute>} />
          <Route path="/production/step-executions" element={<OperatorProtectedRoute><ProductionStepExecutionsPage /></OperatorProtectedRoute>} />
          <Route path="/production/step-executions/add" element={<OperatorProtectedRoute><AddProductionStepExecutionPage /></OperatorProtectedRoute>} />
          <Route path="/production/step-executions/:id/edit" element={<OperatorProtectedRoute><EditProductionStepExecutionPage /></OperatorProtectedRoute>} />
          <Route path="/production/steps" element={<OperatorProtectedRoute><ProductionStepsPage /></OperatorProtectedRoute>} />
          <Route path="/production/steps/add" element={<OperatorProtectedRoute><AddProductionStepPage /></OperatorProtectedRoute>} />
          <Route path="/production/steps/:id/edit" element={<OperatorProtectedRoute><EditProductionStepPage /></OperatorProtectedRoute>} />
          <Route path="/production/used-materials" element={<OperatorProtectedRoute><UsedMaterialsPage /></OperatorProtectedRoute>} />
          <Route path="/production/used-materials/add" element={<OperatorProtectedRoute><AddUsedMaterialPage /></OperatorProtectedRoute>} />
          <Route path="/production/used-materials/:id/edit" element={<OperatorProtectedRoute><EditUsedMaterialPage /></OperatorProtectedRoute>} />

          {/* Warehouse Routes */}
          <Route path="/warehouse/locations" element={<OperatorProtectedRoute><LocationsPage /></OperatorProtectedRoute>} />
          <Route path="/warehouse/locations/add" element={<OperatorProtectedRoute><AddLocationPage /></OperatorProtectedRoute>} />
          <Route path="/warehouse/locations/:id/edit" element={<OperatorProtectedRoute><EditLocationPage /></OperatorProtectedRoute>} />
          <Route path="/warehouse/warehouses" element={<OperatorProtectedRoute><WarehousesPage /></OperatorProtectedRoute>} />
          <Route path="/warehouse/warehouses/add" element={<OperatorProtectedRoute><AddWarehousePage /></OperatorProtectedRoute>} />
          <Route path="/warehouse/warehouses/:id/edit" element={<OperatorProtectedRoute><EditWarehousePage /></OperatorProtectedRoute>} />

          {/* Stock Management Routes - Add/Edit operations */}
          <Route path="/stock/inventory-movement-logs/add" element={<OperatorProtectedRoute><AddInventoryMovementPage /></OperatorProtectedRoute>} />
          <Route path="/stock/inventory-movement-logs/:id/edit" element={<OperatorProtectedRoute><EditInventoryMovementPage /></OperatorProtectedRoute>} />
          <Route path="/stock/stock-levels/add" element={<OperatorProtectedRoute><AddStockLevelPage /></OperatorProtectedRoute>} />
          <Route path="/stock/stock-levels/:id/edit" element={<OperatorProtectedRoute><EditStockLevelPage /></OperatorProtectedRoute>} />

          {/* Users Routes */}
          <Route path="/users" element={<OperatorProtectedRoute><UsersPage /></OperatorProtectedRoute>} />
          <Route path="/users/add" element={<OperatorProtectedRoute><AddUserPage /></OperatorProtectedRoute>} />
          <Route path="/users/:id/edit" element={<OperatorProtectedRoute><EditUserPage /></OperatorProtectedRoute>} />

          {/* Scrap Routes */}
          <Route path="/scrap/defects" element={<DefectsPage />} />
          <Route path="/scrap/reprocessing" element={<ReprocessingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

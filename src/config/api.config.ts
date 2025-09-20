// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://172.30.150.162:8001/api",
  ENDPOINTS: {
    // Orders
    ORDERS: "/orders/",
    ORDER_BY_ID: (id: string) => `/orders/${id}/`,

    // Step Executions
    STEP_EXECUTIONS: (orderId: string) => `/orders/${orderId}/step-executions/`,
    STEP_EXECUTION_BY_ID: (id: string) => `/step-executions/${id}/`,

    // Used Materials
    USED_MATERIALS: (orderId: string) => `/orders/${orderId}/used-materials/`,
    USED_MATERIAL_BY_ID: (id: string) => `/used-materials/${id}/`,

    // Production Steps
    PRODUCTION_STEPS: "/production-steps/",
    PRODUCTION_STEP_BY_ID: (id: string) => `/production-steps/${id}/`,

    // Materials
    MATERIALS: "/materials/",
    MATERIAL_BY_ID: (id: string) => `/materials/${id}/`,

    // Products
    PRODUCTS: "/products/",
    PRODUCT_BY_ID: (id: string) => `/products/${id}/`,

    // Work Centers
    WORK_CENTERS: "/workcenters/",
    WORK_CENTER_BY_ID: (id: string) => `/workcenters/${id}/`,

    // Operators
    OPERATORS: "/operators/",
    OPERATOR_BY_ID: (id: string) => `/operators/${id}/`,

    // Users
    USERS: "/users/",
    USER_BY_ID: (id: string) => `/users/${id}/`,

    // Production Outputs
    PRODUCTION_OUTPUTS: "/production-outputs/",
    PRODUCTION_OUTPUT_BY_ID: (id: string) => `/production-outputs/${id}/`,

    // Step Executions (All)
    ALL_STEP_EXECUTIONS: "/step-executions/",

    // Used Materials (All)
    ALL_USED_MATERIALS: "/used-materials/",

    // Stock Management
    INVENTORY_MOVEMENT_LOGS: "/inventory-movement-logs/",
    INVENTORY_MOVEMENT_BY_ID: (id: string) => `/inventory-movement-logs/${id}/`,
    STOCK_LEVELS: "/stock-levels/",
    STOCK_LEVEL_BY_ID: (id: string) => `/stock-levels/${id}/`,
    STOCK_LEVELS_BULK: "/stock-levels/bulk/",
    STOCK_SUMMARY: "/stock/summary/",
    STOCK_EXPORT: "/stock/export/",
    INVENTORY_MOVEMENTS_EXPORT: "/inventory-movements/export/",

    // Warehouses
    WAREHOUSES: "/warehouses/",
    WAREHOUSE_BY_ID: (id: string) => `/warehouses/${id}/`,
    LOCATIONS: "/locations/",
    LOCATION_BY_ID: (id: string) => `/locations/${id}/`,

    // Worker API endpoints
    WORKER_ORDERS: "/worker/used-materials/orders/",
    WORKER_ORDER_STEPS: () => `/production-steps/`,
    WORKER_WORKCENTER_STOCK: (workcenterId: string) => `/worker/used-materials/workcenter_stock/?workcenter_id=${workcenterId}`,
    WORKER_BULK_CREATE: "/worker/used-materials/bulk_create/",
    WORKER_MATERIALS: "/worker/used-materials/materials/",
    WORKER_PRODUCTS: "/worker/used-materials/products/",

    // Bunker API endpoints
    BUNKERS: "/extruder/bunkers/",
    BUNKER_BY_ID: (id: string) => `/extruder/bunkers/${id}/`,
    BUNKER_STATUS: (id: string) => `/extruder/bunkers/${id}`,
    BUNKER_FILL: (id: string) => `/extruder/bunkers/${id}/fill_bunker/`,
    BUNKER_SHIFT_STATUS: (id: string) => `/extruder/bunkers/${id}/shift_status/`,
    BUNKER_START_SHIFT: (id: string) => `/extruder/bunkers/${id}/start_shift/`,
    BUNKER_END_SHIFT: (id: string) => `/extruder/bunkers/${id}/end_shift/`,
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Status mappings
export const STATUS_MAPPINGS = {
  ORDER_STATUS: {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  },
  STEP_STATUS: {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    FAILED: "Failed",
    SKIPPED: "Skipped",
  },
  UNIT_OF_MEASURE: {
    KG: "Kilogram",
    METER: "Meter",
    METER_SQUARE: "Square Meter",
    PIECE: "Piece",
    LITER: "Liter",
  },
  QUALITY_STATUS: {
    PASSED: "Passed",
    FAILED: "Failed",
    PENDING: "Pending",
  },
  MOVEMENT_TYPE: {
    IN: "IN",
    OUT: "OUT",
    TRANSFER: "TRANSFER",
  },
  STOCK_STATUS: {
    LOW: "LOW",
    NORMAL: "NORMAL",
    HIGH: "HIGH",
    OUT_OF_STOCK: "OUT_OF_STOCK",
  },
};

// Default values
export const DEFAULT_VALUES = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300, // milliseconds
  REFRESH_INTERVAL: 30000, // 30 seconds
};

export default API_CONFIG;

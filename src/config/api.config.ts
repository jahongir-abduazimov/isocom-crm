// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://192.168.0.108:8001/api",
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

    // Worker API endpoints - New Workflow
    WORKER_WORKCENTERS: "/worker/used-materials/workcenters/",
    WORKER_ORDERS_BY_WORKCENTER_TYPE: (workcenterType: string) => `/worker/used-materials/orders_by_workcenter_type/?workcenter_type=${workcenterType}`,
    WORKER_PRODUCTION_STEPS_BY_WORKCENTER_TYPE: (workcenterType: string) => `/worker/used-materials/production_steps_by_workcenter_type/?workcenter_type=${workcenterType}`,
    WORKER_GET_OR_CREATE_STEP_EXECUTION: (orderId: string, workcenterType: string) => `/worker/used-materials/get_or_create_step_execution/?order_id=${orderId}&workcenter_type=${workcenterType}`,
    WORKER_BULK_CREATE_BY_WORKCENTER_TYPE: "/worker/used-materials/bulk_create_by_workcenter_type/",
    WORKER_WORKCENTER_STOCK: (workcenterId: string) => `/worker/used-materials/workcenter_stock/?workcenter_id=${workcenterId}`,

    // Legacy Worker API endpoints (for backward compatibility)
    WORKER_ORDERS: "/worker/used-materials/orders/",
    WORKER_ALL_ORDERS: "/worker/used-materials/orders/",
    WORKER_ORDER_STEPS: () => `/production-steps/`,
    WORKER_BULK_CREATE: "/worker/used-materials/bulk_create/",
    WORKER_MATERIALS: "/worker/used-materials/materials/",
    WORKER_PRODUCTS: "/worker/used-materials/products/",

    // Bunker API endpoints - New System
    BUNKERS: "/bunker/bunkers/",
    BUNKER_BY_ID: (id: string) => `/bunker/bunkers/${id}/`,
    BUNKER_STATUS: (id: string) => `/bunker/fill-sessions/bunker_status/?bunker_id=${id}`,

    // Container endpoints
    CONTAINERS: "/bunker/containers/",
    CONTAINER_BY_ID: (id: string) => `/bunker/containers/${id}/`,

    // Fill session endpoints
    FILL_SESSIONS: "/bunker/fill-sessions/",
    FILL_SESSION_BY_ID: (id: string) => `/bunker/fill-sessions/${id}/`,
    FILL_BUNKER: "/bunker/fill-sessions/fill_bunker/",
    PROCESS_REMAINING_MATERIALS: (id: string) => `/bunker/fill-sessions/${id}/process_remaining_materials/`,

    // Legacy Bunker API endpoints (for backward compatibility)
    LEGACY_BUNKERS: "/extruder/bunkers/",
    LEGACY_BUNKER_BY_ID: (id: string) => `/extruder/bunkers/${id}/`,
    LEGACY_BUNKER_STATUS: (id: string) => `/extruder/bunkers/${id}`,
    LEGACY_BUNKER_FILL: (id: string) => `/extruder/bunkers/${id}/fill_bunker/`,
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
    PENDING: "Kutilmoqda",
    IN_PROGRESS: "Jarayonda",
    COMPLETED: "Yakunlangan",
    CANCELLED: "Bekor qilingan",
  },
  STEP_STATUS: {
    PENDING: "Kutilmoqda",
    IN_PROGRESS: "Jarayonda",
    COMPLETED: "Yakunlangan",
    FAILED: "Muvaffaqiyatsiz",
    SKIPPED: "O'tkazib yuborilgan",
  },
  UNIT_OF_MEASURE: {
    KG: "Kilogram",
    METER: "Metr",
    METER_SQUARE: "Kvadrat metr",
    PIECE: "Dona",
    LITER: "Litr",
  },
  QUALITY_STATUS: {
    PASSED: "O'tgan",
    FAILED: "O'tmagan",
    PENDING: "Kutilmoqda",
  },
  MOVEMENT_TYPE: {
    IN: "KIRISH",
    OUT: "CHIQISH",
    TRANSFER: "KO'CHIRISH",
  },
  STOCK_STATUS: {
    LOW: "KAM",
    NORMAL: "ODDIY",
    HIGH: "KO'P",
    OUT_OF_STOCK: "TUGAGAN",
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

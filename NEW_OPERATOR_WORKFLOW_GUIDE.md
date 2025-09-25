# Yangi Operator Workflow - Ishlab Chiqarish Tizimi

## Umumiy Ma'lumot

Bu hujjat yangi operator workflow ni tasvirlaydi, bu yerda operatorlar avval workcenter type ni, keyin order ni, va oxirida ishlatilgan materiallarni tanlaydilar.

## Yangi Workflow

### 1. Workcenter Type Tanlash
Operator avval workcenter type ni tanlaydi (EXTRUDER, LAMINATOR, BRONIROVSHIK, va h.k.)

### 2. Order Tanlash  
Sistema workcenter type bo'yicha mavjud orderlarni ko'rsatadi

### 3. Production Step Tanlash
Sistema workcenter type uchun production step larni ko'rsatadi

### 4. Material Qo'shish
Operator ishlatilgan materiallarni qo'shadi

## API Endpoints

### 1. Workcenterlar Ro'yxati
```
GET /api/production/worker-used-materials/workcenters/
```
**Response:**
```json
[
    {
        "id": "uuid",
        "name": "Extruder 1", 
        "type": "EXTRUDER",
        "description": "Extruder description"
    }
]
```

### 2. Workcenter Type bo'yicha Orderlar
```
GET /api/production/worker-used-materials/orders_by_workcenter_type/?workcenter_type=EXTRUDER
```
**Response:**
```json
{
    "workcenter_type": "EXTRUDER",
    "orders": [
        {
            "id": "uuid",
            "produced_product_name": "Product Name",
            "produced_quantity": 100.0,
            "unit_of_measure": "KG",
            "status": "PENDING",
            "description": "Order description",
            "step_execution_id": "uuid",
            "step_name": "Extrusion Process",
            "step_status": "PENDING",
            "created_at": "2024-01-01T00:00:00Z"
        }
    ],
    "total_orders": 1
}
```

### 3. Workcenter Type bo'yicha Production Steps
```
GET /api/production/worker-used-materials/production_steps_by_workcenter_type/?workcenter_type=EXTRUDER
```
**Response:**
```json
{
    "workcenter_type": "EXTRUDER",
    "production_steps": [
        {
            "id": "uuid",
            "name": "Extrusion Process",
            "step_type": "EXTRUSION",
            "description": "Extrusion step description",
            "duration_hours": 8.0,
            "order_sequence": 1
        }
    ]
}
```

### 4. Step Execution Olish yoki Yaratish
```
GET /api/production/worker-used-materials/get_or_create_step_execution/?order_id=uuid&workcenter_type=EXTRUDER
```
**Response:**
```json
{
    "step_execution_id": "uuid",
    "order_id": "uuid", 
    "production_step_id": "uuid",
    "production_step_name": "Extrusion Process",
    "status": "PENDING",
    "created": true,
    "workcenter_type": "EXTRUDER"
}
```

### 5. Used Material Bulk Yaratish (Yangi Workflow)
```
POST /api/production/worker-used-materials/bulk_create_by_workcenter_type/
```
**Request Body:**
```json
{
    "order_id": "uuid",
    "production_step_id": "uuid",
    "operator_id": "uuid", 
    "workcenter_type": "EXTRUDER",
    "items": [
        {
            "material_id": "uuid",
            "quantity": 50.0,
            "unit_of_measure": "KG"
        },
        {
            "product_id": "uuid",
            "quantity": 25.0,
            "unit_of_measure": "KG"
        }
    ]
}
```
**Response:**
```json
{
    "message": "2 ta item muvaffaqiyatli qo'shildi",
    "order_id": "uuid",
    "order_status": "IN_PROGRESS",
    "step_execution_id": "uuid",
    "step_execution_created": true,
    "production_step_name": "Extrusion Process",
    "workcenter_type": "EXTRUDER",
    "created_items_count": 2,
    "assigned_operator": "operator_username",
    "assigned_operator_id": "uuid"
}
```

### 6. Workcenter Stock Levels
```
GET /api/production/worker-used-materials/workcenter_stock/?workcenter_id=uuid
```
**Response:**
```json
{
    "workcenter_location": "Extruder Location",
    "materials": [
        {
            "material__id": "uuid",
            "material__name": "Material Name",
            "material__unit_of_measure": "KG",
            "quantity": 1000.0
        }
    ],
    "products": [
        {
            "product__id": "uuid", 
            "product__name": "Product Name",
            "quantity": 500.0
        }
    ]
}
```

## Frontend Integration

### 1. Workcenter Type Selection
```javascript
// Get available workcenters
const workcenters = await fetch('/api/production/worker-used-materials/workcenters/');
const workcenterTypes = [...new Set(workcenters.map(wc => wc.type))];

// User selects workcenter type
const selectedWorkcenterType = 'EXTRUDER';
```

### 2. Order Selection
```javascript
// Get orders for selected workcenter type
const orders = await fetch(`/api/production/worker-used-materials/orders_by_workcenter_type/?workcenter_type=${selectedWorkcenterType}`);

// User selects an order
const selectedOrder = orders.orders[0];
```

### 3. Production Step Selection
```javascript
// Get production steps for workcenter type
const steps = await fetch(`/api/production/worker-used-materials/production_steps_by_workcenter_type/?workcenter_type=${selectedWorkcenterType}`);

// User selects a step
const selectedStep = steps.production_steps[0];
```

### 4. Step Execution Creation
```javascript
// Get or create step execution
const stepExecution = await fetch(`/api/production/worker-used-materials/get_or_create_step_execution/?order_id=${selectedOrder.id}&workcenter_type=${selectedWorkcenterType}`);
```

### 5. Material Addition
```javascript
// Add used materials
const bulkCreateData = {
    order_id: selectedOrder.id,
    production_step_id: selectedStep.id,
    operator_id: currentUser.id,
    workcenter_type: selectedWorkcenterType,
    items: [
        {
            material_id: selectedMaterial.id,
            quantity: 50.0,
            unit_of_measure: 'KG'
        }
    ]
};

const result = await fetch('/api/production/worker-used-materials/bulk_create_by_workcenter_type/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(bulkCreateData)
});
```

## Avtomatik Jarayonlar

### 1. Order Status Yangilanishi
- Agar order PENDING holatida bo'lsa, avtomatik IN_PROGRESS ga o'zgaradi
- Order ga operator tayinlanadi
- Order start_date o'rnatiladi

### 2. Step Execution Yaratish
- Agar step execution mavjud bo'lmasa, avtomatik yaratiladi
- Step execution status IN_PROGRESS ga o'zgaradi
- Step execution ga operator qo'shiladi

### 3. Stock Level Yangilanishi
- Used material yaratilganda, avtomatik stock level kamayadi
- Workcenter location dan material/product olib tashlanadi

## Xatoliklar va Validatsiya

### 1. Serializer Validatsiya
- Order mavjudligi tekshiriladi
- Production step workcenter type mos kelishini tekshiriladi
- Operator operator ekanligi tekshiriladi
- Material yoki Product ID dan kamida bittasi bo'lishi kerak

### 2. Stock Validatsiya
- Material/product workcenter da mavjudligi tekshiriladi
- Yetarli miqdor borligi tekshiriladi

### 3. Xatolik Xabarlari
```json
{
    "error": "Order topilmadi!",
    "error": "Production step workcenter type mos kelmaydi!",
    "error": "Tanlangan foydalanuvchi operator emas!",
    "error": "Material yoki Product ID tanlanishi kerak!",
    "error": "Material va Product bir vaqtda tanlanishi mumkin emas!"
}
```

## Asosiy Afzalliklar

✅ **Workcenter type-based workflow** - Operatorlar workcenter type bo'yicha ishlaydilar
✅ **Avtomatik step execution yaratish** - Sistema avtomatik step execution yaratadi
✅ **Yaxshilangan operator tayinlash** - Operatorlar avtomatik tayinlanadi
✅ **Yaxshilangan stock boshqaruvi** - Stock level avtomatik yangilanadi
✅ **Soddalashtirilgan API** - Operatorlar uchun oson API
✅ **Yaxshilangan validatsiya** - Keng qamrovli xatolik tekshiruvi

## Migration Guide

### Eski Workflow dan Yangi Workflow ga O'tish

1. **Frontend o'zgartirishlar:**
   - Workcenter type selection qo'shish
   - Order selection workcenter type bo'yicha
   - Production step selection workcenter type bo'yicha
   - Step execution avtomatik yaratish

2. **API o'zgartirishlar:**
   - Yangi endpoint lar qo'shildi
   - Eski endpoint lar saqlanadi (backward compatibility)
   - Yangi serializer lar qo'shildi

3. **Database o'zgartirishlar:**
   - Hech qanday migration kerak emas
   - Mavjud modellar ishlatiladi
   - Yangi workflow mavjud ma'lumotlar bilan ishlaydi

## Test Qilish

Test fayllar:
- `test_new_workflow.py` - To'liq workflow test
- `test_workflow_simple.py` - API endpoint test

Test ishga tushirish:
```bash
python test_workflow_simple.py
```

## Xulosa

Yangi operator workflow operatorlar uchun ancha sodda va intuitiv. Sistema avtomatik ko'plab jarayonlarni bajaradi va operatorlar faqat kerakli ma'lumotlarni kiritishlari kerak.

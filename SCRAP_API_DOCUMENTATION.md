# Brak API Dokumentatsiyasi

## 1. Brak Yaratish va Ko'rish

### 1.1 Brak Ro'yxatini Olish

```http
GET /api/scrap/
```

**Query Parametrlari:**

- `step_execution` - Ishlab chiqarish qadami ID si
- `scrap_type` - Brak turi (HARD/SOFT)
- `status` - Holati (PENDING/IN_PROCESS/COMPLETED)
- `recorded_by` - Qayd etgan foydalanuvchi ID si

**Response:**

```json
[
  {
    "id": "uuid",
    "step_execution": "uuid",
    "scrap_type": "HARD",
    "quantity": "10.00",
    "weight": "10.00",
    "unit_of_measure": "KG",
    "reason": "MATERIAL_DEFECT",
    "status": "PENDING",
    "recorded_by": {
      "id": "uuid",
      "username": "operator1",
      "full_name": "Operator 1"
    },
    "notes": "Izoh"
  }
]
```

### 1.2 Brak Detallarini Olish

```http
GET /api/scrap/{id}/
```

## 2. Brak Qayta Ishlash

### 2.1 Qayta Ishlash Partiyasini Yaratish

```http
POST /api/recycling/start_recycling/
```

**Response:**

```json
{
  "id": "uuid",
  "batch_number": "RB-2025-001",
  "started_at": "2025-09-22T10:00:00Z",
  "started_by": {
    "id": "uuid",
    "username": "operator1",
    "full_name": "Operator 1"
  },
  "status": "IN_PROCESS"
}
```

### 2.2 Joriy Braklar Miqdorini Olish

```http
GET /api/recycling/current_totals/
```

**Response:**

```json
{
  "hard_scrap_total": "80.00",
  "soft_scrap_total": "40.00",
  "unit_of_measure": "KG"
}
```

### 2.3 Drobilka Jarayonini Boshlash

```http
POST /api/drobilka/
```

**Request Body:**

```json
{
  "recycling_batch": "uuid",
  "drobilka_type": "HARD", // HARD yoki SOFT
  "work_center": "uuid", // BRAK_MAYDALAGICH turidagi stanok
  "input_quantity": "50.00",
  "operators": ["uuid1", "uuid2", "uuid3"] // 2-3 ta operator ID lari
}
```

**Response:**

```json
{
  "id": "uuid",
  "recycling_batch": "uuid",
  "drobilka_type": "HARD",
  "drobilka_type_display": "Qattiq",
  "work_center": "uuid",
  "work_center_name": "Hard Drobilka 1",
  "input_quantity": "50.00",
  "output_quantity": null,
  "operators": ["uuid1", "uuid2", "uuid3"],
  "operators_details": [
    {
      "id": "uuid1",
      "name": "Operator 1",
      "username": "operator1"
    }
    // ...
  ],
  "lead_operator": "uuid1",
  "lead_operator_name": "Operator 1",
  "started_at": "2025-09-22T10:00:00Z",
  "completed_at": null,
  "notes": "Izoh"
}
```

### 2.4 Drobilka Jarayonini Yakunlash

```http
PATCH /api/drobilka/{id}/
```

**Request Body:**

```json
{
  "output_quantity": "48.50",
  "completed_at": "2025-09-22T11:00:00Z",
  "notes": "Yakunlandi"
}
```

### 2.5 Qayta Ishlash Partiyasini Yakunlash

```http
POST /api/recycling/{batch_id}/complete_recycling/
```

**Response:**

```json
{
  "id": "uuid",
  "batch_number": "RB-2025-001",
  "started_at": "2025-09-22T10:00:00Z",
  "completed_at": "2025-09-22T12:00:00Z",
  "status": "COMPLETED",
  "total_input": "120.00",
  "total_output": "115.50",
  "notes": "Yakunlandi"
}
```

## 3. Muhim O'zgarishlar

1. **Brak Avtomatik Hisoblash:**

   - Extruder bosqichida: 20%
   - Laminatsiya bosqichida: 10%
   - Boshqa bosqichlarda: 3%

2. **Drobilka Jarayoni:**

   - Hard va Soft drobilkalarda 2-3 ta operator ishlashi mumkin
   - Har bir drobilka jarayonida bitta mas'ul operator (lead_operator) bo'ladi
   - Faqat BRAK_MAYDALAGICH turidagi stanoklar tanlash mumkin

3. **Qayta Ishlash Jarayoni:**
   - Qayta ishlash boshlanganda, barcha to'plangan qattiq braklar hard drobilkada maydalanadi
   - Maydalangan qattiq braklar yumshoq brakka qo'shiladi
   - Barcha yumshoq braklar soft drobilkada qayta ishlanadi
   - Qayta ishlash yakunlangach, VT granulasi ko'rinishiga keltiriladi

## 4. Xatolik Kodlari

- `400 Bad Request` - Noto'g'ri so'rov

  - `INVALID_WORK_CENTER` - Noto'g'ri stanok turi
  - `INSUFFICIENT_OPERATORS` - Operatorlar soni yetarli emas
  - `INVALID_QUANTITY` - Noto'g'ri miqdor

- `404 Not Found` - Ma'lumot topilmadi
- `403 Forbidden` - Ruxsat yo'q

## 5. Muhim Eslatmalar

1. Qayta ishlash boshlangach, faqat to'plangan miqdorgina qayta ishlanadi
2. Agar zavodda boshqa ishlab chiqarish amallari bo'layotgan bo'lsa, ularning braklari keyingi qayta ishlash partiyasiga qoldiriladi
3. Drobilka jarayonida kamida 2 ta operator bo'lishi shart
4. Har bir drobilka jarayonida bitta mas'ul operator (lead_operator) avtomatik belgilanadi

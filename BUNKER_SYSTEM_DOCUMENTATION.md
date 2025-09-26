# Bunker System Documentation

## Umumiy ma'lumot

Bunker tizimi ishlab chiqarish jarayonida materiallarni saqlash va boshqarish uchun mo'ljallangan. Tizim ikki bosqichli to'ldirish jarayonini qo'llab-quvvatlaydi: konteyner → bunker.

## Tizim arxitekturasi

### Asosiy komponentlar

1. **Bunker** - Materiallarni saqlash uchun asosiy konteyner
2. **Container** - Bunker yonidagi oraliq konteyner
3. **BunkerFillSession** - Bunker to'ldirish sessiyasi
4. **BunkerFillMaterial** - To'ldirishda ishlatilgan materiallar

## API Endpoints

### 1. Bunker Management

#### Bunker ro'yxati
```
GET /api/bunker/bunkers/
```

**Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "work_center": "uuid",
      "work_center_name": "Test Extruder",
      "name": "Test Bunker",
      "capacity_kg": "1000.00",
      "is_filled": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Bunker yaratish
```
POST /api/bunker/bunkers/
```

**Request:**
```json
{
  "work_center": "uuid",
  "name": "Test Bunker",
  "capacity_kg": 1000.0
}
```

#### Bunker ma'lumotlari
```
GET /api/bunker/bunkers/{id}/
```

#### Bunker yangilash
```
PUT /api/bunker/bunkers/{id}/
PATCH /api/bunker/bunkers/{id}/
```

#### Bunker o'chirish
```
DELETE /api/bunker/bunkers/{id}/
```

### 2. Container Management

#### Container ro'yxati
```
GET /api/bunker/containers/
```

**Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "bunker": "uuid",
      "bunker_name": "Test Bunker",
      "container_name": "Test Container",
      "empty_weight_kg": "50.00",
      "max_capacity_kg": "500.00",
      "current_capacity_kg": "150.00",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Container yaratish
```
POST /api/bunker/containers/
```

**Request:**
```json
{
  "bunker": "uuid",
  "container_name": "Test Container",
  "empty_weight_kg": 50.0,
  "max_capacity_kg": 500.0,
  "current_capacity_kg": 0.0
}
```

### 3. Bunker Fill Sessions

#### Fill session ro'yxati
```
GET /api/bunker/fill-sessions/
```

**Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "filled_by_name": "John Doe",
      "bunker_name": "Test Bunker",
      "container_name": "Test Container",
      "bunker_capacity_kg": "1000.00",
      "order": "uuid",
      "order_number": "ORD-001",
      "materials": [
        {
          "id": "uuid",
          "fill_session": "uuid",
          "material": "uuid",
          "material_name": "PVD HIGH",
          "material_code": "PVD001",
          "quantity_kg": "80.00"
        }
      ],
      "daily_material_summary": {
        "total_pvd_added": 50.0,
        "total_vt_added": 30.0,
        "total_materials_added": 80.0,
        "operators": [
          {
            "operator_name": "John Doe",
            "material_name": "PVD HIGH",
            "quantity": 25.0,
            "added_at": "2024-01-01T10:00:00Z"
          }
        ]
      },
      "total_materials_added": "150.00",
      "bunker_remaining_kg": "850.00",
      "material_percentages": {
        "PVD HIGH": 53.33,
        "VT WHITE": 33.33,
        "TALK": 13.33
      },
      "remaining_material_percentages": {
        "remaining_pvd_percentage": 62.5,
        "remaining_vt_percentage": 37.5
      },
      "container_previous_weight_kg": "75.00",
      "filled_at": "2024-01-01T18:00:00Z",
      "notes": "End of day filling",
      "is_remaining_processed": false
    }
  ]
}
```

#### Bunker to'ldirish
```
POST /api/bunker/fill-sessions/fill_bunker/
```

**Request:**
```json
{
  "bunker": "uuid",
  "container": "uuid",
  "filled_by": "uuid",
  "order": "uuid",
  "container_previous_weight_kg": 75.0,
  "notes": "End of day bunker filling",
  "materials": [
    {
      "material": "uuid",
      "quantity_kg": 80.0
    },
    {
      "material": "uuid",
      "quantity_kg": 50.0
    },
    {
      "material": "uuid",
      "quantity_kg": 20.0
    }
  ]
}
```

**Response:**
```json
{
  "message": "Bunker muvaffaqiyatli to'ldirildi (konteyner → bunker)",
  "fill_session": {
    "id": "uuid",
    "filled_by_name": "John Doe",
    "bunker_name": "Test Bunker",
    "container_name": "Test Container",
    "bunker_capacity_kg": "1000.00",
    "order": "uuid",
    "order_number": "ORD-001",
    "materials": [...],
    "daily_material_summary": {...},
    "total_materials_added": "150.00",
    "bunker_remaining_kg": "850.00",
    "material_percentages": {...},
    "remaining_material_percentages": {...}
  }
}
```

#### Bunker holati
```
GET /api/bunker/fill-sessions/bunker_status/?bunker_id=uuid
```

**Response:**
```json
{
  "id": "uuid",
  "filled_by_name": "John Doe",
  "bunker_name": "Test Bunker",
  "container_name": "Test Container",
  "bunker_capacity_kg": "1000.00",
  "order": "uuid",
  "order_number": "ORD-001",
  "materials": [...],
  "daily_material_summary": {...},
  "total_materials_added": "150.00",
  "bunker_remaining_kg": "850.00",
  "material_percentages": {...},
  "remaining_material_percentages": {...}
}
```

#### Qoldiq materiallarni ayrish
```
POST /api/bunker/fill-sessions/{id}/process_remaining_materials/
```

**Response:**
```json
{
  "message": "Qoldiq materiallar muvaffaqiyatli ayrildi",
  "order_number": "ORD-001",
  "order_id": "uuid",
  "remaining_pvd_kg": 53.125,
  "remaining_vt_kg": 31.875,
  "total_remaining_kg": 85.0
}
```

## Frontend Integration

### 1. Bunker Dashboard

```javascript
// Bunker ro'yxatini olish
const getBunkers = async () => {
  const response = await fetch('/api/bunker/bunkers/', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Bunker holatini olish
const getBunkerStatus = async (bunkerId) => {
  const response = await fetch(`/api/bunker/fill-sessions/bunker_status/?bunker_id=${bunkerId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### 2. Bunker To'ldirish Formasi

```javascript
// Bunker to'ldirish
const fillBunker = async (fillData) => {
  const response = await fetch('/api/bunker/fill-sessions/fill_bunker/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fillData)
  });
  return response.json();
};

// Qoldiq materiallarni ayrish
const processRemainingMaterials = async (fillSessionId) => {
  const response = await fetch(`/api/bunker/fill-sessions/${fillSessionId}/process_remaining_materials/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### 3. React Component Misoli

```jsx
import React, { useState, useEffect } from 'react';

const BunkerFillForm = ({ bunkerId, containerId, orderId }) => {
  const [materials, setMaterials] = useState([]);
  const [containerWeight, setContainerWeight] = useState(0);
  const [notes, setNotes] = useState('');

  const addMaterial = () => {
    setMaterials([...materials, { material: '', quantity_kg: 0 }]);
  };

  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fillData = {
      bunker: bunkerId,
      container: containerId,
      order: orderId,
      container_previous_weight_kg: containerWeight,
      notes: notes,
      materials: materials
    };

    try {
      const result = await fillBunker(fillData);
      console.log('Bunker filled successfully:', result);
      
      // Qoldiq materiallarni ayrish
      if (result.fill_session?.id) {
        const remainingResult = await processRemainingMaterials(result.fill_session.id);
        console.log('Remaining materials processed:', remainingResult);
      }
    } catch (error) {
      console.error('Error filling bunker:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Container Previous Weight (kg):</label>
        <input
          type="number"
          value={containerWeight}
          onChange={(e) => setContainerWeight(parseFloat(e.target.value))}
          required
        />
      </div>

      <div>
        <label>Materials:</label>
        {materials.map((material, index) => (
          <div key={index}>
            <select
              value={material.material}
              onChange={(e) => {
                const newMaterials = [...materials];
                newMaterials[index].material = e.target.value;
                setMaterials(newMaterials);
              }}
            >
              <option value="">Select Material</option>
              {/* Material options */}
            </select>
            <input
              type="number"
              value={material.quantity_kg}
              onChange={(e) => {
                const newMaterials = [...materials];
                newMaterials[index].quantity_kg = parseFloat(e.target.value);
                setMaterials(newMaterials);
              }}
              placeholder="Quantity (kg)"
            />
            <button type="button" onClick={() => removeMaterial(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addMaterial}>
          Add Material
        </button>
      </div>

      <div>
        <label>Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button type="submit">Fill Bunker</button>
    </form>
  );
};

export default BunkerFillForm;
```

## Ma'lumotlar tuzilishi

### Bunker Model
```python
class Bunker(BaseModel):
    work_center = ForeignKey('workcenter.WorkCenter')
    name = CharField(max_length=255)
    capacity_kg = DecimalField(max_digits=10, decimal_places=2)
    is_filled = BooleanField(default=False)
```

### Container Model
```python
class Container(BaseModel):
    bunker = ForeignKey(Bunker)
    container_name = CharField(max_length=255)
    empty_weight_kg = DecimalField(max_digits=10, decimal_places=2)
    max_capacity_kg = DecimalField(max_digits=10, decimal_places=2)
    current_capacity_kg = DecimalField(max_digits=10, decimal_places=2)
```

### BunkerFillSession Model
```python
class BunkerFillSession(BaseModel):
    bunker = ForeignKey(Bunker)
    container = ForeignKey(Container)
    filled_by = ForeignKey('user.User')
    order = ForeignKey('production.Order')
    filled_at = DateTimeField(auto_now_add=True)
    notes = TextField(blank=True)
    
    # Konteyner og'irligi
    container_previous_weight_kg = DecimalField(max_digits=10, decimal_places=2)
    
    # Hisoblangan qoldiq va material ulushlari
    bunker_remaining_kg = DecimalField(max_digits=10, decimal_places=2)
    remaining_pvd_percentage = DecimalField(max_digits=10, decimal_places=2)
    remaining_vt_percentage = DecimalField(max_digits=10, decimal_places=2)
    
    # Jarayon holati
    is_remaining_processed = BooleanField(default=False)
```

### BunkerFillMaterial Model
```python
class BunkerFillMaterial(BaseModel):
    fill_session = ForeignKey(BunkerFillSession)
    material = ForeignKey('material.Material')
    quantity_kg = DecimalField(max_digits=10, decimal_places=2)
```

## Ishlatish jarayoni

### 1. Bunker tayyorlash
1. Bunker yaratish
2. Container yaratish
3. Work center bilan bog'lash

### 2. Kun bo'yi ishlash
1. Operatorlar materiallarni bunkerga qo'shadi
2. Har bir qo'shilgan material `UsedMaterial` modelida saqlanadi
3. Kun oxirida bunker to'ldiriladi

### 3. Bunker to'ldirish
1. Container oldingi og'irligini o'lchash
2. Materiallarni containerga to'kish
3. Materiallarni bunkerga to'kish
4. Qoldiq materiallarni hisoblash
5. Qoldiq materiallarni `UsedMaterial` dan ayrish

### 4. Qoldiq materiallarni ayrish
1. Bunker to'ldirilgach, qoldiq materiallar hisoblanadi
2. PVD va VT materiallarining ulushlari aniqlanadi
3. Qoldiq materiallar `UsedMaterial` dan ayriladi (StockLevel ga ta'sir qilmasdan)

## Xatoliklar bilan ishlash

### Umumiy xatoliklar
- **400 Bad Request**: Noto'g'ri ma'lumotlar yuborilgan
- **401 Unauthorized**: Autentifikatsiya talab qilinadi
- **404 Not Found**: Bunker yoki container topilmadi
- **500 Internal Server Error**: Server xatoligi

### Validation xatoliklari
```json
{
  "bunker": ["This field is required."],
  "container": ["This field is required."],
  "materials": ["At least one material is required."],
  "container_previous_weight_kg": ["This field is required."]
}
```

## Filterlash va qidiruv

### Bunker filterlash
```
GET /api/bunker/bunkers/?work_center=uuid&is_filled=true
```

### Fill session filterlash
```
GET /api/bunker/fill-sessions/?bunker=uuid&filled_by=uuid&order=uuid
```

### Qidiruv
```
GET /api/bunker/fill-sessions/?search=test
```

## Pagination

Barcha ro'yxatlar pagination qo'llab-quvvatlaydi:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/bunker/bunkers/?page=2",
  "previous": null,
  "results": [...]
}
```

## Autentifikatsiya

Barcha API endpointlar autentifikatsiya talab qiladi:

```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## Rate Limiting

API endpointlar rate limiting bilan himoyalangan. Har bir foydalanuvchi uchun daqiqada 100 ta so'rov ruxsat etilgan.

## Monitoring va Logging

Bunker tizimi barcha operatsiyalarni log qiladi:
- Bunker to'ldirish
- Qoldiq materiallarni ayrish
- Xatoliklar
- Performance metrikalar

## Test qilish

Test scripti mavjud: `test_bunker_system.py`

```bash
cd /Users/user/projects/isocom_II
source venv/bin/activate
python test_bunker_system.py
```

## Xavfsizlik

1. **Autentifikatsiya**: Barcha endpointlar JWT token talab qiladi
2. **Authorization**: Foydalanuvchi rollari tekshiriladi
3. **Validation**: Barcha ma'lumotlar validatsiya qilinadi
4. **SQL Injection**: Django ORM xavfsizligi
5. **XSS**: Ma'lumotlar sanitizatsiya qilinadi

## Performance

1. **Database Indexing**: Muhim fieldlar indekslangan
2. **Caching**: Tez-tez ishlatiladigan ma'lumotlar cache qilinadi
3. **Pagination**: Katta ro'yxatlar pagination bilan ko'rsatiladi
4. **Optimization**: N+1 query muammolari hal qilingan

## Kelajakdagi rivojlanish

1. **Real-time updates**: WebSocket orqali real-time yangilanishlar
2. **Mobile app**: React Native mobile ilovasi
3. **Analytics**: Bunker ishlatish statistikasi
4. **AI Integration**: Material optimizatsiyasi
5. **IoT Integration**: Sensor ma'lumotlari bilan integratsiya

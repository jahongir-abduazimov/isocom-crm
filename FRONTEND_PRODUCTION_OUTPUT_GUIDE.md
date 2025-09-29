# ProductionOutput Frontend Integration Guide

## Umumiy ma'lumot

Bu qo'llanma ProductionOutput API'sini frontendda qanday ishlatishni ko'rsatadi. ProductionOutput - bu ishlab chiqarish jarayonida mahsulot chiqimini kuzatish uchun ishlatiladi va endi spool/core (tare) funksiyasi bilan kengaytirilgan.

## API Endpoints

### Base URL
```
/api/production/production-outputs/
```

### HTTP Methods
- `GET` - Ro'yxatni olish
- `POST` - Yangi ProductionOutput yaratish
- `GET /{id}/` - Bitta ProductionOutput olish
- `PUT/PATCH /{id}/` - ProductionOutput yangilash
- `DELETE /{id}/` - ProductionOutput o'chirish

## Data Model

### ProductionOutput Fields

```typescript
interface ProductionOutput {
  id: number;
  step_execution: number;           // ProductionStepExecution ID
  product: number;                  // Product ID
  product_name: string;             // Product nomi (read-only)
  unit_of_measure: string;          // O'lchov birligi (KG, PIECE, METER, etc.)
  quantity: string;                 // Miqdor (Decimal)
  weight: string;                   // NET weight (kg)
  gross_weight?: string;            // Gross weight (kg) - ixtiyoriy
  tare_weight?: string;             // Tare weight (kg) - ixtiyoriy
  uses_spool: boolean;              // Spool ishlatilganmi?
  spool_count?: number;             // Spool soni (PIECE UOM uchun avtomatik)
  quality_status: string;           // Sifat holati (PASSED, FAILED, PENDING)
  operator?: number;                // Operator ID
  operator_name?: string;           // Operator ismi (read-only)
  notes?: string;                   // Izohlar
  order_id?: string;                // Order ID (read-only)
  order_description?: string;       // Order tavsifi (read-only)
  order_product_name?: string;      // Order mahsulot nomi (read-only)
  created_at: string;               // Yaratilgan vaqt
  updated_at: string;               // Yangilangan vaqt
}
```

## API Usage Examples

### 1. Ro'yxatni olish

```javascript
// Barcha ProductionOutput'larni olish
const response = await fetch('/api/production/production-outputs/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.results); // ProductionOutput array
```

### 2. Filtrlash va qidirish

```javascript
// Filtrlash parametrlari
const params = new URLSearchParams({
  step_execution: '123',           // Step execution ID
  product: '456',                  // Product ID
  quality_status: 'PASSED',        // Sifat holati
  operator: '789',                 // Operator ID
  step_execution__order: '101',    // Order ID
  search: 'product name',          // Qidirish
  ordering: '-created_at'          // Tartiblash
});

const response = await fetch(`/api/production/production-outputs/?${params}`);
```

### 3. Yangi ProductionOutput yaratish

#### Oddiy holat (spool ishlatilmasa)

```javascript
const createOutput = async (outputData) => {
  const response = await fetch('/api/production/production-outputs/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      step_execution: 123,
      product: 456,
      quantity: "2.0",
      weight: "12.350",
      uses_spool: false,
      quality_status: "PASSED",
      operator: 789,
      notes: "Oddiy mahsulot chiqimi"
    })
  });

  if (response.ok) {
    const newOutput = await response.json();
    console.log('Yaratildi:', newOutput);
    return newOutput;
  } else {
    const error = await response.json();
    console.error('Xato:', error);
    throw error;
  }
};
```

#### Spool bilan (gross + tare)

```javascript
const createOutputWithSpool = async (outputData) => {
  const response = await fetch('/api/production/production-outputs/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      step_execution: 123,
      product: 456,
      quantity: "1.0",
      uses_spool: true,
      gross_weight: "13.100",
      tare_weight: "0.750",
      quality_status: "PASSED",
      operator: 789,
      notes: "Spool bilan mahsulot"
    })
  });

  const result = await response.json();
  // result.weight = "12.350" (13.100 - 0.750)
  return result;
};
```

#### PIECE UOM (spool_count avtomatik hisoblanadi)

```javascript
const createPieceOutput = async (outputData) => {
  const response = await fetch('/api/production/production-outputs/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      step_execution: 123,
      product: 456,
      quantity: "5.0",
      weight: "25.000",
      uses_spool: true,
      unit_of_measure: "PIECE",
      quality_status: "PASSED",
      operator: 789
    })
  });

  const result = await response.json();
  // result.spool_count = 5 (avtomatik hisoblangan)
  return result;
};
```

### 4. ProductionOutput yangilash

```javascript
const updateOutput = async (outputId, updateData) => {
  const response = await fetch(`/api/production/production-outputs/${outputId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });

  if (response.ok) {
    const updatedOutput = await response.json();
    console.log('Yangilandi:', updatedOutput);
    return updatedOutput;
  } else {
    const error = await response.json();
    console.error('Xato:', error);
    throw error;
  }
};

// Spool qo'shish
await updateOutput(123, {
  gross_weight: "15.500",
  tare_weight: "2.000",
  uses_spool: true
});
// Natija: weight = "13.500" (15.500 - 2.000)
```

### 5. ProductionOutput o'chirish

```javascript
const deleteOutput = async (outputId) => {
  const response = await fetch(`/api/production/production-outputs/${outputId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    console.log('O\'chirildi');
  } else {
    const error = await response.json();
    console.error('Xato:', error);
    throw error;
  }
};
```

## React Component Examples

### 1. ProductionOutput Form Component

```jsx
import React, { useState } from 'react';

const ProductionOutputForm = ({ stepExecutionId, productId, onSuccess }) => {
  const [formData, setFormData] = useState({
    step_execution: stepExecutionId,
    product: productId,
    quantity: '',
    weight: '',
    gross_weight: '',
    tare_weight: '',
    uses_spool: false,
    unit_of_measure: 'KG',
    quality_status: 'PENDING',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/production/production-outputs/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newOutput = await response.json();
        onSuccess(newOutput);
        // Formni tozalash
        setFormData({
          step_execution: stepExecutionId,
          product: productId,
          quantity: '',
          weight: '',
          gross_weight: '',
          tare_weight: '',
          uses_spool: false,
          unit_of_measure: 'KG',
          quality_status: 'PENDING',
          notes: ''
        });
      } else {
        const errorData = await response.json();
        setErrors(errorData);
      }
    } catch (error) {
      console.error('Xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="production-output-form">
      <h3>Mahsulot Chiqimi</h3>
      
      {/* Miqdor */}
      <div className="form-group">
        <label>Miqdor *</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          step="0.01"
          required
        />
        {errors.quantity && <span className="error">{errors.quantity}</span>}
      </div>

      {/* O'lchov birligi */}
      <div className="form-group">
        <label>O'lchov birligi</label>
        <select
          name="unit_of_measure"
          value={formData.unit_of_measure}
          onChange={handleInputChange}
        >
          <option value="KG">KG</option>
          <option value="PIECE">PIECE</option>
          <option value="METER">METER</option>
          <option value="METER_SQUARE">METER_SQUARE</option>
        </select>
      </div>

      {/* Spool ishlatilganmi */}
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="uses_spool"
            checked={formData.uses_spool}
            onChange={handleInputChange}
          />
          Spool/Core ishlatilgan
        </label>
      </div>

      {/* Spool ishlatilsa */}
      {formData.uses_spool && (
        <>
          <div className="form-group">
            <label>Tare weight (kg) *</label>
            <input
              type="number"
              name="tare_weight"
              value={formData.tare_weight}
              onChange={handleInputChange}
              step="0.001"
              required
            />
            {errors.tare_weight && <span className="error">{errors.tare_weight}</span>}
          </div>

          <div className="form-group">
            <label>Gross weight (kg)</label>
            <input
              type="number"
              name="gross_weight"
              value={formData.gross_weight}
              onChange={handleInputChange}
              step="0.001"
            />
            <small>Gross weight berilsa, NET weight avtomatik hisoblanadi</small>
          </div>
        </>
      )}

      {/* NET weight (gross weight berilmagan bo'lsa) */}
      {!formData.gross_weight && (
        <div className="form-group">
          <label>NET weight (kg) *</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            step="0.001"
            required
          />
          {errors.weight && <span className="error">{errors.weight}</span>}
        </div>
      )}

      {/* Sifat holati */}
      <div className="form-group">
        <label>Sifat holati</label>
        <select
          name="quality_status"
          value={formData.quality_status}
          onChange={handleInputChange}
        >
          <option value="PENDING">PENDING</option>
          <option value="PASSED">PASSED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {/* Izohlar */}
      <div className="form-group">
        <label>Izohlar</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows="3"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Yaratilmoqda...' : 'Yaratish'}
      </button>
    </form>
  );
};

export default ProductionOutputForm;
```

### 2. ProductionOutput List Component

```jsx
import React, { useState, useEffect } from 'react';

const ProductionOutputList = ({ stepExecutionId }) => {
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOutputs();
  }, [stepExecutionId]);

  const fetchOutputs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        step_execution: stepExecutionId.toString()
      });
      
      const response = await fetch(`/api/production/production-outputs/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOutputs(data.results);
      } else {
        setError('Ma\'lumotlarni yuklashda xato');
      }
    } catch (err) {
      setError('Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const formatWeight = (output) => {
    if (output.uses_spool && output.gross_weight && output.tare_weight) {
      return `${output.weight}kg (${output.gross_weight} - ${output.tare_weight})`;
    }
    return `${output.weight}kg`;
  };

  if (loading) return <div>Yuklanmoqda...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="production-output-list">
      <h3>Mahsulot Chiqimlari</h3>
      
      {outputs.length === 0 ? (
        <p>Hozircha chiqim yo'q</p>
      ) : (
        <div className="outputs-grid">
          {outputs.map(output => (
            <div key={output.id} className="output-card">
              <div className="output-header">
                <h4>{output.product_name}</h4>
                <span className={`status ${output.quality_status.toLowerCase()}`}>
                  {output.quality_status}
                </span>
              </div>
              
              <div className="output-details">
                <div className="detail">
                  <label>Miqdor:</label>
                  <span>{output.quantity} {output.unit_of_measure}</span>
                </div>
                
                <div className="detail">
                  <label>Weight:</label>
                  <span>{formatWeight(output)}</span>
                </div>
                
                {output.uses_spool && (
                  <>
                    <div className="detail">
                      <label>Spool:</label>
                      <span>{output.spool_count || 'N/A'}</span>
                    </div>
                  </>
                )}
                
                <div className="detail">
                  <label>Operator:</label>
                  <span>{output.operator_name || 'N/A'}</span>
                </div>
                
                {output.notes && (
                  <div className="detail">
                    <label>Izoh:</label>
                    <span>{output.notes}</span>
                  </div>
                )}
              </div>
              
              <div className="output-footer">
                <small>{new Date(output.created_at).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductionOutputList;
```

## Validation Rules

### Frontend Validation

```javascript
const validateProductionOutput = (data) => {
  const errors = {};

  // Miqdor majburiy
  if (!data.quantity || parseFloat(data.quantity) <= 0) {
    errors.quantity = 'Miqdor 0 dan katta bo\'lishi kerak';
  }

  // Spool ishlatilsa, tare_weight majburiy
  if (data.uses_spool && (!data.tare_weight || parseFloat(data.tare_weight) < 0)) {
    errors.tare_weight = 'Tare weight majburiy va 0 dan katta bo\'lishi kerak';
  }

  // Gross weight berilgan bo'lsa, NET weight hisoblash
  if (data.gross_weight && data.tare_weight) {
    const gross = parseFloat(data.gross_weight);
    const tare = parseFloat(data.tare_weight);
    const net = gross - tare;
    
    if (net < 0) {
      errors.gross_weight = 'Gross weight tare weight dan kichik bo\'lishi mumkin emas';
    }
  }

  // Weight yoki gross_weight dan biri bo'lishi kerak
  if (!data.weight && !data.gross_weight) {
    errors.weight = 'Weight yoki gross_weight berilishi kerak';
  }

  return errors;
};
```

## Error Handling

### Common Error Responses

```javascript
// 400 Bad Request - Validation errors
{
  "quantity": ["This field is required."],
  "tare_weight": ["tare_weight is required when uses_spool=True"]
}

// 401 Unauthorized
{
  "detail": "Authentication credentials were not provided."
}

// 403 Forbidden
{
  "detail": "You do not have permission to perform this action."
}

// 404 Not Found
{
  "detail": "Not found."
}
```

### Error Handling Utility

```javascript
const handleApiError = (error, response) => {
  if (response.status === 400) {
    // Validation errors
    return response.json().then(data => {
      const errorMessages = Object.values(data).flat();
      return errorMessages.join(', ');
    });
  } else if (response.status === 401) {
    return 'Autentifikatsiya kerak';
  } else if (response.status === 403) {
    return 'Ruxsat yo\'q';
  } else if (response.status === 404) {
    return 'Topilmadi';
  } else {
    return 'Noma\'lum xato';
  }
};
```

## CSS Styles

```css
.production-output-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group small {
  color: #666;
  font-size: 12px;
}

.error {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 5px;
}

.production-output-list {
  padding: 20px;
}

.outputs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.output-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: #fff;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status.passed {
  background: #e8f5e8;
  color: #2e7d32;
}

.status.failed {
  background: #ffebee;
  color: #c62828;
}

.status.pending {
  background: #fff3e0;
  color: #ef6c00;
}

.output-details {
  margin-bottom: 10px;
}

.detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.detail label {
  font-weight: bold;
  margin-right: 10px;
}

.output-footer {
  border-top: 1px solid #eee;
  padding-top: 10px;
  color: #666;
  font-size: 12px;
}
```

## Best Practices

### 1. Form State Management
- Har bir input uchun alohida state
- Real-time validation
- Loading states

### 2. API Calls
- Error handling
- Loading indicators
- Retry logic

### 3. User Experience
- Clear validation messages
- Confirmation dialogs
- Success notifications

### 4. Performance
- Debounced search
- Pagination for large lists
- Optimistic updates

## Testing

### Unit Tests Example

```javascript
// Jest test example
import { validateProductionOutput } from './utils';

describe('ProductionOutput Validation', () => {
  test('validates required fields', () => {
    const data = { quantity: '', uses_spool: true };
    const errors = validateProductionOutput(data);
    expect(errors.quantity).toBeDefined();
    expect(errors.tare_weight).toBeDefined();
  });

  test('validates spool count for PIECE UOM', () => {
    const data = {
      quantity: '5',
      uses_spool: true,
      unit_of_measure: 'PIECE',
      spool_count: '3' // Should match quantity
    };
    const errors = validateProductionOutput(data);
    expect(errors.spool_count).toBeDefined();
  });
});
```

## Conclusion

Bu qo'llanma ProductionOutput API'sini frontendda to'liq ishlatish uchun kerakli barcha ma'lumotlarni beradi. Spool funksiyasi bilan birga ishlab chiqarish jarayonini yanada aniqroq kuzatish mumkin.

**Muhim eslatmalar:**
- Spool ishlatilsa, tare_weight majburiy
- PIECE UOM uchun spool_count avtomatik hisoblanadi
- NET weight = gross_weight - tare_weight
- Barcha weight maydonlari manfiy bo'lishi mumkin emas

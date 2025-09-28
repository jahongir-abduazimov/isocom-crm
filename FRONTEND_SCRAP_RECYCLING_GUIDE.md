# Frontend Scrap va Recycling Tizimi - To'liq Qo'llanma

## 1. Umumiy Tushuncha

IsoCom II tizimida brak (scrap) materiallar avtomatik tarzda ishlab chiqarish jarayonlarida hosil bo'ladi va qayta ishlanadi. Bu tizim quyidagi asosiy komponentlardan iborat:

### 1.1 Brak Turlari
- **Qattiq Brak (HARD)**: Ekstruder ishlab chiqarishida hosil bo'ladigan brak
- **Yumshoq Brak (SOFT)**: Laminator, dublikator va bronzalash jarayonlarida hosil bo'ladigan brak

### 1.2 Brak Holatlari (Status)
- **PENDING**: Kutilmoqda (qayta ishlash uchun to'plangan)
- **IN_DROBIL**: Drobilkada (qayta ishlash jarayonida)
- **RECYCLED**: Qayta ishlangan (maydalangan)
- **MOVED**: VT ga o'tkazilgan (yakuniy mahsulot)

## 2. API Endpointlari va Frontend Integratsiyasi

### 2.1 Brak Ro'yxatini Ko'rish

```javascript
// Brak ro'yxatini olish
const getScraps = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.scrap_type) params.append('scrap_type', filters.scrap_type);
  if (filters.status) params.append('status', filters.status);
  if (filters.step_execution) params.append('step_execution', filters.step_execution);
  
  const response = await fetch(`/api/scrap/?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

**Frontend Komponenti Masalasi:**
```jsx
import React, { useState, useEffect } from 'react';

const ScrapList = () => {
  const [scraps, setScraps] = useState([]);
  const [filters, setFilters] = useState({
    scrap_type: '',
    status: '',
    date_range: ''
  });

  useEffect(() => {
    const fetchScraps = async () => {
      const data = await getScraps(filters);
      setScraps(data.results || data);
    };
    
    fetchScraps();
  }, [filters]);

  return (
    <div className="scrap-list">
      <div className="filters">
        <select 
          value={filters.scrap_type} 
          onChange={(e) => setFilters({...filters, scrap_type: e.target.value})}
        >
          <option value="">Brak turi</option>
          <option value="HARD">Qattiq brak</option>
          <option value="SOFT">Yumshoq brak</option>
        </select>
        
        <select 
          value={filters.status} 
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">Holat</option>
          <option value="PENDING">Kutilmoqda</option>
          <option value="IN_DROBIL">Drobilkada</option>
          <option value="RECYCLED">Qayta ishlangan</option>
          <option value="MOVED">VT ga o'tkazilgan</option>
        </select>
      </div>

      <div className="scrap-cards">
        {scraps.map(scrap => (
          <div key={scrap.id} className="scrap-card">
            <h3>{scrap.scrap_type_display}</h3>
            <p>Miqdor: {scrap.quantity} {scrap.unit_of_measure}</p>
            <p>Og'irlik: {scrap.weight} kg</p>
            <p>Holat: {scrap.status_display}</p>
            <p>Qayd etdi: {scrap.recorded_by_name}</p>
            <p>Vaqt: {new Date(scrap.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2.2 Real-time Brak Tracking

```javascript
// Real-time brak ma'lumotlari
const getRealTimeScrap = async () => {
  const response = await fetch('/api/scrap/real_time_scrap/', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

**Dashboard Komponenti:**
```jsx
const ScrapDashboard = () => {
  const [realTimeData, setRealTimeData] = useState(null);
  
  useEffect(() => {
    const fetchRealTimeData = async () => {
      const data = await getRealTimeScrap();
      setRealTimeData(data);
    };
    
    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 30000); // 30 soniyada yangilash
    
    return () => clearInterval(interval);
  }, []);

  if (!realTimeData) return <div>Yuklanmoqda...</div>;

  return (
    <div className="scrap-dashboard">
      <h2>Bugungi Brak Ma'lumotlari</h2>
      
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Qattiq Brak</h3>
          <p>{realTimeData.today_total.hard_scrap} kg</p>
        </div>
        <div className="summary-card">
          <h3>Yumshoq Brak</h3>
          <p>{realTimeData.today_total.soft_scrap} kg</p>
        </div>
        <div className="summary-card">
          <h3>Jami Og'irlik</h3>
          <p>{realTimeData.today_total.total_weight} kg</p>
        </div>
      </div>

      <div className="workcenter-breakdown">
        <h3>Ish joyi bo'yicha taqsimlash</h3>
        {Object.entries(realTimeData.by_workcenter).map(([workcenter, data]) => (
          <div key={workcenter} className="workcenter-card">
            <h4>{workcenter}</h4>
            <p>Qattiq: {data.hard_scrap} kg</p>
            <p>Yumshoq: {data.soft_scrap} kg</p>
            <p>Jami: {data.total_weight} kg</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 3. Qayta Ishlash Jarayoni (Recycling Workflow)

### 3.1 Qayta Ishlash Partiyasini Boshlash

```javascript
// Joriy to'plangan braklar miqdorini olish
const getCurrentTotals = async () => {
  const response = await fetch('/api/recycling/current_totals/', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};

// Qayta ishlashni boshlash
const startRecycling = async () => {
  const response = await fetch('/api/recycling/start_recycling/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

**Qayta Ishlash Komponenti:**
```jsx
const RecyclingManager = () => {
  const [currentTotals, setCurrentTotals] = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);
  
  useEffect(() => {
    const fetchTotals = async () => {
      const data = await getCurrentTotals();
      setCurrentTotals(data);
    };
    
    fetchTotals();
    const interval = setInterval(fetchTotals, 60000); // 1 minutda yangilash
    
    return () => clearInterval(interval);
  }, []);

  const handleStartRecycling = async () => {
    try {
      const batch = await startRecycling();
      setActiveBatch(batch);
      alert('Qayta ishlash partiyasi boshlandi!');
    } catch (error) {
      alert('Xatolik: ' + error.message);
    }
  };

  return (
    <div className="recycling-manager">
      <h2>Qayta Ishlash Tizimi</h2>
      
      {currentTotals && (
        <div className="current-totals">
          <h3>Joriy To'plangan Braklar</h3>
          <div className="totals-grid">
            <div className="total-card">
              <h4>Qattiq Brak</h4>
              <p>{currentTotals.hard_scrap} kg</p>
            </div>
            <div className="total-card">
              <h4>Yumshoq Brak</h4>
              <p>{currentTotals.soft_scrap} kg</p>
            </div>
          </div>
          
          <button 
            onClick={handleStartRecycling}
            disabled={currentTotals.hard_scrap === 0 && currentTotals.soft_scrap === 0}
            className="start-recycling-btn"
          >
            Qayta Ishlashni Boshlash
          </button>
        </div>
      )}

      {activeBatch && (
        <div className="active-batch">
          <h3>Faol Partiya: {activeBatch.batch_number}</h3>
          <p>Holat: {activeBatch.status_display}</p>
          <p>Qattiq brak: {activeBatch.total_hard_scrap} kg</p>
          <p>Yumshoq brak: {activeBatch.total_soft_scrap} kg</p>
        </div>
      )}
    </div>
  );
};
```

### 3.2 Drobilka Jarayonini Boshqarish

```javascript
// Drobilka jarayonini boshlash
const startDrobilka = async (drobilkaData) => {
  const response = await fetch('/api/drobilka/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(drobilkaData)
  });
  
  return response.json();
};

// Drobilka jarayonini yakunlash
const completeDrobilka = async (drobilkaId, outputQuantity) => {
  const response = await fetch(`/api/drobilka/${drobilkaId}/complete/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ output_quantity: outputQuantity })
  });
  
  return response.json();
};
```

**Drobilka Komponenti:**
```jsx
const DrobilkaManager = () => {
  const [workCenters, setWorkCenters] = useState([]);
  const [operators, setOperators] = useState([]);
  const [activeDrobilka, setActiveDrobilka] = useState(null);
  
  useEffect(() => {
    // Work center va operatorlarni yuklash
    const fetchData = async () => {
      const [wcResponse, opsResponse] = await Promise.all([
        fetch('/api/workcenter/?type=BRAK_MAYDALAGICH'),
        fetch('/api/user/')
      ]);
      
      const wcData = await wcResponse.json();
      const opsData = await opsResponse.json();
      
      setWorkCenters(wcData.results || wcData);
      setOperators(opsData.results || opsData);
    };
    
    fetchData();
  }, []);

  const handleStartDrobilka = async (formData) => {
    try {
      const drobilka = await startDrobilka(formData);
      setActiveDrobilka(drobilka);
    } catch (error) {
      alert('Xatolik: ' + error.message);
    }
  };

  const handleCompleteDrobilka = async (outputQuantity) => {
    try {
      await completeDrobilka(activeDrobilka.id, outputQuantity);
      setActiveDrobilka(null);
      alert('Drobilka jarayoni yakunlandi!');
    } catch (error) {
      alert('Xatolik: ' + error.message);
    }
  };

  return (
    <div className="drobilka-manager">
      <h2>Drobilka Boshqaruvi</h2>
      
      {!activeDrobilka ? (
        <DrobilkaStartForm 
          workCenters={workCenters}
          operators={operators}
          onSubmit={handleStartDrobilka}
        />
      ) : (
        <DrobilkaProgress 
          drobilka={activeDrobilka}
          onComplete={handleCompleteDrobilka}
        />
      )}
    </div>
  );
};

const DrobilkaStartForm = ({ workCenters, operators, onSubmit }) => {
  const [formData, setFormData] = useState({
    recycling_batch: '',
    drobilka_type: 'HARD',
    work_center: '',
    input_quantity: '',
    operators: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="drobilka-form">
      <h3>Drobilka Jarayonini Boshlash</h3>
      
      <div className="form-group">
        <label>Drobilka turi:</label>
        <select 
          value={formData.drobilka_type}
          onChange={(e) => setFormData({...formData, drobilka_type: e.target.value})}
        >
          <option value="HARD">Qattiq brak drobilkasi</option>
          <option value="SOFT">Yumshoq brak drobilkasi</option>
        </select>
      </div>

      <div className="form-group">
        <label>Drobilka stanogi:</label>
        <select 
          value={formData.work_center}
          onChange={(e) => setFormData({...formData, work_center: e.target.value})}
        >
          <option value="">Tanlang</option>
          {workCenters.map(wc => (
            <option key={wc.id} value={wc.id}>{wc.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Kirish miqdori (kg):</label>
        <input 
          type="number" 
          step="0.01"
          value={formData.input_quantity}
          onChange={(e) => setFormData({...formData, input_quantity: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Operatorlar (2-3 ta):</label>
        <div className="operator-checkboxes">
          {operators.map(operator => (
            <label key={operator.id}>
              <input 
                type="checkbox"
                value={operator.id}
                checked={formData.operators.includes(operator.id)}
                onChange={(e) => {
                  const value = e.target.value;
                  const checked = e.target.checked;
                  setFormData({
                    ...formData,
                    operators: checked 
                      ? [...formData.operators, value]
                      : formData.operators.filter(id => id !== value)
                  });
                }}
              />
              {operator.get_full_name}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" disabled={formData.operators.length < 2}>
        Drobilka Jarayonini Boshlash
      </button>
    </form>
  );
};

const DrobilkaProgress = ({ drobilka, onComplete }) => {
  const [outputQuantity, setOutputQuantity] = useState('');

  const handleComplete = (e) => {
    e.preventDefault();
    if (outputQuantity && outputQuantity > 0) {
      onComplete(outputQuantity);
    }
  };

  return (
    <div className="drobilka-progress">
      <h3>Drobilka Jarayoni</h3>
      
      <div className="progress-info">
        <p><strong>Turi:</strong> {drobilka.drobilka_type_display}</p>
        <p><strong>Stanok:</strong> {drobilka.work_center_name}</p>
        <p><strong>Kirish miqdori:</strong> {drobilka.input_quantity} kg</p>
        <p><strong>Mas'ul operator:</strong> {drobilka.lead_operator_name}</p>
        <p><strong>Boshlangan vaqt:</strong> {new Date(drobilka.started_at).toLocaleString()}</p>
      </div>

      <div className="operators-list">
        <h4>Operatorlar:</h4>
        <ul>
          {drobilka.operators_details.map(operator => (
            <li key={operator.id}>{operator.name}</li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleComplete} className="completion-form">
        <div className="form-group">
          <label>Chiqish miqdori (kg):</label>
          <input 
            type="number" 
            step="0.01"
            value={outputQuantity}
            onChange={(e) => setOutputQuantity(e.target.value)}
            required
          />
        </div>
        
        <button type="submit">Drobilka Jarayonini Yakunlash</button>
      </form>
    </div>
  );
};
```

## 4. Brak Qayta Ishlash Jarayoni (Brag Processing Workflow)

### 4.1 Brak Qanday Hosil Bo'ladi?

Brak materiallar ishlab chiqarish jarayonlarida avtomatik tarzda hosil bo'ladi:

1. **Ekstruder jarayonida**: 20% brak avtomatik hisoblanadi
2. **Laminatsiya jarayonida**: 10% brak hosil bo'ladi  
3. **Boshqa jarayonlarda**: 3% brak hisoblanadi

### 4.2 Brak Qayta Ishlash Jarayoni

```javascript
// Qayta ishlash jarayonini yakunlash
const completeRecycling = async (batchId, finalVtQuantity) => {
  const response = await fetch(`/api/recycling/${batchId}/complete_recycling/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ final_vt_quantity: finalVtQuantity })
  });
  
  return response.json();
};
```

**Qayta Ishlash Jarayoni Diagrammasi:**

```
1. Brak Hosil Bo'lish
   ├── Ekstruder → Qattiq Brak (20%)
   ├── Laminator → Yumshoq Brak (10%)
   └── Boshqa → Aralash Brak (3%)

2. Brak To'planishi
   ├── PENDING holatida saqlanishi
   └── Miqdor kuzatilishi

3. Qayta Ishlash Boshlanishi
   ├── To'plangan braklar miqdorini tekshirish
   ├── Yangi partiya yaratish (RB + sana)
   └── Barcha braklar IN_DROBIL holatiga o'tkazish

4. Drobilka Jarayoni
   ├── Qattiq Brak Drobilka
   │   ├── Qattiq braklar maydalanishi
   │   └── RECYCLED holatiga o'tkazish
   └── Yumshoq Brak Drobilka
       ├── Yumshoq + maydalangan qattiq braklar
       └── RECYCLED holatiga o'tkazish

5. Yakuniy Qayta Ishlash
   ├── Final VT miqdorini kiritish
   ├── COMPLETED holatiga o'tkazish
   └── Barcha braklar MOVED holatiga o'tkazish
```

**Qayta Ishlash Jarayoni Komponenti:**
```jsx
const RecyclingWorkflow = () => {
  const [currentBatch, setCurrentBatch] = useState(null);
  const [workflowStep, setWorkflowStep] = useState(1);

  const workflowSteps = [
    { id: 1, title: "Brak To'planishi", description: "Brak materiallar to'planmoqda" },
    { id: 2, title: "Qayta Ishlash Boshlanishi", description: "Partiya yaratilmoqda" },
    { id: 3, title: "Qattiq Brak Drobilka", description: "Qattiq braklar maydalanmoqda" },
    { id: 4, title: "Yumshoq Brak Drobilka", description: "Yumshoq braklar qayta ishlanmoqda" },
    { id: 5, title: "Yakuniy Qayta Ishlash", description: "VT granulasi tayyorlanmoqda" }
  ];

  return (
    <div className="recycling-workflow">
      <h2>Brak Qayta Ishlash Jarayoni</h2>
      
      <div className="workflow-steps">
        {workflowSteps.map(step => (
          <div 
            key={step.id} 
            className={`workflow-step ${workflowStep >= step.id ? 'active' : ''}`}
          >
            <div className="step-number">{step.id}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {currentBatch && (
        <div className="batch-info">
          <h3>Joriy Partiya: {currentBatch.batch_number}</h3>
          <div className="batch-stats">
            <p>Qattiq brak: {currentBatch.total_hard_scrap} kg</p>
            <p>Yumshoq brak: {currentBatch.total_soft_scrap} kg</p>
            <p>Yakuniy VT: {currentBatch.final_vt_quantity || 'Kutilmoqda'} kg</p>
          </div>
        </div>
      )}
    </div>
  );
};
```

## 5. CSS Stilizatsiyasi

```css
/* Brak ro'yxati uchun stillar */
.scrap-list {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.scrap-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.scrap-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.scrap-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

/* Dashboard uchun stillar */
.scrap-dashboard {
  padding: 20px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.summary-card h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.summary-card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.workcenter-breakdown {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.workcenter-card {
  background: #f8f9fa;
  padding: 15px;
  margin: 10px 0;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

/* Qayta ishlash boshqaruvi */
.recycling-manager {
  padding: 20px;
}

.current-totals {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.total-card {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
}

.start-recycling-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.start-recycling-btn:hover:not(:disabled) {
  background: #218838;
}

.start-recycling-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Drobilka boshqaruvi */
.drobilka-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.operator-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.operator-checkboxes label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
}

/* Workflow diagrammasi */
.recycling-workflow {
  padding: 20px;
}

.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.workflow-step {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.workflow-step.active {
  border-left: 4px solid #007bff;
  background: #f8f9ff;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.workflow-step.active .step-number {
  background: #007bff;
}

.step-content h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.step-content p {
  margin: 0;
  color: #666;
}

/* Responsive dizayn */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .scrap-cards {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .workflow-step {
    flex-direction: column;
    text-align: center;
  }
}
```

## 6. Xatoliklar va Debugging

### 6.1 Umumiy Xatoliklar

```javascript
// Xatolik boshqaruvi
const handleApiError = (error) => {
  console.error('API Xatolik:', error);
  
  if (error.status === 400) {
    alert('Noto\'g\'ri ma\'lumot kiritildi: ' + error.detail);
  } else if (error.status === 403) {
    alert('Ruxsat yo\'q. Tizimga qayta kiring.');
  } else if (error.status === 404) {
    alert('Ma\'lumot topilmadi.');
  } else {
    alert('Server xatoligi. Qayta urinib ko\'ring.');
  }
};

// API so'rovlarini wrapper qilish
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw { status: response.status, ...errorData };
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
```

### 6.2 Validation Qoidalari

```javascript
// Form validation
const validateDrobilkaForm = (formData) => {
  const errors = {};
  
  if (!formData.work_center) {
    errors.work_center = 'Drobilka stanogi tanlanishi shart';
  }
  
  if (!formData.input_quantity || formData.input_quantity <= 0) {
    errors.input_quantity = 'Kirish miqdori 0 dan katta bo\'lishi kerak';
  }
  
  if (!formData.operators || formData.operators.length < 2) {
    errors.operators = 'Kamida 2 ta operator tanlanishi shart';
  }
  
  if (formData.operators && formData.operators.length > 3) {
    errors.operators = 'Maksimal 3 ta operator tanlash mumkin';
  }
  
  return errors;
};
```

## 7. Testing va Debugging

### 7.1 Test Data Yaratish

```javascript
// Test uchun ma'lumotlar
const createTestData = () => {
  return {
    scraps: [
      {
        id: '1',
        scrap_type: 'HARD',
        quantity: '10.5',
        weight: '10.5',
        status: 'PENDING',
        recorded_by_name: 'Test Operator',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        scrap_type: 'SOFT',
        quantity: '5.2',
        weight: '5.2',
        status: 'IN_DROBIL',
        recorded_by_name: 'Test Operator 2',
        created_at: new Date().toISOString()
      }
    ],
    workCenters: [
      {
        id: '1',
        name: 'Hard Drobilka 1',
        type: 'BRAK_MAYDALAGICH'
      },
      {
        id: '2',
        name: 'Soft Drobilka 1',
        type: 'BRAK_MAYDALAGICH'
      }
    ],
    operators: [
      {
        id: '1',
        get_full_name: 'Test Operator 1',
        username: 'test_op1'
      },
      {
        id: '2',
        get_full_name: 'Test Operator 2',
        username: 'test_op2'
      }
    ]
  };
};
```

## 8. Production Ready Kod

### 8.1 Environment Configuration

```javascript
// Environment sozlamalari
const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  refreshInterval: process.env.REACT_APP_REFRESH_INTERVAL || 30000,
  maxRetries: process.env.REACT_APP_MAX_RETRIES || 3
};

// Retry logic
const retryRequest = async (requestFn, maxRetries = config.maxRetries) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 8.2 Performance Optimization

```javascript
// Debounced search
import { useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

const useDebouncedSearch = (searchFn, delay = 300) => {
  const debouncedSearch = useCallback(
    debounce((query) => {
      searchFn(query);
    }, delay),
    [searchFn, delay]
  );

  return debouncedSearch;
};

// Memoized calculations
const useScrapStatistics = (scraps) => {
  return useMemo(() => {
    const totalWeight = scraps.reduce((sum, scrap) => sum + parseFloat(scrap.weight), 0);
    const hardScrapWeight = scraps
      .filter(scrap => scrap.scrap_type === 'HARD')
      .reduce((sum, scrap) => sum + parseFloat(scrap.weight), 0);
    const softScrapWeight = scraps
      .filter(scrap => scrap.scrap_type === 'SOFT')
      .reduce((sum, scrap) => sum + parseFloat(scrap.weight), 0);

    return {
      totalWeight,
      hardScrapWeight,
      softScrapWeight,
      hardScrapPercentage: totalWeight > 0 ? (hardScrapWeight / totalWeight) * 100 : 0,
      softScrapPercentage: totalWeight > 0 ? (softScrapWeight / totalWeight) * 100 : 0
    };
  }, [scraps]);
};
```

Bu to'liq qo'llanma frontend dasturchilarga IsoCom II tizimidagi brak va qayta ishlash funksionalligini to'liq tushunish va implementatsiya qilish imkonini beradi. Barcha API endpointlari, React komponentlari, CSS stillari va best practice'lar kiritilgan.

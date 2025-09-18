# 💻 Frontend Integration Guide - Ekstruder Bak Tizimi

## 📋 Umumiy Ma'lumot

Bu qo'llanma frontend developerlar uchun ekstruder bak tizimini integratsiya qilish uchun yozilgan.

## 🔧 Texnik Ma'lumotlar

- **Base URL**: `http://localhost:8001/api/production/`
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`
- **Framework**: Django REST Framework

---

## 🔐 Authentication

### Login

```javascript
const login = async (username, password) => {
  const response = await fetch("http://localhost:8001/api/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  return data;
};
```

### API Request Helper

```javascript
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    // Token yangilash
    await refreshToken();
    return apiRequest(url, options);
  }

  return response.json();
};
```

---

## 🏗️ React Component Misollari

### 1. Baklar Ro'yxati Component

```jsx
import React, { useState, useEffect } from "react";

const BunkerList = () => {
  const [bunkers, setBunkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBunkers();
  }, []);

  const fetchBunkers = async () => {
    try {
      const data = await apiRequest(
        "http://localhost:8001/api/production/extruder-bunkers/"
      );
      setBunkers(data.results);
    } catch (error) {
      console.error("Error fetching bunkers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bunker-list">
      <h2>Ekstruder Baklar</h2>
      {bunkers.map((bunker) => (
        <div key={bunker.id} className="bunker-card">
          <h3>{bunker.bunker_name}</h3>
          <p>Work Center: {bunker.work_center.name}</p>
          <p>
            Hajm: {bunker.current_level_kg}/{bunker.capacity_kg}kg
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (bunker.current_level_kg / bunker.capacity_kg) * 100
                }%`,
              }}
            ></div>
          </div>
          <p>To'ldirilgan: {bunker.is_filled ? "Ha" : "Yo'q"}</p>
        </div>
      ))}
    </div>
  );
};

export default BunkerList;
```

### 2. Bak To'ldirish Component

```jsx
import React, { useState } from "react";

const FillBunker = ({ bunkerId, onSuccess }) => {
  const [formData, setFormData] = useState({
    material_id: "",
    weighed_quantity_kg: "",
    operator_id: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest(
        `http://localhost:8001/api/production/extruder-bunkers/${bunkerId}/fill_bunker/`,
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

      alert("Bak muvaffaqiyatli to'ldirildi!");
      onSuccess && onSuccess(response);
    } catch (error) {
      alert("Xatolik: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fill-bunker-form">
      <h3>Bak To'ldirish</h3>

      <div className="form-group">
        <label>Material:</label>
        <select
          value={formData.material_id}
          onChange={(e) =>
            setFormData({ ...formData, material_id: e.target.value })
          }
          required
        >
          <option value="">Material tanlang</option>
          <option value="pvd-uuid">PVD</option>
          <option value="vt-uuid">VT</option>
        </select>
      </div>

      <div className="form-group">
        <label>Tarozida o'lchangan miqdor (kg):</label>
        <input
          type="number"
          step="0.01"
          value={formData.weighed_quantity_kg}
          onChange={(e) =>
            setFormData({ ...formData, weighed_quantity_kg: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Operator:</label>
        <select
          value={formData.operator_id}
          onChange={(e) =>
            setFormData({ ...formData, operator_id: e.target.value })
          }
          required
        >
          <option value="">Operator tanlang</option>
          <option value="operator-1">Operator 1</option>
          <option value="operator-2">Operator 2</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Yuklanmoqda..." : "Bakni To'ldirish"}
      </button>
    </form>
  );
};

export default FillBunker;
```

### 3. Smena Boshqaruvi Component

```jsx
import React, { useState } from "react";

const ShiftManagement = ({ bunkerId }) => {
  const [shiftId, setShiftId] = useState("");
  const [loading, setLoading] = useState(false);
  const [shiftStarted, setShiftStarted] = useState(false);

  const startShift = async () => {
    if (!shiftId) {
      alert("Smena ID kiritilishi shart!");
      return;
    }

    setLoading(true);
    try {
      await apiRequest(
        `http://localhost:8001/api/production/extruder-bunkers/${bunkerId}/start_shift/`,
        {
          method: "POST",
          body: JSON.stringify({ shift_id: shiftId }),
        }
      );

      setShiftStarted(true);
      alert("Smena boshlanganda bak holati saqlandi!");
    } catch (error) {
      alert("Xatolik: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const endShift = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        `http://localhost:8001/api/production/extruder-bunkers/${bunkerId}/end_shift/`,
        {
          method: "POST",
          body: JSON.stringify({ shift_id: shiftId }),
        }
      );

      setShiftStarted(false);
      alert(`Smena tugatildi. Sarf: ${response.consumption_kg}kg`);
    } catch (error) {
      alert("Xatolik: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shift-management">
      <h3>Smena Boshqaruvi</h3>

      <div className="form-group">
        <label>Smena ID:</label>
        <input
          type="text"
          value={shiftId}
          onChange={(e) => setShiftId(e.target.value)}
          placeholder="Smena ID kiriting"
        />
      </div>

      <div className="button-group">
        <button
          onClick={startShift}
          disabled={loading || shiftStarted}
          className="start-btn"
        >
          {loading ? "Yuklanmoqda..." : "Smena Boshlash"}
        </button>

        <button
          onClick={endShift}
          disabled={loading || !shiftStarted}
          className="end-btn"
        >
          {loading ? "Yuklanmoqda..." : "Smena Tugatish"}
        </button>
      </div>

      <div className="shift-status">
        <p>Holat: {shiftStarted ? "Smena boshlangan" : "Smena boshlanmagan"}</p>
      </div>
    </div>
  );
};

export default ShiftManagement;
```

### 4. Bak Holati Component

```jsx
import React, { useState, useEffect } from "react";

const BunkerStatus = ({ bunkerId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, [bunkerId]);

  const fetchStatus = async () => {
    try {
      const data = await apiRequest(
        `http://localhost:8001/api/production/extruder-bunkers/${bunkerId}/bunker_status/`
      );
      setStatus(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!status) return <div>Status olinmadi</div>;

  return (
    <div className="bunker-status">
      <h3>{status.bunker_name} Holati</h3>

      <div className="status-info">
        <div className="status-item">
          <label>Work Center:</label>
          <span>{status.work_center}</span>
        </div>

        <div className="status-item">
          <label>Hajm:</label>
          <span>
            {status.current_level_kg}/{status.capacity_kg}kg
          </span>
        </div>

        <div className="status-item">
          <label>Bo'sh joy:</label>
          <span>{status.available_capacity_kg}kg</span>
        </div>

        <div className="status-item">
          <label>To'ldirilgan:</label>
          <span>{status.fill_percentage.toFixed(1)}%</span>
        </div>

        <div className="status-item">
          <label>To'liq:</label>
          <span>{status.is_full ? "Ha" : "Yo'q"}</span>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${status.fill_percentage}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {status.fill_percentage.toFixed(1)}%
        </span>
      </div>

      <div className="recent-fills">
        <h4>Oxirgi To'ldirishlar</h4>
        {status.recent_fills.map((fill, index) => (
          <div key={index} className="fill-item">
            <span>{fill.material_name}</span>
            <span>{fill.quantity_kg}kg</span>
            <span>{new Date(fill.filled_at).toLocaleString()}</span>
            <span>{fill.operator}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BunkerStatus;
```

---

## 🎨 CSS Stil Misollari

```css
/* Baklar ro'yxati */
.bunker-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.bunker-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
}

/* Bak to'ldirish formasi */
.fill-bunker-form {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
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
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4caf50;
}

/* Smena boshqaruvi */
.shift-management {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.button-group {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.button-group button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.start-btn {
  background: #4caf50;
  color: white;
}

.end-btn {
  background: #f44336;
  color: white;
}

.button-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Bak holati */
.bunker-status {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.status-info {
  margin: 15px 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.progress-container {
  margin: 20px 0;
  text-align: center;
}

.progress-text {
  font-weight: bold;
  color: #4caf50;
}

.recent-fills {
  margin-top: 20px;
}

.fill-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .bunker-list {
    grid-template-columns: 1fr;
    padding: 10px;
  }

  .button-group {
    flex-direction: column;
  }
}
```

---

## 🔧 Utility Functions

```javascript
// API request helper
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    await refreshToken();
    return apiRequest(url, options);
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Token yangilash
const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  const response = await fetch(
    "http://localhost:8001/api/auth/token/refresh/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    }
  );

  const data = await response.json();
  localStorage.setItem("access_token", data.access);
};

// Format qilish
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("uz-UZ");
};

const formatWeight = (weight) => {
  return parseFloat(weight).toFixed(2) + "kg";
};

const formatPercentage = (percentage) => {
  return percentage.toFixed(1) + "%";
};
```

---

## 📱 Mobile Responsive

```css
/* Mobile uchun qo'shimcha stillar */
@media (max-width: 480px) {
  .bunker-card,
  .fill-bunker-form,
  .shift-management,
  .bunker-status {
    margin: 10px;
    padding: 15px;
  }

  .status-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .fill-item {
    flex-direction: column;
    gap: 5px;
  }
}
```

---

**🎉 Frontend integration tayyor! Endi sizning frontend ilovangiz ekstruder bak tizimi bilan to'liq integratsiya qilingan!**

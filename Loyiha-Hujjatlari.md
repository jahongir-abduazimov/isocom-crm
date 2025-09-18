# ISOCOM CRM - Ishlab Chiqarish Boshqaruv Tizimi

## Loyihaning Asosiy Maqsadi

**ISOCOM CRM** - bu zamonaviy ishlab chiqarish korxonalari uchun mo'ljallangan to'liq CRM (Customer Relationship Management) va ERP (Enterprise Resource Planning) tizimidir. Ushbu tizim asosan **ISO standartlariga muvofiq** ishlab chiqarish jarayonlarini boshqarish, sifat nazorati va resurslarni samarali boshqarish uchun yaratilgan.

### Texnologiyalar:

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **HTTP Client**: Axios
- **Backend API**: Django REST Framework (192.168.0.105:8001)

---

## Asosiy Modullar va Sahifalar

### 1. 🏠 **Dashboard (Bosh Sahifa)**

**Yo'l**: `/`  
**Fayl**: `src/pages/dashboard/index.tsx`

**Maqsadi**: Ishlab chiqarish ko'rsatkichlarining umumiy ko'rinishi

**Asosiy Funksiyalar**:

- Ishlab chiqarilgan mahsulotlar statistikasi
- Sifat nazorati (QC) ma'lumotlari
- Qaytarilgan mahsulotlar hisoboti
- Ombor zahiralari ko'rsatkichi
- Oylik ishlab chiqarish grafiklari
- QC statistikasi grafiklari

**Bog'liq Sahifalar**: Barcha modullarning bosh sahifasi

---

### 2. 📦 **Maxsulotlar (Products)**

#### 2.1 Maxsulotlar Ro'yxati

**Yo'l**: `/products`  
**Fayl**: `src/pages/products/index.tsx`

**Maqsadi**: Tayyor va yarim tayyor mahsulotlarni boshqarish

**Funksiyalar**:

- Mahsulotlar ro'yxatini ko'rish
- Qidirish va filtrlash
- Mahsulot ma'lumotlarini tahrirlash
- Mahsulotni o'chirish

#### 2.2 Mahsulot Qo'shish

**Yo'l**: `/products/add`  
**Fayl**: `src/pages/products/AddProduct.tsx`

**Funksiyalar**:

- Yangi mahsulot yaratish
- Mahsulot turlari: Tayyor mahsulot / Yarim tayyor mahsulot
- O'lchov birliklari: dona, kg, m, m², m³, litr
- Narx va tavsif belgilash

#### 2.3 Mahsulot Tahrirlash

**Yo'l**: `/products/:id/edit`  
**Fayl**: `src/pages/products/EditProduct.tsx`

**Funksiyalar**:

- Mavjud mahsulot ma'lumotlarini yangilash
- Status o'zgartirish (faol/nofaol)

#### 2.4 Mahsulot Komponentlari

**Yo'l**: `/products-components`  
**Fayl**: `src/pages/products-components/index.tsx`

**Maqsadi**: Mahsulot tarkibiy qismlarini boshqarish

**Bog'liq Sahifalar**: Materiallar, Ishlab chiqarish

---

### 3. 🧱 **Materiallar (Materials)**

#### 3.1 Materiallar Ro'yxati

**Yo'l**: `/materials`  
**Fayl**: `src/pages/materials/index.tsx`

**Maqsadi**: Xom ashyo va materiallarni boshqarish

**Funksiyalar**:

- Materiallar ro'yxati
- Material turlari: Granula, Zar, Boshqa
- Qidirish va filtrlash

#### 3.2 Material Qo'shish

**Yo'l**: `/materials/add`  
**Fayl**: `src/pages/materials/AddMaterial.tsx`

**Funksiyalar**:

- Yangi material yaratish
- O'lchov birliklari: KG, METER, m², m³, PIECE, LITER
- Material kodi va tavsifi

#### 3.3 Material Tahrirlash

**Yo'l**: `/materials/:id/edit`  
**Fayl**: `src/pages/materials/EditMaterial.tsx`

**Bog'liq Sahifalar**: Ishlab chiqarish, Ombor

---

### 4. ⚙️ **Stanoklar (Workcenters)**

#### 4.1 Stanoklar Ro'yxati

**Yo'l**: `/workcenters`  
**Fayl**: `src/pages/workcenters/index.tsx`

**Maqsadi**: Ishlab chiqarish uskunalarini boshqarish

**Stanok Turlari**:

- EXTRUDER (Ekstruder)
- DEGASSING_AREA (Gazdan tozalash)
- LAMINATOR (Laminator)
- BRONIROVSHIK (Bronlovchi)
- DUPLICATOR (Dublkator)
- PACKAGING (Qadoqlash)
- QUALITY_CONTROL (Sifat nazorati)
- BRAK_MAYDALAGICH (Chiqindi maydalagich)

#### 4.2 Stanok Qo'shish

**Yo'l**: `/workcenters/add`  
**Fayl**: `src/pages/workcenters/AddWorkcenter.tsx`

**Funksiyalar**:

- Yangi stanok yaratish
- Unumdorlik (soatiga ishlov berish qobiliyati)
- Joylashuv va texnik xizmat ko'rsatish sanasi

#### 4.3 Stanok Tahrirlash

**Yo'l**: `/workcenters/:id/edit`  
**Fayl**: `src/pages/workcenters/EditWorkcenter.tsx`

**Bog'liq Sahifalar**: Ishlab chiqarish, Joylashuvlar

---

### 5. 🏭 **Ishlab Chiqarish (Production)**

#### 5.1 Buyurtmalar (Orders)

**Yo'l**: `/production/orders`  
**Fayl**: `src/pages/production/index.tsx`

**Maqsadi**: Ishlab chiqarish buyurtmalarini boshqarish

**Buyurtma Statuslari**:

- PENDING (Kutilmoqda)
- IN_PROGRESS (Jarayonda)
- COMPLETED (Tugallangan)
- CANCELLED (Bekor qilingan)

**Funksiyalar**:

- Buyurtmalar ro'yxati
- Status bo'yicha filtrlash
- Buyurtma tafsilotlarini ko'rish

#### 5.2 Buyurtma Qo'shish

**Yo'l**: `/production/orders/add`  
**Fayl**: `src/pages/production/AddOrder.tsx`

**Funksiyalar**:

- Yangi buyurtma yaratish
- Ishlab chiqariladigan mahsulot tanlash
- Miqdor va muddat belgilash

#### 5.3 Buyurtma Tafsilotlari

**Yo'l**: `/production/orders/:id`  
**Fayl**: `src/pages/production/OrderDetail.tsx`

**Funksiyalar**:

- Buyurtma to'liq ma'lumotlari
- Ishlab chiqarish bosqichlari
- Ishlatilgan materiallar
- Ishlab chiqarish natijaları

#### 5.4 Buyurtma Tahrirlash

**Yo'l**: `/production/orders/:id/edit`  
**Fayl**: `src/pages/production/EditOrder.tsx`

#### 5.5 Ishlab Chiqarish Bosqichlari (Production Steps)

**Yo'l**: `/production/steps`  
**Fayl**: `src/pages/production/ProductionSteps.tsx`

**Maqsadi**: Ishlab chiqarish jarayonining bosqichlarini belgilash

**Bosqich Turlari**:

- EXTRUSION (Ekstruziya)
- DEGASSING (Gazdan tozalash)
- LAMINATION (Laminatsiya)
- BRONZING (Bronlash)
- DUPLICATION (Dublash)
- PACKAGING (Qadoqlash)
- QUALITY_CONTROL (Sifat nazorati)
- WAREHOUSE_TRANSFER (Omborga topshirish)
- CUSTOMER_DELIVERY (Mijozga yetkazish)

#### 5.6 Bosqich Qo'shish/Tahrirlash

**Yo'l**: `/production/steps/add`, `/production/steps/:id/edit`  
**Fayllar**: `AddProductionStep.tsx`, `EditProductionStep.tsx`

#### 5.7 Bosqich Bajarilishi (Step Executions)

**Yo'l**: `/production/step-executions`  
**Fayl**: `src/pages/production/ProductionStepExecutions.tsx`

**Maqsadi**: Har bir bosqichning amalda bajarilishini nazorat qilish

**Funksiyalar**:

- Bosqich bajarilishi ro'yxati
- Operator tayinlash
- Ish vaqti va sifat qaydlari

#### 5.8 Ishlab Chiqarish Natijalari (Production Outputs)

**Yo'l**: `/production/outputs`  
**Fayl**: `src/pages/production/ProductionOutputs.tsx`

**Maqsadi**: Ishlab chiqarish natijalarini qayd etish

#### 5.9 Ishlatilgan Materiallar (Used Materials)

**Yo'l**: `/production/used-materials`  
**Fayl**: `src/pages/production/UsedMaterials.tsx`

**Maqsadi**: Har bir buyurtmada ishlatilgan materiallarni qayd etish

**Bog'liq Sahifalar**: Materiallar, Ombor, Stanoklar

---

### 6. 🏬 **Ombor (Warehouse)**

#### 6.1 Omborlar

**Yo'l**: `/warehouse/warehouses`  
**Fayl**: `src/pages/warehouse/index.tsx`

**Maqsadi**: Ombor binolarini boshqarish

#### 6.2 Ombor Qo'shish/Tahrirlash

**Yo'l**: `/warehouse/warehouses/add`, `/warehouse/warehouses/:id/edit`  
**Fayllar**: `AddWarehouse.tsx`, `EditWarehouse.tsx`

#### 6.3 Joylashuvlar (Locations)

**Yo'l**: `/warehouse/locations`  
**Fayl**: `src/pages/warehouse/Locations.tsx`

**Maqsadi**: Ombor ichidagi joylashuvlarni boshqarish

**Joylashuv Turlari**:

- WORKCENTER (Ish markazi)
- WAREHOUSE (Ombor)
- WORKSHOP (Ustaxona)

#### 6.4 Joylashuv Qo'shish/Tahrirlash

**Yo'l**: `/warehouse/locations/add`, `/warehouse/locations/:id/edit`  
**Fayllar**: `AddLocation.tsx`, `EditLocation.tsx`

**Bog'liq Sahifalar**: Stanoklar, Ombor zahiralari

---

### 7. 📊 **Ombor Zahiralari (Stock)**

#### 7.1 Zahira Darajalari (Stock Levels)

**Yo'l**: `/stock/stock-levels`  
**Fayl**: `src/pages/stock/StockLevels.tsx`

**Maqsadi**: Har bir material va mahsulotning joriy zahirasini nazorat qilish

**Funksiyalar**:

- Zahira darajalarini ko'rish
- Kam zahira bo'lgan mahsulotlarni aniqlash
- Material/mahsulot bo'yicha filtrlash

#### 7.2 Zahira Daraji Qo'shish/Tahrirlash

**Yo'l**: `/stock/stock-levels/add`, `/stock/stock-levels/:id/edit`  
**Fayllar**: `AddStockLevel.tsx`, `EditStockLevel.tsx`

#### 7.3 Zahira Harakatlari (Inventory Movement Logs)

**Yo'l**: `/stock/inventory-movement-logs`  
**Fayl**: `src/pages/stock/InventoryMovementLogs.tsx`

**Maqsadi**: Materiallar va mahsulotlarning kirimi-chiqimini qayd etish

**Harakat Turlari**:

- Kirish (IN)
- Chiqish (OUT)
- Transfer

#### 7.4 Zahira Harakati Qo'shish/Tahrirlash

**Yo'l**: `/stock/inventory-movement-logs/add`, `/stock/inventory-movement-logs/:id/edit`  
**Fayllar**: `AddInventoryMovement.tsx`, `EditInventoryMovement.tsx`

**Bog'liq Sahifalar**: Materiallar, Mahsulotlar, Joylashuvlar

---

### 8. 👥 **Foydalanuvchilar (Users)**

#### 8.1 Foydalanuvchilar Ro'yxati

**Yo'l**: `/users`  
**Fayl**: `src/pages/users/index.tsx`

**Maqsadi**: Tizim foydalanuvchilarini boshqarish

#### 8.2 Foydalanuvchi Qo'shish

**Yo'l**: `/users/add`  
**Fayl**: `src/pages/users/AddUser.tsx`

**Funksiyalar**:

- Yangi foydalanuvchi yaratish
- Rol va huquqlar berish
- Operator sifatida tayinlash

#### 8.3 Foydalanuvchi Tahrirlash

**Yo'l**: `/users/:id/edit`  
**Fayl**: `src/pages/users/EditUser.tsx`

**Bog'liq Sahifalar**: Ishlab chiqarish (operator tayinlash)

---

### 9. 🔐 **Autentifikatsiya (Authentication)**

#### 9.1 Kirish (Login)

**Yo'l**: `/login`  
**Fayl**: `src/pages/auth/LoginPage.tsx`

**Maqsadi**: Tizimga kirish

**Funksiyalar**:

- Email va parol orqali kirish
- Sessiya boshqaruvi
- Himoyalangan yo'llar

---

## Rivojlantirilayotgan Modullar

### Sifat Nazorati (QC)

**Yo'l**: `/qc` (hozircha mavjud emas)  
**Maqsadi**: Mahsulot sifatini nazorat qilish

### Qadoqlash (Packaging)

**Yo'l**: `/packaging` (hozircha mavjud emas)  
**Maqsadi**: Qadoqlash jarayonini boshqarish

### Hisobotlar (Reports)

**Yo'l**: `/reports` (hozircha mavjud emas)  
**Maqsadi**: Turli hisobotlar yaratish

---

## State Management (Zustand Store)

### Asosiy Store'lar:

- **`auth.store.ts`** - Foydalanuvchi autentifikatsiyasi
- **`production.store.ts`** - Ishlab chiqarish ma'lumotlari
- **`products.store.ts`** - Mahsulotlar
- **`materials.store.ts`** - Materiallar
- **`stock.store.ts`** - Ombor zahiralari
- **`workcenters.store.ts`** - Stanoklar
- **`warehouses.store.ts`** - Omborlar
- **`locations.store.ts`** - Joylashuvlar
- **`users.store.ts`** - Foydalanuvchilar

---

## API Integration

**Backend URL**: `http://172.30.150.162:8001/api`

**Asosiy Endpoint'lar**:

- `/orders/` - Buyurtmalar
- `/materials/` - Materiallar
- `/products/` - Mahsulotlar
- `/workcenters/` - Stanoklar
- `/production-steps/` - Ishlab chiqarish bosqichlari
- `/step-executions/` - Bosqich bajarilishi
- `/production-outputs/` - Ishlab chiqarish natijalari
- `/stock-levels/` - Zahira darajalari
- `/inventory-movement-logs/` - Zahira harakatlari
- `/warehouses/` - Omborlar
- `/locations/` - Joylashuvlar
- `/users/` - Foydalanuvchilar

---

## Loyihaning Hozirgi Holati

### ✅ Tayyor Modullar:

- Dashboard (asosiy ko'rsatkichlar)
- Materiallar boshqaruvi
- Mahsulotlar boshqaruvi
- Stanoklar boshqaruvi
- Ishlab chiqarish (buyurtmalar, bosqichlar)
- Ombor boshqaruvi
- Zahira boshqaruvi
- Foydalanuvchilar boshqaruvi
- Autentifikatsiya

### 🚧 Rivojlantirilayotgan:

- Sifat nazorati (QC)
- Qadoqlash
- Hisobotlar
- Mahsulot komponentlari to'liq funksionalligi

### 🔧 Texnik Talablar:

- Node.js 18+
- Modern brauzer
- Internet aloqasi (API uchun)

---

## Xulosa

ISOCOM CRM - bu to'liq ishlab chiqarish korxonasi uchun yaratilgan zamonaviy tizim bo'lib, materiallardan tortib tayyor mahsulotgacha bo'lgan barcha jarayonlarni nazorat qilish imkoniyatini beradi. Tizim ISO standartlariga muvofiq ishlab chiqarilgan va zamonaviy web texnologiyalari asosida qurilgan.

**Asosiy Imkoniyatlar**:

- To'liq resurs boshqaruvi
- Real-time monitoring
- Sifat nazorati
- Hisobotlar va analytics
- Foydalanuvchi-do'st interfeys
- Mobil moslashuvchanlik

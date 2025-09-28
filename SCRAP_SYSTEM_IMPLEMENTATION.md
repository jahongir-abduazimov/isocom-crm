# Brak Tizimi - Yangi Implementatsiya

## Umumiy Ma'lumot

IsoCom II tizimida brak (scrap) materiallar boshqaruvi va qayta ishlash tizimi to'liq qayta yozildi. Yangi tizim dokumentatsiyaga to'liq mos keladi va zamonaviy React komponentlari bilan yaratildi.

## Yangi Komponentlar

### 1. Scrap Service (`src/services/scrap.service.ts`)

- **RealTimeScrapData**: Real-time brak ma'lumotlari
- **ScrapStatistics**: Umumiy brak statistikasi
- **getRealTimeScrap()**: Real-time ma'lumotlar olish
- **getScrapStatistics()**: Statistikalar olish
- **getProductionScraps()**: Ishlab chiqarish braklari
- **createScrap()**: Yangi brak yaratish
- **updateScrap()**: Brak yangilash

### 2. Scrap Store (`src/store/scrap.store.ts`)

- **realTimeData**: Real-time ma'lumotlar
- **statistics**: Umumiy statistikalar
- **refreshData()**: Barcha ma'lumotlarni yangilash
- **getRealTimeScrap()**: Real-time ma'lumotlar olish
- **getScrapStatistics()**: Statistikalar olish

### 3. Recycling Service (`src/services/recycling.service.ts`)

- **RecyclingBatch**: Qayta ishlash partiyasi
- **DrobilkaProcess**: Drobilka jarayoni
- **CurrentTotals**: Joriy to'plangan miqdorlar
- **CompleteRecyclingRequest**: Qayta ishlash yakunlash so'rovi
- **getRecyclingEfficiency()**: Samaradorlik hisoblash

### 4. Recycling Store (`src/store/recycling.store.ts`)

- **currentBatch**: Faol qayta ishlash partiyasi
- **recyclingBatches**: Barcha partiyalar
- **activeDrobilkaProcesses**: Faol drobilka jarayonlari
- **startRecyclingBatch()**: Qayta ishlash boshlash
- **completeRecyclingBatch()**: Qayta ishlash yakunlash
- **refreshData()**: Barcha ma'lumotlarni yangilash

## Yangi Sahifalar

### 1. Scrap Index (`src/pages/scrap/index.tsx`)

- Asosiy brak tizimi sahifasi
- Joriy holat ko'rsatish
- Qayta ishlash boshlash tugmasi
- Barcha sahifalarga o'tish menyusi

### 2. Scrap List (`src/pages/scrap/ScrapList.tsx`)

- Barcha brak materiallar ro'yxati
- Filtrlash va qidiruv
- Real-time yangilash
- Brak detallari modali

### 3. Scrap Dashboard (`src/pages/scrap/ScrapDashboard.tsx`)

- Real-time brak monitoring
- Ishlab chiqarish joylari bo'yicha taqsimlash
- Umumiy statistikalar
- Avtomatik yangilash

### 4. Recycling Workflow (`src/pages/scrap/RecyclingWorkflow.tsx`)

- To'liq qayta ishlash jarayoni
- Workflow bosqichlari
- Drobilka boshqaruvi
- Progress monitoring

## Yangi Modallar

### 1. Start Drobilka Modal (`src/components/ui/start-drobilka-modal.tsx`)

- Drobilka jarayonini boshlash
- Stanok va operator tanlash
- Validation va xatolik boshqaruvi
- Real-time ma'lumotlar

### 2. Complete Drobilka Modal (`src/components/ui/complete-drobilka-modal.tsx`)

- Drobilka jarayonini yakunlash
- Chiqish miqdori kiritish
- Samaradorlik hisoblash
- Validation va xatolik boshqaruvi

### 3. Complete Recycling Batch Modal (`src/components/ui/complete-recycling-batch-modal.tsx`)

- Qayta ishlash partiyasini yakunlash
- Final VT miqdori kiritish
- Umumiy samaradorlik hisoblash
- Yakunlovchi izohlar

## API Endpointlari

### Scrap Endpoints

```
GET /api/scrap/ - Brak ro'yxati
GET /api/scrap/{id}/ - Brak detallari
GET /api/scrap/real_time_scrap/ - Real-time ma'lumotlar
GET /api/scrap/statistics/ - Umumiy statistikalar
GET /api/scrap/production_scraps/ - Ishlab chiqarish braklari
POST /api/scrap/ - Yangi brak yaratish
PATCH /api/scrap/{id}/ - Brak yangilash
```

### Recycling Endpoints

```
GET /api/recycling/ - Qayta ishlash partiyalari
POST /api/recycling/start_recycling/ - Qayta ishlash boshlash
GET /api/recycling/current_totals/ - Joriy miqdorlar
POST /api/recycling/{id}/complete_recycling/ - Partiya yakunlash
GET /api/recycling/{id}/efficiency/ - Samaradorlik hisoblash
```

### Drobilka Endpoints

```
GET /api/drobilka/ - Drobilka jarayonlari
POST /api/drobilka/ - Drobilka boshlash
PATCH /api/drobilka/{id}/ - Drobilka yakunlash
DELETE /api/drobilka/{id}/ - Drobilka o'chirish
```

## Brak Holatlari

### Yangi Holatlar (Dokumentatsiyaga muvofiq)

- **PENDING**: Kutilmoqda (qayta ishlash uchun to'plangan)
- **IN_DROBIL**: Drobilkada (qayta ishlash jarayonida)
- **RECYCLED**: Qayta ishlangan (maydalangan)
- **MOVED**: VT ga o'tkazilgan (yakuniy mahsulot)

### Eski Holatlar (Legacy)

- **IN_PROCESS**: Jarayonda
- **COMPLETED**: Yakunlangan
- **CONFIRMED**: Tasdiqlangan
- **WRITTEN_OFF**: Hisobdan chiqarilgan

## Qayta Ishlash Jarayoni

### 1. Brak Hosil Bo'lish

- **Ekstruder**: 20% qattiq brak
- **Laminator**: 10% yumshoq brak
- **Boshqa**: 3% aralash brak

### 2. Qayta Ishlash Bosqichlari

1. **Brak To'planishi**: PENDING holatida saqlanish
2. **Qayta Ishlash Boshlanishi**: Yangi partiya yaratish
3. **Qattiq Brak Drobilka**: Qattiq braklar maydalanish
4. **Yumshoq Brak Drobilka**: Yumshoq braklar qayta ishlanish
5. **Yakuniy Qayta Ishlash**: VT granulasi tayyorlash

### 3. Drobilka Jarayoni

- **Qattiq Drobilka**: 95% samaradorlik
- **Yumshoq Drobilka**: 90% samaradorlik
- **Operatorlar**: 2-3 ta operator talab qilinadi
- **Mas'ul Operator**: Lead operator belgilanadi

## Navigation Yangilanishi

### Sidebar (`src/components/layout/Sidebar.tsx`)

- Yangi scrap sahifalari qo'shildi
- Legacy sahifalar saqlanib qoldi

### Operator Top Nav (`src/components/layout/OperatorTopNav.tsx`)

- Yangi "Brak Tizimi" linki qo'shildi
- Eski "/reprocessing" linki "/scrap" ga o'zgartirildi

### App Router (`src/router/AppRouter.tsx`)

- Yangi scrap route'lar qo'shildi
- Legacy route'lar saqlanib qoldi

## Xususiyatlar

### 1. Real-time Monitoring

- 30 soniyada avtomatik yangilash
- Real-time brak miqdorlari
- Ishlab chiqarish joylari bo'yicha taqsimlash

### 2. Workflow Management

- To'liq qayta ishlash jarayoni
- Bosqichli progress monitoring
- Drobilka boshqaruvi

### 3. Validation va Xatolik Boshqaruvi

- Form validation
- API xatoliklarini boshqarish
- User-friendly xatolik xabarlari

### 4. Responsive Design

- Mobile-friendly dizayn
- Touch-friendly interfeys
- Adaptive layout

## Legacy Tizim

Eski tizim saqlanib qoldi va `/scrap/reprocessing` route orqali kirish mumkin. Bu eski ma'lumotlar bilan ishlash uchun kerak.

## Testing

### Manual Testing

1. Brak ro'yxatini ko'rish
2. Real-time monitoring ishlashi
3. Qayta ishlash jarayonini boshlash
4. Drobilka jarayonini boshqarish
5. Qayta ishlashni yakunlash

### API Testing

- Barcha endpoint'lar test qilinishi kerak
- Validation qoidalari tekshirilishi kerak
- Xatolik holatlari sinovdan o'tkazilishi kerak

## Kelajakdagi Yaxshilanishlar

1. **Real-time WebSocket**: WebSocket orqali real-time yangilanish
2. **Push Notifications**: Yangi braklar haqida bildirishnomalar
3. **Advanced Analytics**: Batafsil tahlil va hisobotlar
4. **Mobile App**: Native mobile ilovasi
5. **QR Code Integration**: QR kodlar orqali tez kirish

## Xulosa

Yangi brak tizimi to'liq dokumentatsiyaga muvofiq implement qilindi va zamonaviy React komponentlari bilan yaratildi. Tizim real-time monitoring, workflow management va responsive design xususiyatlariga ega.

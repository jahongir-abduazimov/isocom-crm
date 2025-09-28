# Brak (Brag) Qayta Ishlash Jarayoni - To'liq Tushuntirish

## 1. Brak Qanday Hosil Bo'ladi?

### 1.1 Avtomatik Brak Hisoblash
IsoCom II tizimida brak materiallar ishlab chiqarish jarayonlarida avtomatik tarzda hisoblanadi:

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Jarayon       │   Brak Turi     │   Foiz          │
├─────────────────┼─────────────────┼─────────────────┤
│ Ekstruder       │ Qattiq (HARD)   │ 20%             │
│ Laminatsiya     │ Yumshoq (SOFT)  │ 10%             │
│ Boshqa          │ Aralash         │ 3%              │
└─────────────────┴─────────────────┴─────────────────┘
```

### 1.2 Brak Yaratilish Jarayoni

```python
# Brak avtomatik yaratilish logikasi (production/signals.py dan)
def create_scrap_from_production(sender, instance, created, **kwargs):
    if created and instance.status == 'COMPLETED':
        # Ekstruder uchun 20% brak
        if instance.production_step.step_type == 'EXTRUSION':
            scrap_percentage = 0.20
            scrap_type = 'HARD'
        
        # Laminatsiya uchun 10% brak
        elif instance.production_step.step_type == 'LAMINATION':
            scrap_percentage = 0.10
            scrap_type = 'SOFT'
        
        # Boshqa jarayonlar uchun 3% brak
        else:
            scrap_percentage = 0.03
            scrap_type = 'SOFT'  # Default sifatida
        
        # Brak yaratish
        scrap_quantity = instance.quantity_processed * scrap_percentage
        scrap_weight = scrap_quantity  # kg
        
        Scrap.objects.create(
            step_execution=instance,
            scrap_type=scrap_type,
            quantity=scrap_quantity,
            weight=scrap_weight,
            unit_of_measure='KG',
            reason='AUTOMATIC_CALCULATION',
            status='PENDING',
            recorded_by=None  # Avtomatik yaratilgan
        )
```

## 2. Brak Holatlari va O'tish Jarayoni

### 2.1 Brak Holatlari (Status Flow)

```
PENDING → IN_DROBIL → RECYCLED → MOVED
   ↓           ↓           ↓         ↓
Kutilmoqda → Drobilkada → Qayta    → VT ga
            (Qayta      ishlangan   o'tkazilgan
             ishlash               (Yakuniy
             jarayonida)           mahsulot)
```

### 2.2 Holat O'zgarishlari

1. **PENDING** - Brak to'plangan, qayta ishlash kutmoqda
2. **IN_DROBIL** - Qayta ishlash partiyasi boshlanganda
3. **RECYCLED** - Drobilka jarayoni yakunlanganda
4. **MOVED** - Butun qayta ishlash partiyasi yakunlanganda

## 3. Qayta Ishlash Jarayoni (Recycling Workflow)

### 3.1 Umumiy Jarayon Diagrammasi

```
┌─────────────────────────────────────────────────────────────────┐
│                    BRAK QAYTA ISHLASH JARAYONI                 │
└─────────────────────────────────────────────────────────────────┘

1. BRAK TO'PLANISHI
   ├── Ekstruder → Qattiq Brak (20%)
   ├── Laminator → Yumshoq Brak (10%)
   └── Boshqa → Aralash Brak (3%)
   ↓
   [PENDING holatida saqlanishi]

2. QAYTA ISHLASH BOSHLANISHI
   ├── To'plangan braklar miqdorini tekshirish
   ├── Yangi partiya yaratish (RB + sana/vaqt)
   └── Barcha PENDING braklar → IN_DROBIL
   ↓

3. QATTIQ BRAK DROBILKA
   ├── Qattiq braklar maydalanishi
   ├── Maydalangan materiallar
   └── Qattiq braklar → RECYCLED
   ↓

4. YUMSHOQ BRAK DROBILKA
   ├── Yumshoq braklar + maydalangan qattiq braklar
   ├── Barcha materiallar birga qayta ishlanishi
   └── Yumshoq braklar → RECYCLED
   ↓

5. YAKUNIY QAYTA ISHLASH
   ├── Final VT miqdorini kiritish
   ├── Partiya COMPLETED holatiga o'tkazish
   └── Barcha RECYCLED braklar → MOVED
```

### 3.2 Qayta Ishlash Partiyasi (Recycling Batch)

```python
# Qayta ishlash partiyasi yaratish
def start_recycling_batch():
    # 1. To'plangan braklar miqdorini olish
    pending_scraps = Scrap.objects.filter(status='PENDING')
    hard_total = pending_scraps.filter(scrap_type='HARD').aggregate(
        total=Sum('weight'))['total'] or 0
    soft_total = pending_scraps.filter(scrap_type='SOFT').aggregate(
        total=Sum('weight'))['total'] or 0
    
    # 2. Yangi partiya yaratish
    batch = ScrapRecyclingBatch.objects.create(
        batch_number=f"RB{timezone.now().strftime('%y%m%d%H%M')}",
        total_hard_scrap=hard_total,
        total_soft_scrap=soft_total,
        status='IN_PROGRESS'
    )
    
    # 3. Barcha pending braklar statusini o'zgartirish
    pending_scraps.update(status='IN_DROBIL')
    
    return batch
```

### 3.3 Drobilka Jarayoni

#### 3.3.1 Qattiq Brak Drobilka

```python
# Qattiq brak drobilka jarayoni
def start_hard_drobilka(batch_id, work_center_id, operators, input_quantity):
    # 1. Drobilka jarayonini yaratish
    drobilka = ScrapDrobilka.objects.create(
        recycling_batch_id=batch_id,
        drobilka_type='HARD',
        work_center_id=work_center_id,
        input_quantity=input_quantity,
        lead_operator=current_user
    )
    
    # 2. Operatorlarni qo'shish
    drobilka.operators.add(*operators)
    
    return drobilka

def complete_hard_drobilka(drobilka_id, output_quantity):
    # 1. Drobilka jarayonini yakunlash
    drobilka = ScrapDrobilka.objects.get(id=drobilka_id)
    drobilka.output_quantity = output_quantity
    drobilka.completed_at = timezone.now()
    drobilka.save()
    
    # 2. Qattiq braklar statusini o'zgartirish
    Scrap.objects.filter(
        status='IN_DROBIL',
        scrap_type='HARD'
    ).update(status='RECYCLED')
```

#### 3.3.2 Yumshoq Brak Drobilka

```python
# Yumshoq brak drobilka jarayoni
def start_soft_drobilka(batch_id, work_center_id, operators, input_quantity):
    # Yumshoq braklar + maydalangan qattiq braklar birga qayta ishlanadi
    drobilka = ScrapDrobilka.objects.create(
        recycling_batch_id=batch_id,
        drobilka_type='SOFT',
        work_center_id=work_center_id,
        input_quantity=input_quantity,  # Yumshoq + maydalangan qattiq
        lead_operator=current_user
    )
    
    drobilka.operators.add(*operators)
    return drobilka

def complete_soft_drobilka(drobilka_id, output_quantity):
    drobilka = ScrapDrobilka.objects.get(id=drobilka_id)
    drobilka.output_quantity = output_quantity
    drobilka.completed_at = timezone.now()
    drobilka.save()
    
    # Yumshoq braklar statusini o'zgartirish
    Scrap.objects.filter(
        status__in=['IN_DROBIL', 'RECYCLED'],
        scrap_type='SOFT'
    ).update(status='RECYCLED')
```

## 4. Materiallar Oqimi (Material Flow)

### 4.1 Brak Materiallar Oqimi

```
Ishlab Chiqarish Jarayonlari:
┌─────────────┬─────────────┬─────────────┐
│ Ekstruder   │ Laminator   │ Boshqa      │
│ (20% brak)  │ (10% brak)  │ (3% brak)   │
└─────────────┴─────────────┴─────────────┘
        ↓           ↓           ↓
┌─────────────────────────────────────────┐
│           BRAK TO'PLANISHI              │
│        (PENDING holatida)               │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│        QAYTA ISHLASH PARTIYASI          │
│         (IN_PROGRESS)                   │
└─────────────────────────────────────────┘
        ↓
┌─────────────┬─────────────┐
│ Qattiq      │ Yumshoq     │
│ Drobilka    │ Drobilka    │
│ (HARD)      │ (SOFT)      │
└─────────────┴─────────────┘
        ↓           ↓
┌─────────────────────────────────────────┐
│         VT GRANULASI                    │
│      (Yakuniy mahsulot)                 │
└─────────────────────────────────────────┘
```

### 4.2 Miqdorlar Hisoblash

```python
# Miqdorlar hisoblash misoli
def calculate_recycling_quantities():
    # Boshlang'ich braklar
    hard_scrap_initial = 100.0  # kg (qattiq brak)
    soft_scrap_initial = 50.0   # kg (yumshoq brak)
    
    # Qattiq brak drobilka (95% samaradorlik)
    hard_drobilka_efficiency = 0.95
    hard_output = hard_scrap_initial * hard_drobilka_efficiency
    hard_output = 95.0  # kg
    
    # Yumshoq brak drobilka (qattiq + yumshoq)
    soft_total_input = soft_scrap_initial + hard_output
    soft_total_input = 50.0 + 95.0  # 145.0 kg
    
    # Yumshoq drobilka (90% samaradorlik)
    soft_drobilka_efficiency = 0.90
    final_vt = soft_total_input * soft_drobilka_efficiency
    final_vt = 145.0 * 0.90  # 130.5 kg
    
    return {
        'initial_hard': hard_scrap_initial,
        'initial_soft': soft_scrap_initial,
        'hard_output': hard_output,
        'soft_input': soft_total_input,
        'final_vt': final_vt,
        'total_loss': (hard_scrap_initial + soft_scrap_initial) - final_vt
    }
```

## 5. Drobilka Stanoklari va Operatorlar

### 5.1 Drobilka Stanoklari

```python
# Drobilka stanoklari sozlamalari
DROBILKA_WORKCENTERS = [
    {
        'name': 'Hard Drobilka 1',
        'type': 'BRAK_MAYDALAGICH',
        'capacity': 50.0,  # kg/saat
        'specialization': 'HARD'
    },
    {
        'name': 'Soft Drobilka 1', 
        'type': 'BRAK_MAYDALAGICH',
        'capacity': 75.0,  # kg/saat
        'specialization': 'SOFT'
    }
]
```

### 5.2 Operatorlar Tizimi

```python
# Drobilka jarayonida operatorlar
def validate_drobilka_operators(operators):
    """
    Drobilka jarayoni uchun operatorlar tekshiruvi
    - Kamida 2 ta operator
    - Maksimal 3 ta operator
    - Bitta mas'ul operator (lead_operator)
    """
    if len(operators) < 2:
        raise ValidationError("Kamida 2 ta operator kerak")
    
    if len(operators) > 3:
        raise ValidationError("Maksimal 3 ta operator mumkin")
    
    return True

def assign_lead_operator(operators, current_user):
    """
    Mas'ul operator belgilash
    - Avval current_user (so'rov yuborgan foydalanuvchi)
    - Agar u operatorlar ro'yxatida bo'lmasa, qo'shiladi
    """
    if current_user.id not in [op.id for op in operators]:
        operators.append(current_user)
    
    return current_user
```

## 6. API Endpointlari va Frontend Integratsiyasi

### 6.1 Asosiy API Endpointlari

```
Brak Boshqaruvi:
├── GET    /api/scrap/                    - Brak ro'yxati
├── POST   /api/scrap/                    - Yangi brak yaratish
├── GET    /api/scrap/{id}/               - Brak detallari
├── PATCH  /api/scrap/{id}/               - Brak yangilash
├── GET    /api/scrap/statistics/         - Brak statistikasi
├── GET    /api/scrap/production_scraps/  - Production bo'yicha braklar
└── GET    /api/scrap/real_time_scrap/    - Real-time brak ma'lumotlari

Qayta Ishlash Boshqaruvi:
├── GET    /api/recycling/                - Qayta ishlash partiyalari
├── POST   /api/recycling/start_recycling/ - Qayta ishlash boshlash
├── GET    /api/recycling/current_totals/  - Joriy to'plangan miqdorlar
└── POST   /api/recycling/{id}/complete_recycling/ - Partiya yakunlash

Drobilka Boshqaruvi:
├── GET    /api/drobilka/                 - Drobilka jarayonlari
├── POST   /api/drobilka/                 - Drobilka jarayonini boshlash
├── PATCH  /api/drobilka/{id}/            - Drobilka jarayonini yangilash
└── POST   /api/drobilka/{id}/complete/   - Drobilka jarayonini yakunlash
```

### 6.2 Frontend State Management

```javascript
// Redux store struktura
const scrapStore = {
  scraps: {
    items: [],
    loading: false,
    error: null,
    filters: {
      scrap_type: '',
      status: '',
      date_range: ''
    }
  },
  
  recycling: {
    currentBatch: null,
    currentTotals: {
      hard_scrap: 0,
      soft_scrap: 0
    },
    batches: [],
    loading: false,
    error: null
  },
  
  drobilka: {
    activeProcesses: [],
    workCenters: [],
    operators: [],
    loading: false,
    error: null
  }
};
```

## 7. Monitoring va Reporting

### 7.1 Real-time Monitoring

```python
# Real-time brak monitoring
def get_real_time_scrap_data():
    today = timezone.now().date()
    today_scraps = Scrap.objects.filter(created_at__date=today)
    
    # Work center bo'yicha guruhlash
    by_workcenter = {}
    for scrap in today_scraps:
        wc_name = scrap.step_execution.work_center.name
        if wc_name not in by_workcenter:
            by_workcenter[wc_name] = {
                'hard_scrap': 0,
                'soft_scrap': 0,
                'total_weight': 0
            }
        
        if scrap.scrap_type == 'HARD':
            by_workcenter[wc_name]['hard_scrap'] += float(scrap.quantity)
        else:
            by_workcenter[wc_name]['soft_scrap'] += float(scrap.quantity)
        
        by_workcenter[wc_name]['total_weight'] += float(scrap.weight)
    
    return {
        'today_total': {
            'hard_scrap': today_scraps.filter(scrap_type='HARD').aggregate(
                total=Sum('quantity'))['total'] or 0,
            'soft_scrap': today_scraps.filter(scrap_type='SOFT').aggregate(
                total=Sum('quantity'))['total'] or 0,
            'total_weight': today_scraps.aggregate(total=Sum('weight'))['total'] or 0
        },
        'by_workcenter': by_workcenter
    }
```

### 7.2 Performance Metrics

```python
# Qayta ishlash samaradorligi
def calculate_recycling_efficiency(batch_id):
    batch = ScrapRecyclingBatch.objects.get(id=batch_id)
    
    total_input = batch.total_hard_scrap + batch.total_soft_scrap
    total_output = batch.final_vt_quantity or 0
    
    if total_input > 0:
        efficiency = (total_output / total_input) * 100
        loss_percentage = 100 - efficiency
    else:
        efficiency = 0
        loss_percentage = 0
    
    return {
        'total_input': total_input,
        'total_output': total_output,
        'efficiency_percentage': efficiency,
        'loss_percentage': loss_percentage,
        'processing_time': batch.completed_at - batch.started_at if batch.completed_at else None
    }
```

## 8. Xatoliklar va Exception Handling

### 8.1 Umumiy Xatoliklar

```python
# Brak qayta ishlash xatoliklari
class ScrapProcessingError(Exception):
    """Brak qayta ishlash xatoliklari"""
    pass

class InsufficientScrapError(ScrapProcessingError):
    """Yetarli brak yo'q"""
    pass

class InvalidWorkCenterError(ScrapProcessingError):
    """Noto'g'ri drobilka stanogi"""
    pass

class InsufficientOperatorsError(ScrapProcessingError):
    """Yetarli operator yo'q"""
    pass

# Exception handling
def handle_scrap_processing_error(error):
    if isinstance(error, InsufficientScrapError):
        return Response(
            {'detail': 'Qayta ishlash uchun yetarli brak yo\'q'},
            status=status.HTTP_400_BAD_REQUEST
        )
    elif isinstance(error, InvalidWorkCenterError):
        return Response(
            {'detail': 'Faqat BRAK_MAYDALAGICH turidagi stanoklar tanlash mumkin'},
            status=status.HTTP_400_BAD_REQUEST
        )
    elif isinstance(error, InsufficientOperatorsError):
        return Response(
            {'detail': 'Kamida 2 ta operator kerak'},
            status=status.HTTP_400_BAD_REQUEST
        )
    else:
        return Response(
            {'detail': 'Server xatoligi'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

## 9. Testing va Quality Assurance

### 9.1 Unit Testlar

```python
# Brak qayta ishlash testlari
class TestScrapRecycling(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('testuser', 'test@example.com', 'password')
        self.work_center = WorkCenter.objects.create(
            name='Test Drobilka',
            type='BRAK_MAYDALAGICH'
        )
    
    def test_scrap_creation(self):
        """Brak yaratish testi"""
        scrap = Scrap.objects.create(
            step_execution=self.step_execution,
            scrap_type='HARD',
            quantity=10.0,
            weight=10.0,
            status='PENDING',
            recorded_by=self.user
        )
        
        self.assertEqual(scrap.scrap_type, 'HARD')
        self.assertEqual(scrap.status, 'PENDING')
    
    def test_recycling_batch_creation(self):
        """Qayta ishlash partiyasi yaratish testi"""
        # Braklar yaratish
        Scrap.objects.create(
            scrap_type='HARD',
            quantity=50.0,
            weight=50.0,
            status='PENDING'
        )
        
        # Qayta ishlash boshlash
        response = self.client.post('/api/recycling/start_recycling/')
        self.assertEqual(response.status_code, 200)
        
        batch = ScrapRecyclingBatch.objects.first()
        self.assertEqual(batch.status, 'IN_PROGRESS')
        self.assertEqual(batch.total_hard_scrap, 50.0)
    
    def test_drobilka_process(self):
        """Drobilka jarayoni testi"""
        batch = ScrapRecyclingBatch.objects.create(
            batch_number='RB001',
            total_hard_scrap=50.0,
            total_soft_scrap=30.0,
            status='IN_PROGRESS'
        )
        
        drobilka = ScrapDrobilka.objects.create(
            recycling_batch=batch,
            drobilka_type='HARD',
            work_center=self.work_center,
            input_quantity=50.0,
            lead_operator=self.user
        )
        
        # Drobilka yakunlash
        response = self.client.post(f'/api/drobilka/{drobilka.id}/complete/', {
            'output_quantity': 47.5
        })
        
        self.assertEqual(response.status_code, 200)
        drobilka.refresh_from_db()
        self.assertIsNotNone(drobilka.completed_at)
        self.assertEqual(drobilka.output_quantity, 47.5)
```

## 10. Performance va Scalability

### 10.1 Database Optimization

```python
# Database indexlar
class Scrap(models.Model):
    # ... maydonlar ...
    
    class Meta:
        indexes = [
            models.Index(fields=['scrap_type']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['step_execution']),
        ]

# Query optimization
def get_scraps_optimized():
    return Scrap.objects.select_related(
        'step_execution__production_step',
        'step_execution__work_center',
        'recorded_by'
    ).prefetch_related(
        'step_execution__order'
    ).filter(status='PENDING')
```

### 10.2 Caching Strategy

```python
# Redis cache
from django.core.cache import cache

def get_scrap_statistics():
    cache_key = 'scrap_statistics'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return cached_data
    
    # Expensive calculation
    data = calculate_scrap_statistics()
    
    # Cache for 5 minutes
    cache.set(cache_key, data, 300)
    
    return data
```

Bu to'liq dokumentatsiya IsoCom II tizimidagi brak qayta ishlash jarayonini barcha jihatlari bilan tushuntirib beradi. Frontend dasturchilar bu ma'lumotlar asosida to'liq funksional scrap va recycling tizimini yaratishlari mumkin.

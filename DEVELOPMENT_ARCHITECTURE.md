# 자재 가격 동향 분석 시스템 - 개발 아키텍처

## 1. 전체 시스템 아키텍처

### 1.1 기술 스택 상세
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│ Next.js 14+ (App Router) + React 18+ + TypeScript          │
│ Tailwind CSS + shadcn/ui + Recharts                        │
│ TRAE AI Integration (Live Coding Assistant)                │
├─────────────────────────────────────────────────────────────┤
│                    API Layer                               │
├─────────────────────────────────────────────────────────────┤
│ Next.js API Routes + Server Actions                        │
│ Supabase Client SDK                                         │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│ Supabase (PostgreSQL) + Real-time Subscriptions           │
│ Row Level Security (RLS)                                   │
├─────────────────────────────────────────────────────────────┤
│                    External Services                       │
├─────────────────────────────────────────────────────────────┤
│ KPI 웹 크롤링 서비스 + Vercel Cron Jobs                    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 TRAE AI 연동 아키텍처
```
┌─────────────────────────────────────────────────────────────┐
│                    TRAE AI IDE                             │
├─────────────────────────────────────────────────────────────┤
│ • Live Coding Assistant                                     │
│ • Real-time Code Generation                                 │
│ • Intelligent Code Completion                               │
│ • Automated Testing & Debugging                            │
├─────────────────────────────────────────────────────────────┤
│                    Development Workflow                    │
├─────────────────────────────────────────────────────────────┤
│ TRAE AI → Local Development → Git → Vercel → Production    │
└─────────────────────────────────────────────────────────────┘
```

## 2. 프로젝트 구조 상세

### 2.1 현재 파일 구조
```
materials-dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # 대시보드 메인 페이지
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── globals.css               # 글로벌 스타일
│   │   ├── providers.tsx             # Context Providers
│   │   ├── materials/                # 자재 가격 관리
│   │   │   ├── page.tsx              # 자재 목록 페이지
│   │   │   └── [id]/                 # 자재 상세 페이지
│   │   ├── calculator/               # 엔지니어링 계산기 (유지)
│   │   │   ├── page.tsx              # 계산기 메인
│   │   │   ├── tank/                 # 탱크 계산
│   │   │   ├── npsh/                 # NPSH 계산
│   │   │   └── affinity/             # 상사법칙 계산
│   │   ├── iso-piping-editor/        # ISO 배관 에디터 (유지)
│   │   │   └── page.tsx              # 배관 에디터
│   │   ├── asme-materials/           # ASME 자재 (기존 유지)
│   │   ├── settings/                 # 설정 (기존 유지)
│   │   └── technical-docs/           # 기술 문서 (기존 유지)
│   ├── components/                   # 재사용 컴포넌트
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   │   ├── Layout.tsx            # 메인 레이아웃
│   │   │   ├── Header.tsx            # 헤더
│   │   │   └── Sidebar.tsx           # 사이드바
│   │   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── charts/                   # 차트 컴포넌트
│   │   │   └── MaterialPriceChart.tsx
│   │   └── visualization/            # 3D 시각화
│   │       ├── TankVisualization.tsx
│   │       └── PumpVisualization.tsx
│   ├── data/                         # 샘플 데이터
│   │   └── materialPriceData.ts      # 임시 데이터 (추후 API 대체)
│   └── lib/                          # 유틸리티 & 설정
│       ├── supabase.ts               # Supabase 클라이언트
│       ├── api.ts                    # API 함수들
│       └── utils.ts                  # 공통 유틸리티
├── supabase/                         # Supabase 설정
│   ├── config.toml                   # 로컬 개발 설정
│   └── .gitignore
├── public/                           # 정적 파일
└── 설정 파일들...
```

### 2.2 추가 예정 구조
```
src/
├── app/
│   ├── api/                          # API Routes
│   │   ├── materials/
│   │   │   ├── route.ts              # 자재 CRUD API
│   │   │   └── [id]/route.ts         # 개별 자재 API
│   │   ├── prices/
│   │   │   ├── route.ts              # 가격 데이터 API
│   │   │   └── history/route.ts      # 가격 이력 API
│   │   ├── categories/
│   │   │   └── route.ts              # 카테고리 API
│   │   ├── crawl/
│   │   │   ├── route.ts              # 크롤링 트리거 API
│   │   │   └── status/route.ts       # 크롤링 상태 API
│   │   └── charts/
│   │       └── route.ts              # 차트 데이터 API
│   └── admin/                        # 관리자 페이지
│       ├── page.tsx                  # 관리자 대시보드
│       ├── crawling/
│       │   └── page.tsx              # 크롤링 관리
│       └── materials/
│           └── page.tsx              # 자재 관리
├── components/
│   ├── charts/
│   │   ├── CategoryChart.tsx         # 카테고리별 차트
│   │   ├── PriceComparisonChart.tsx  # 가격 비교 차트
│   │   ├── TrendChart.tsx            # 트렌드 차트
│   │   └── ChartControls.tsx         # 차트 컨트롤
│   ├── materials/
│   │   ├── MaterialSelector.tsx      # 자재 선택기
│   │   ├── CategorySelector.tsx      # 카테고리 선택기
│   │   ├── PriceTable.tsx           # 가격 테이블
│   │   └── MaterialCard.tsx         # 자재 카드
│   ├── admin/
│   │   ├── CrawlingStatus.tsx       # 크롤링 상태
│   │   ├── MaterialManager.tsx      # 자재 관리
│   │   └── LogViewer.tsx            # 로그 뷰어
│   └── common/
│       ├── LoadingSpinner.tsx       # 로딩 스피너
│       ├── ErrorBoundary.tsx        # 에러 바운더리
│       └── DataTable.tsx            # 데이터 테이블
├── hooks/
│   ├── useMaterials.ts              # 자재 데이터 훅
│   ├── usePriceHistory.ts           # 가격 이력 훅
│   ├── useChartData.ts              # 차트 데이터 훅
│   ├── useCategories.ts             # 카테고리 훅
│   └── useCrawling.ts               # 크롤링 상태 훅
├── types/
│   ├── material.ts                  # 자재 타입 정의
│   ├── price.ts                     # 가격 타입 정의
│   ├── category.ts                  # 카테고리 타입 정의
│   ├── chart.ts                     # 차트 타입 정의
│   └── api.ts                       # API 응답 타입
├── lib/
│   ├── database/
│   │   ├── materials.ts             # 자재 DB 쿼리
│   │   ├── prices.ts                # 가격 DB 쿼리
│   │   ├── categories.ts            # 카테고리 DB 쿼리
│   │   └── crawling.ts              # 크롤링 로그 쿼리
│   ├── crawler/
│   │   ├── kpi-crawler.ts           # KPI 사이트 크롤러
│   │   ├── data-processor.ts        # 데이터 처리기
│   │   └── scheduler.ts             # 스케줄러
│   ├── validations/
│   │   ├── material.ts              # 자재 유효성 검사
│   │   ├── price.ts                 # 가격 유효성 검사
│   │   └── api.ts                   # API 유효성 검사
│   └── constants/
│       ├── materials.ts             # 자재 상수
│       ├── categories.ts            # 카테고리 상수
│       └── api.ts                   # API 상수
└── middleware.ts                     # Next.js 미들웨어
```

## 3. 데이터베이스 설계 상세

### 3.1 Supabase 테이블 스키마
```sql
-- 1. 자재 카테고리 (4계층 구조)
CREATE TABLE material_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES material_categories(id),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 자재 마스터
CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  specification TEXT,
  unit VARCHAR(20) NOT NULL,
  category_id INTEGER REFERENCES material_categories(id),
  kpi_item_code VARCHAR(50), -- KPI 사이트의 품목 코드
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 가격 이력
CREATE TABLE price_history (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES materials(id),
  price DECIMAL(15,2) NOT NULL,
  price_date DATE NOT NULL,
  data_source VARCHAR(50) DEFAULT 'KPI',
  currency VARCHAR(3) DEFAULT 'KRW',
  region VARCHAR(50) DEFAULT 'Korea',
  supplier VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(material_id, price_date, data_source)
);

-- 4. 크롤링 로그
CREATE TABLE crawling_logs (
  id SERIAL PRIMARY KEY,
  crawl_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  total_items INTEGER DEFAULT 0,
  success_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'running', -- running, completed, failed
  error_message TEXT,
  crawl_type VARCHAR(50) DEFAULT 'daily', -- daily, manual, test
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. 사용자 설정
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- 6. 가격 알림
CREATE TABLE price_alerts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  material_id INTEGER REFERENCES materials(id),
  alert_type VARCHAR(20) NOT NULL, -- increase, decrease, threshold
  threshold_value DECIMAL(15,2),
  percentage_change DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 인덱스 및 성능 최적화
```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_materials_category ON materials(category_id);
CREATE INDEX idx_materials_active ON materials(is_active);
CREATE INDEX idx_price_history_material_date ON price_history(material_id, price_date DESC);
CREATE INDEX idx_price_history_date ON price_history(price_date DESC);
CREATE INDEX idx_crawling_logs_date ON crawling_logs(crawl_date DESC);
CREATE INDEX idx_categories_parent ON material_categories(parent_id);
CREATE INDEX idx_categories_level ON material_categories(level);
```

### 3.3 Row Level Security (RLS) 설정
```sql
-- RLS 활성화
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- 읽기 권한 (모든 사용자)
CREATE POLICY "Allow read access for all users" ON materials FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON price_history FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON material_categories FOR SELECT USING (true);

-- 사용자별 설정 및 알림 권한
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own alerts" ON price_alerts
  FOR ALL USING (auth.uid() = user_id);
```

## 4. API 설계 상세

### 4.1 REST API 엔드포인트
```typescript
// 자재 관련 API
GET    /api/materials              # 자재 목록 조회
GET    /api/materials/[id]         # 특정 자재 조회
POST   /api/materials              # 자재 생성 (관리자)
PUT    /api/materials/[id]         # 자재 수정 (관리자)
DELETE /api/materials/[id]         # 자재 삭제 (관리자)

// 가격 관련 API
GET    /api/prices                 # 가격 데이터 조회
GET    /api/prices/history         # 가격 이력 조회
GET    /api/prices/latest          # 최신 가격 조회
POST   /api/prices                 # 가격 데이터 추가

// 카테고리 관련 API
GET    /api/categories             # 카테고리 목록 조회
GET    /api/categories/tree        # 카테고리 트리 조회
POST   /api/categories             # 카테고리 생성 (관리자)

// 차트 데이터 API
GET    /api/charts/dashboard       # 대시보드 차트 데이터
GET    /api/charts/material/[id]   # 특정 자재 차트 데이터
GET    /api/charts/category/[id]   # 카테고리별 차트 데이터

// 크롤링 관련 API
POST   /api/crawl/trigger          # 크롤링 수동 실행
GET    /api/crawl/status           # 크롤링 상태 조회
GET    /api/crawl/logs             # 크롤링 로그 조회
```

### 4.2 API 응답 형식
```typescript
// 표준 API 응답 형식
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 자재 데이터 타입
interface Material {
  id: number;
  name: string;
  code: string;
  specification?: string;
  unit: string;
  category: {
    id: number;
    name: string;
    code: string;
    level: number;
  };
  kpiItemCode?: string;
  manufacturer?: string;
  model?: string;
  description?: string;
  isActive: boolean;
  latestPrice?: {
    price: number;
    date: string;
    change: number;
    changePercent: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 가격 이력 데이터 타입
interface PriceHistory {
  id: number;
  materialId: number;
  price: number;
  priceDate: string;
  dataSource: string;
  currency: string;
  region: string;
  supplier?: string;
  notes?: string;
  createdAt: string;
}
```

## 5. TRAE AI 연동 개발 워크플로우

### 5.1 TRAE AI 설정 및 연동
```json
// .trae/config.json
{
  "project": {
    "name": "materials-dashboard",
    "type": "nextjs",
    "framework": "react",
    "language": "typescript"
  },
  "ai": {
    "codeGeneration": true,
    "autoCompletion": true,
    "debugging": true,
    "testing": true
  },
  "integrations": {
    "supabase": {
      "enabled": true,
      "projectUrl": "${NEXT_PUBLIC_SUPABASE_URL}",
      "anonKey": "${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
    },
    "vercel": {
      "enabled": true,
      "projectId": "${VERCEL_PROJECT_ID}"
    }
  },
  "rules": {
    "codeStyle": "typescript-strict",
    "componentStructure": "functional",
    "stateManagement": "react-hooks",
    "styling": "tailwind"
  }
}
```

### 5.2 TRAE AI 개발 가이드라인
```typescript
// TRAE AI 코드 생성 템플릿

// 1. 컴포넌트 생성 템플릿
// @trae-template: react-component
export interface ComponentProps {
  // Props 정의
}

export const ComponentName: React.FC<ComponentProps> = ({
  // Props destructuring
}) => {
  // State 및 hooks
  
  // Event handlers
  
  // Render
  return (
    <div className="">
      {/* JSX */}
    </div>
  );
};

// 2. API Route 생성 템플릿
// @trae-template: nextjs-api
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 로직 구현
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}

// 3. 데이터베이스 쿼리 템플릿
// @trae-template: supabase-query
export async function queryFunction(params: QueryParams) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('column', value);
    
  if (error) throw error;
  return data;
}
```

### 5.3 TRAE AI 자동화 스크립트
```bash
# .trae/scripts/setup.sh
#!/bin/bash

# 프로젝트 초기 설정
echo "Setting up Materials Dashboard with TRAE AI..."

# 의존성 설치
npm install

# Supabase 설정
echo "Setting up Supabase..."
npx supabase init
npx supabase start

# 환경 변수 설정
echo "Setting up environment variables..."
cp .env.example .env.local

# 데이터베이스 마이그레이션
echo "Running database migrations..."
npx supabase db reset

# 개발 서버 시작
echo "Starting development server..."
npm run dev

echo "Setup complete! TRAE AI is ready for development."
```

## 6. 성능 최적화 전략

### 6.1 프론트엔드 최적화
```typescript
// 1. 코드 스플리팅
const MaterialPriceChart = dynamic(() => import('@/components/charts/MaterialPriceChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

// 2. 메모이제이션
const MemoizedChart = React.memo(MaterialPriceChart);

// 3. 가상화 (대용량 데이터)
import { FixedSizeList as List } from 'react-window';

// 4. 이미지 최적화
import Image from 'next/image';

// 5. 폰트 최적화
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

### 6.2 백엔드 최적화
```typescript
// 1. 데이터베이스 쿼리 최적화
const optimizedQuery = supabase
  .from('materials')
  .select(`
    id,
    name,
    code,
    category:material_categories(name),
    latest_price:price_history(
      price,
      price_date
    )
  `)
  .order('price_date', { ascending: false })
  .limit(1);

// 2. 캐싱 전략
import { unstable_cache } from 'next/cache';

const getCachedMaterials = unstable_cache(
  async () => {
    return await getMaterials();
  },
  ['materials'],
  { revalidate: 3600 } // 1시간 캐시
);

// 3. 페이지네이션
const getPaginatedMaterials = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  
  return supabase
    .from('materials')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1);
};
```

## 7. 보안 고려사항

### 7.1 인증 및 권한 관리
```typescript
// Supabase Auth 설정
const supabase = createClient({
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 미들웨어에서 인증 확인
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient({ request });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // 관리자 페이지 보호
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session || !isAdmin(session.user)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return response;
}
```

### 7.2 데이터 검증
```typescript
// Zod를 사용한 데이터 검증
import { z } from 'zod';

const MaterialSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  specification: z.string().optional(),
  unit: z.string().min(1).max(20),
  categoryId: z.number().positive(),
  kpiItemCode: z.string().optional()
});

export function validateMaterial(data: unknown) {
  return MaterialSchema.parse(data);
}
```

## 8. 테스팅 전략

### 8.1 테스트 구조
```
__tests__/
├── components/
│   ├── charts/
│   │   └── MaterialPriceChart.test.tsx
│   └── layout/
│       └── Layout.test.tsx
├── pages/
│   ├── dashboard.test.tsx
│   └── materials.test.tsx
├── api/
│   ├── materials.test.ts
│   └── prices.test.ts
├── lib/
│   ├── database.test.ts
│   └── crawler.test.ts
└── e2e/
    ├── dashboard.spec.ts
    └── materials.spec.ts
```

### 8.2 테스트 설정
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ]
};

// Playwright E2E 테스트
import { test, expect } from '@playwright/test';

test('dashboard loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('자재 가격 동향');
});
```

이 개발 아키텍처 문서는 TRAE AI와의 연동을 고려하여 작성되었으며, 실제 개발 과정에서 지속적으로 업데이트될 예정입니다.
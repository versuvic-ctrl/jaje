# 자재 가격 동향 분석 시스템 - 배포 및 연동 가이드

## 1. 전체 배포 아키텍처

### 1.1 배포 환경 구성도
```
┌─────────────────────────────────────────────────────────────┐
│                    TRAE AI IDE                             │
│ • Live Coding & Development                                 │
│ • Real-time Code Generation                                 │
│ • Automated Testing & Debugging                            │
├─────────────────────────────────────────────────────────────┤
│                    Local Development                       │
│ • Next.js Dev Server (localhost:3000)                     │
│ • Supabase Local Instance                                  │
│ • Hot Reload & Live Preview                                │
├─────────────────────────────────────────────────────────────┤
│                    Version Control                         │
│ • Git Repository                                           │
│ • Branch Strategy (main/develop/feature)                  │
│ • Automated CI/CD Triggers                                │
├─────────────────────────────────────────────────────────────┤
│                    Vercel Platform                        │
│ • Production Deployment (materials-dashboard.vercel.app)  │
│ • Preview Deployments (PR별 자동 배포)                     │
│ • Edge Functions & API Routes                             │
│ • CDN & Global Distribution                               │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Cloud                         │
│ • PostgreSQL Database                                      │
│ • Real-time Subscriptions                                 │
│ • Authentication & Authorization                           │
│ • Row Level Security (RLS)                                │
├─────────────────────────────────────────────────────────────┤
│                    External Services                       │
│ • KPI 웹사이트 (데이터 소스)                                │
│ • Vercel Cron Jobs (자동 크롤링)                           │
│ • Email/SMS 알림 서비스                                    │
└─────────────────────────────────────────────────────────────┘
```

## 2. Supabase 설정 및 연동

### 2.1 Supabase 프로젝트 생성
```bash
# 1. Supabase CLI 설치
npm install -g supabase

# 2. Supabase 로그인
supabase login

# 3. 새 프로젝트 생성 (웹에서 생성 후)
supabase init

# 4. 로컬 개발 환경 시작
supabase start

# 5. 원격 프로젝트와 연결
supabase link --project-ref YOUR_PROJECT_REF
```

### 2.2 데이터베이스 스키마 설정
```sql
-- supabase/migrations/001_initial_schema.sql

-- 1. 자재 카테고리 테이블
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

-- 2. 자재 마스터 테이블
CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  specification TEXT,
  unit VARCHAR(20) NOT NULL,
  category_id INTEGER REFERENCES material_categories(id),
  kpi_item_code VARCHAR(50),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 가격 이력 테이블
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

-- 4. 크롤링 로그 테이블
CREATE TABLE crawling_logs (
  id SERIAL PRIMARY KEY,
  crawl_date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  total_items INTEGER DEFAULT 0,
  success_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'running',
  error_message TEXT,
  crawl_type VARCHAR(50) DEFAULT 'daily',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. RLS 정책 설정
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawling_logs ENABLE ROW LEVEL SECURITY;

-- 읽기 권한 (모든 사용자)
CREATE POLICY "Allow read access for all users" ON materials FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON price_history FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON material_categories FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON crawling_logs FOR SELECT USING (true);

-- 인덱스 생성
CREATE INDEX idx_materials_category ON materials(category_id);
CREATE INDEX idx_materials_active ON materials(is_active);
CREATE INDEX idx_price_history_material_date ON price_history(material_id, price_date DESC);
CREATE INDEX idx_price_history_date ON price_history(price_date DESC);
CREATE INDEX idx_crawling_logs_date ON crawling_logs(crawl_date DESC);
CREATE INDEX idx_categories_parent ON material_categories(parent_id);
```

### 2.3 Supabase 환경 변수 설정
```bash
# .env.local (로컬 개발용)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# .env.production (프로덕션용 - Vercel에서 설정)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### 2.4 Supabase 클라이언트 설정
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 클라이언트 사이드용
export const createClientSupabase = () => {
  return createClientComponentClient();
};

// 서버 사이드용
export const createServerSupabase = () => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
};

// 서비스 역할용 (관리자 작업)
export const createServiceSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// 타입 정의
export type Database = {
  public: {
    Tables: {
      materials: {
        Row: {
          id: number;
          name: string;
          code: string;
          specification: string | null;
          unit: string;
          category_id: number | null;
          kpi_item_code: string | null;
          manufacturer: string | null;
          model: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          code: string;
          specification?: string;
          unit: string;
          category_id?: number;
          kpi_item_code?: string;
          manufacturer?: string;
          model?: string;
          description?: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          code?: string;
          specification?: string;
          unit?: string;
          category_id?: number;
          kpi_item_code?: string;
          manufacturer?: string;
          model?: string;
          description?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      // 다른 테이블들도 동일하게 정의...
    };
  };
};
```

## 3. Vercel 배포 설정

### 3.1 Vercel 프로젝트 생성 및 연결
```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 초기화
vercel

# 4. 프로젝트 설정
# ? Set up and deploy "materials-dashboard"? [Y/n] y
# ? Which scope do you want to deploy to? [your-team]
# ? Link to existing project? [y/N] n
# ? What's your project's name? materials-dashboard
# ? In which directory is your code located? ./
```

### 3.2 Vercel 설정 파일
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["icn1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  },
  "functions": {
    "src/app/api/crawl/route.ts": {
      "maxDuration": 300
    }
  },
  "crons": [
    {
      "path": "/api/crawl/daily",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 3.3 Vercel 환경 변수 설정
```bash
# 프로덕션 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 미리보기 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview

# 개발 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
vercel env add SUPABASE_SERVICE_ROLE_KEY development
```

### 3.4 자동 배포 설정
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

## 4. TRAE AI 연동 설정

### 4.1 TRAE AI 프로젝트 설정
```json
// .trae/config.json
{
  "project": {
    "name": "materials-dashboard",
    "type": "nextjs",
    "framework": "react",
    "language": "typescript",
    "version": "1.0.0"
  },
  "development": {
    "port": 3000,
    "host": "localhost",
    "https": false,
    "autoReload": true
  },
  "ai": {
    "codeGeneration": {
      "enabled": true,
      "templates": [
        "react-component",
        "nextjs-api",
        "supabase-query",
        "chart-component"
      ]
    },
    "autoCompletion": {
      "enabled": true,
      "contextAware": true,
      "suggestions": true
    },
    "debugging": {
      "enabled": true,
      "errorAnalysis": true,
      "performanceMonitoring": true
    },
    "testing": {
      "enabled": true,
      "autoGenerate": true,
      "coverage": true
    }
  },
  "integrations": {
    "supabase": {
      "enabled": true,
      "projectUrl": "${NEXT_PUBLIC_SUPABASE_URL}",
      "anonKey": "${NEXT_PUBLIC_SUPABASE_ANON_KEY}",
      "features": [
        "database",
        "auth",
        "realtime",
        "storage"
      ]
    },
    "vercel": {
      "enabled": true,
      "projectId": "${VERCEL_PROJECT_ID}",
      "teamId": "${VERCEL_TEAM_ID}",
      "features": [
        "deployment",
        "preview",
        "analytics",
        "functions"
      ]
    },
    "git": {
      "enabled": true,
      "provider": "github",
      "repository": "your-username/materials-dashboard",
      "branch": "main"
    }
  },
  "rules": {
    "codeStyle": {
      "style": "typescript-strict",
      "prettier": true,
      "eslint": true
    },
    "componentStructure": {
      "type": "functional",
      "hooks": "react-hooks",
      "stateManagement": "zustand"
    },
    "styling": {
      "framework": "tailwind",
      "components": "shadcn/ui"
    },
    "database": {
      "orm": "supabase",
      "migrations": true,
      "seeds": true
    }
  },
  "workflows": {
    "development": [
      "code-generation",
      "auto-completion",
      "real-time-preview",
      "error-detection"
    ],
    "testing": [
      "unit-tests",
      "integration-tests",
      "e2e-tests",
      "coverage-report"
    ],
    "deployment": [
      "build-optimization",
      "preview-deployment",
      "production-deployment",
      "rollback-support"
    ]
  }
}
```

### 4.2 TRAE AI 개발 워크플로우
```typescript
// .trae/workflows/development.ts
export const developmentWorkflow = {
  // 1. 컴포넌트 생성 워크플로우
  createComponent: {
    steps: [
      'analyze-requirements',
      'generate-component-structure',
      'implement-logic',
      'add-styling',
      'generate-tests',
      'update-documentation'
    ],
    templates: {
      component: 'react-functional-component',
      test: 'jest-react-testing-library',
      story: 'storybook-component'
    }
  },
  
  // 2. API 개발 워크플로우
  createAPI: {
    steps: [
      'define-schema',
      'implement-route-handler',
      'add-validation',
      'implement-database-queries',
      'add-error-handling',
      'generate-api-tests'
    ],
    templates: {
      route: 'nextjs-api-route',
      validation: 'zod-schema',
      query: 'supabase-query'
    }
  },
  
  // 3. 데이터베이스 워크플로우
  updateDatabase: {
    steps: [
      'create-migration',
      'update-types',
      'update-queries',
      'run-tests',
      'deploy-migration'
    ],
    templates: {
      migration: 'supabase-migration',
      types: 'typescript-database-types'
    }
  }
};
```

### 4.3 TRAE AI 자동화 스크립트
```bash
#!/bin/bash
# .trae/scripts/deploy.sh

echo "🚀 Starting TRAE AI assisted deployment..."

# 1. 코드 품질 검사
echo "📋 Running code quality checks..."
npm run lint
npm run type-check

# 2. 테스트 실행
echo "🧪 Running tests..."
npm run test:unit
npm run test:integration

# 3. 빌드 테스트
echo "🔨 Testing build..."
npm run build

# 4. Supabase 마이그레이션 확인
echo "🗄️ Checking database migrations..."
supabase db diff

# 5. Vercel 배포
echo "☁️ Deploying to Vercel..."
vercel --prod

# 6. 배포 후 검증
echo "✅ Running post-deployment checks..."
npm run test:e2e:prod

echo "🎉 Deployment completed successfully!"
```

## 5. 크롤링 및 자동화 설정

### 5.1 KPI 웹 크롤링 구현
```typescript
// src/lib/crawler/kpi-crawler.ts
import puppeteer from 'puppeteer';
import { createServiceSupabase } from '@/lib/supabase';

export class KPICrawler {
  private supabase = createServiceSupabase();
  
  async crawlMaterialPrices() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // KPI 사이트 접속
      await page.goto('https://kpi-website.com/materials');
      
      // 로그인 (필요한 경우)
      await this.login(page);
      
      // 자재 목록 크롤링
      const materials = await this.crawlMaterials(page);
      
      // 데이터베이스 저장
      await this.savePriceData(materials);
      
      return {
        success: true,
        totalItems: materials.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Crawling error:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
  
  private async login(page: any) {
    // 로그인 로직 구현
    await page.type('#username', process.env.KPI_USERNAME!);
    await page.type('#password', process.env.KPI_PASSWORD!);
    await page.click('#login-button');
    await page.waitForNavigation();
  }
  
  private async crawlMaterials(page: any) {
    // 자재 데이터 크롤링 로직
    return await page.evaluate(() => {
      const materials = [];
      const rows = document.querySelectorAll('.material-row');
      
      rows.forEach(row => {
        const material = {
          code: row.querySelector('.code')?.textContent?.trim(),
          name: row.querySelector('.name')?.textContent?.trim(),
          price: parseFloat(row.querySelector('.price')?.textContent?.replace(/[^0-9.]/g, '') || '0'),
          unit: row.querySelector('.unit')?.textContent?.trim(),
          date: new Date().toISOString().split('T')[0]
        };
        materials.push(material);
      });
      
      return materials;
    });
  }
  
  private async savePriceData(materials: any[]) {
    for (const material of materials) {
      // 자재 존재 확인
      const { data: existingMaterial } = await this.supabase
        .from('materials')
        .select('id')
        .eq('kpi_item_code', material.code)
        .single();
      
      if (existingMaterial) {
        // 가격 이력 저장
        await this.supabase
          .from('price_history')
          .upsert({
            material_id: existingMaterial.id,
            price: material.price,
            price_date: material.date,
            data_source: 'KPI'
          });
      }
    }
  }
}
```

### 5.2 Vercel Cron Jobs 설정
```typescript
// src/app/api/crawl/daily/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { KPICrawler } from '@/lib/crawler/kpi-crawler';
import { createServiceSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // Vercel Cron Secret 검증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createServiceSupabase();
  const crawler = new KPICrawler();
  
  try {
    // 크롤링 로그 시작
    const { data: logEntry } = await supabase
      .from('crawling_logs')
      .insert({
        crawl_date: new Date().toISOString().split('T')[0],
        start_time: new Date().toISOString(),
        status: 'running',
        crawl_type: 'daily'
      })
      .select()
      .single();
    
    // 크롤링 실행
    const result = await crawler.crawlMaterialPrices();
    
    // 크롤링 로그 완료
    await supabase
      .from('crawling_logs')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed',
        success_items: result.totalItems,
        total_items: result.totalItems
      })
      .eq('id', logEntry.id);
    
    return NextResponse.json({
      success: true,
      message: 'Daily crawling completed',
      data: result
    });
  } catch (error) {
    // 에러 로그 저장
    console.error('Daily crawling failed:', error);
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## 6. 모니터링 및 알림 설정

### 6.1 Vercel Analytics 연동
```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 6.2 에러 모니터링
```typescript
// src/lib/monitoring.ts
import { createServiceSupabase } from '@/lib/supabase';

export class ErrorMonitoring {
  private supabase = createServiceSupabase();
  
  async logError(error: Error, context: any) {
    try {
      await this.supabase
        .from('error_logs')
        .insert({
          error_message: error.message,
          error_stack: error.stack,
          context: JSON.stringify(context),
          timestamp: new Date().toISOString(),
          user_agent: context.userAgent,
          url: context.url
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
  
  async sendAlert(message: string, severity: 'low' | 'medium' | 'high') {
    // 이메일/슬랙 알림 발송
    if (severity === 'high') {
      // 즉시 알림
      await this.sendImmediateAlert(message);
    }
  }
  
  private async sendImmediateAlert(message: string) {
    // 실제 알림 서비스 연동 (예: SendGrid, Slack)
  }
}
```

## 7. 성능 최적화 및 보안

### 7.1 Vercel Edge Functions
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  // 인증 확인
  const { data: { session } } = await supabase.auth.getSession();
  
  // 관리자 페이지 보호
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // API 요청 제한
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || 'unknown';
    const rateLimit = await checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
};
```

### 7.2 환경별 설정 관리
```typescript
// src/lib/config.ts
interface Config {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'preview' | 'production';
  };
  features: {
    crawling: boolean;
    analytics: boolean;
    monitoring: boolean;
  };
}

export const config: Config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  app: {
    name: 'Materials Dashboard',
    version: process.env.npm_package_version || '1.0.0',
    environment: (process.env.VERCEL_ENV as any) || 'development'
  },
  features: {
    crawling: process.env.NODE_ENV === 'production',
    analytics: process.env.NODE_ENV === 'production',
    monitoring: true
  }
};
```

## 8. 배포 체크리스트

### 8.1 배포 전 확인사항
- [ ] 모든 환경 변수 설정 완료
- [ ] Supabase 마이그레이션 적용
- [ ] 테스트 통과 확인
- [ ] 빌드 에러 없음
- [ ] 보안 설정 확인
- [ ] 성능 최적화 적용
- [ ] 모니터링 설정 완료

### 8.2 배포 후 확인사항
- [ ] 사이트 정상 접속 확인
- [ ] 데이터베이스 연결 확인
- [ ] API 엔드포인트 동작 확인
- [ ] 크롤링 기능 테스트
- [ ] 차트 및 시각화 확인
- [ ] 모바일 반응형 확인
- [ ] 성능 지표 모니터링

이 배포 가이드를 통해 TRAE AI, Vercel, Supabase가 완전히 연동된 자재 가격 동향 분석 시스템을 성공적으로 배포할 수 있습니다.
'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { Calculator, Wrench, BarChart3, Settings, TrendingUp, DollarSign, Package, AlertTriangle, Database, BookOpen, Layers, Calendar, Filter } from 'lucide-react';
import MaterialPriceChart from '@/components/charts/MaterialPriceChart';
import { materialPriceData, yearlyMaterialData } from '@/data/materialPriceData';

// 가격 변동률 계산 함수
const calculatePriceChange = (previousPrice: number, currentPrice: number) => {
  if (previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// 샘플 자재 가격 데이터
const materialPrices = [
  { name: 'Carbon Steel Pipe', price: 1250, change: 5.2, category: 'Pipe' },
  { name: 'Stainless Steel 316L', price: 3800, change: -2.1, category: 'Pipe' },
  { name: 'Gate Valve 6"', price: 850, change: 1.8, category: 'Valve' },
  { name: 'Ball Valve 4"', price: 420, change: 3.5, category: 'Valve' },
  { name: 'Flange ANSI 150#', price: 180, change: -0.8, category: 'Fitting' },
  { name: 'Elbow 90° 8"', price: 95, change: 2.3, category: 'Fitting' }
];

const priceAlerts = [
  { material: 'Stainless Steel 316L', type: 'price_drop', message: '가격 2.1% 하락' },
  { material: 'Carbon Steel Pipe', type: 'price_rise', message: '가격 5.2% 상승' },
  { material: 'Ball Valve 4"', type: 'stock_low', message: '재고 부족 경고' }
];

export default function Dashboard() {
  const [chartMode, setChartMode] = useState<'monthly' | 'yearly'>('monthly');
  
  // 현재 표시할 데이터 선택
  const currentData = chartMode === 'monthly' ? materialPriceData : yearlyMaterialData;

  return (
    <Layout title="자재 가격 대시보드">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <p className="text-lg text-gray-600">
          실시간 자재 가격 정보와 시장 동향을 확인하고 관리하세요.
        </p>
      </div>

      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 자재 품목</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 가격 변동</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+2.4%</div>
            <p className="text-xs text-muted-foreground">
              지난 주 대비
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 예상 비용</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩2.8M</div>
            <p className="text-xs text-muted-foreground">
              현재 프로젝트 기준
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">가격 알림</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{priceAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              확인 필요
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 자재 가격 차트 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>자재 가격 동향</CardTitle>
              <CardDescription>
                주요 자재의 가격 변동 추이를 확인하세요.
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={chartMode === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartMode('monthly')}
              >
                <Calendar className="h-4 w-4 mr-1" />
                월별
              </Button>
              <Button
                variant={chartMode === 'yearly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartMode('yearly')}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                연별
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MaterialPriceChart data={currentData} />
        </CardContent>
      </Card>

      {/* 6개 자재 개별 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(currentData[0] || {}).filter(([key]) => key !== 'period').map(([materialKey, _]) => {
           const materialNames: { [key: string]: string } = {
             steel: '철강',
             stainlessSteel: '스테인리스강',
             carbonSteel: '탄소강',
             copper: '구리',
             aluminum: '알루미늄',
             pvc: 'PVC'
           };
           const materialName = materialNames[materialKey] || materialKey;
           const latestData = currentData[currentData.length - 1];
           const previousData = currentData[currentData.length - 2];
           const currentPrice = latestData?.[materialKey as keyof typeof latestData] as number || 0;
           const previousPrice = previousData?.[materialKey as keyof typeof previousData] as number || 0;
           const priceChange = calculatePriceChange(previousPrice, currentPrice);
          
          return (
            <Card key={materialKey}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{materialName}</CardTitle>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">₩{currentPrice.toLocaleString()}</div>
                  <Badge variant={priceChange >= 0 ? 'default' : 'destructive'}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-20">
                  <MaterialPriceChart 
                    data={currentData} 
                    materialKey={materialKey}
                    compact={true}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 최근 자재 가격 동향 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 자재 가격 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 자재 가격</CardTitle>
            <CardDescription>
              주요 자재의 최신 가격 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {materialPrices.map((material, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{material.name}</div>
                    <div className="text-sm text-gray-500">{material.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₩{material.price.toLocaleString()}</div>
                    <div className={`text-sm ${
                      material.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {material.change > 0 ? '+' : ''}{material.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/materials">
                <Button className="w-full" variant="outline">
                  전체 자재 가격 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 가격 알림 */}
        <Card>
          <CardHeader>
            <CardTitle>가격 알림</CardTitle>
            <CardDescription>
              중요한 가격 변동 및 재고 알림입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priceAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.type === 'price_rise' ? 'text-red-500' :
                    alert.type === 'price_drop' ? 'text-green-500' : 'text-orange-500'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">{alert.material}</div>
                    <div className="text-sm text-gray-600">{alert.message}</div>
                  </div>
                  <Badge variant={alert.type === 'stock_low' ? 'destructive' : 'secondary'}>
                    {alert.type === 'price_rise' ? '상승' :
                     alert.type === 'price_drop' ? '하락' : '재고부족'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 주요 기능 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 자재 가격 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <CardTitle>자재 가격</CardTitle>
            </div>
            <CardDescription>
              실시간 자재 가격 정보를 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/materials">
              <Button className="w-full">
                가격 보기
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 엔지니어링 계산기 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calculator className="h-6 w-6 text-orange-600" />
              <CardTitle>계산기</CardTitle>
            </div>
            <CardDescription>
              엔지니어링 계산 도구를 사용하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/calculator">
              <Button className="w-full" variant="outline">
                계산기 열기
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* ISO 배관 에디터 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Wrench className="h-6 w-6 text-purple-600" />
              <CardTitle>ISO 에디터</CardTitle>
            </div>
            <CardDescription>
              ISO 배관 도면을 설계하고 편집하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/iso-piping-editor">
              <Button className="w-full" variant="outline">
                에디터 열기
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 설정 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-gray-600" />
              <CardTitle>설정</CardTitle>
            </div>
            <CardDescription>
              시스템 설정을 관리하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button className="w-full" variant="secondary">
                설정 열기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 시작 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 시작 가이드</CardTitle>
          <CardDescription>
            Materials Dashboard를 효과적으로 사용하는 방법을 알아보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">엔지니어링 계산기</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 탱크 용량 계산 및 3D 시각화</li>
                <li>• NPSH 계산으로 펌프 성능 분석</li>
                <li>• 펌프 상사법칙 적용</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">ISO 배관 에디터</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 드래그 앤 드롭으로 배관 설계</li>
                <li>• 다양한 피팅 및 밸브 라이브러리</li>
                <li>• BOM 자동 생성 및 내보내기</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

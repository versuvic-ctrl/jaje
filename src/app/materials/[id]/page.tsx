'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Heart, 
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Package,
  FileText
} from 'lucide-react';
import Link from 'next/link';

// 샘플 자재 상세 데이터
const materialDetails = {
  1: {
    id: 1,
    name: 'A106 Gr.B 파이프',
    category: '파이프',
    specification: 'ASTM A106 Grade B',
    size: '6" SCH 40',
    price: 125000,
    unit: 'm',
    change: 2.5,
    supplier: '한국철강',
    lastUpdated: '2024-01-15',
    stock: 'In Stock',
    description: 'ASTM A106 Grade B 탄소강 파이프는 고온 서비스용으로 설계된 이음매 없는 탄소강 파이프입니다.',
    technicalSpecs: {
      material: 'Carbon Steel',
      grade: 'Grade B',
      standard: 'ASTM A106',
      diameter: '6 inch (152.4mm)',
      schedule: 'SCH 40',
      wallThickness: '7.11mm',
      weight: '28.26 kg/m',
      maxTemp: '427°C',
      maxPressure: '150 PSI'
    },
    priceHistory: [
      { date: '2024-01-01', price: 120000 },
      { date: '2024-01-05', price: 122000 },
      { date: '2024-01-10', price: 123000 },
      { date: '2024-01-15', price: 125000 }
    ],
    suppliers: [
      { name: '한국철강', price: 125000, leadTime: '7일', rating: 4.8 },
      { name: '동양파이프', price: 127000, leadTime: '5일', rating: 4.6 },
      { name: '대한철강', price: 123000, leadTime: '10일', rating: 4.7 }
    ],
    certifications: ['KS D 3507', 'ASTM A106', 'API 5L', 'ISO 9001'],
    applications: ['석유화학 플랜트', '발전소', '보일러 배관', '고온 배관 시스템']
  }
};

export default function MaterialDetailPage() {
  const params = useParams();
  const materialId = params.id as string;
  const material = materialDetails[parseInt(materialId)] || materialDetails[1];
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Layout title={`${material.name} - 자재 상세`}>
      <div className="space-y-6">
        {/* 뒤로가기 및 헤더 */}
        <div className="flex items-center gap-4">
          <Link href="/materials">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              목록으로
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{material.name}</h1>
            <p className="text-gray-600 mt-1">{material.specification}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 주요 정보 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 현재 가격 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">현재 가격</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">₩{material.price.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  {material.change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    material.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {material.change > 0 ? '+' : ''}{material.change}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">per {material.unit}</p>
            </CardContent>
          </Card>

          {/* 재고 상태 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">재고 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {material.stock === 'In Stock' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <Badge variant={material.stock === 'In Stock' ? 'default' : 'destructive'}>
                  {material.stock === 'In Stock' ? '재고있음' : '재고부족'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-2">최종 업데이트: {material.lastUpdated}</p>
            </CardContent>
          </Card>

          {/* 주요 공급업체 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">주요 공급업체</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{material.supplier}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">평점: 4.8/5.0</p>
            </CardContent>
          </Card>

          {/* 리드타임 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">리드타임</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="font-medium">7일</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">평균 배송 기간</p>
            </CardContent>
          </Card>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="specs">기술사양</TabsTrigger>
            <TabsTrigger value="pricing">가격정보</TabsTrigger>
            <TabsTrigger value="suppliers">공급업체</TabsTrigger>
            <TabsTrigger value="docs">문서</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 제품 설명 */}
              <Card>
                <CardHeader>
                  <CardTitle>제품 설명</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{material.description}</p>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">주요 적용 분야</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {material.applications.map((app, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{app}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 인증 및 표준 */}
              <Card>
                <CardHeader>
                  <CardTitle>인증 및 표준</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {material.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="justify-center py-2">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">품질 보증</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 제조업체 품질보증서 제공</li>
                      <li>• 재료시험성적서(MTR) 제공</li>
                      <li>• 제3자 검사 가능</li>
                      <li>• 1년 품질보증</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 기술사양 탭 */}
          <TabsContent value="specs">
            <Card>
              <CardHeader>
                <CardTitle>기술 사양</CardTitle>
                <CardDescription>
                  {material.name}의 상세 기술 사양입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(material.technicalSpecs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium text-gray-700">
                        {key === 'material' ? '재질' :
                         key === 'grade' ? '등급' :
                         key === 'standard' ? '표준' :
                         key === 'diameter' ? '직경' :
                         key === 'schedule' ? '스케줄' :
                         key === 'wallThickness' ? '벽두께' :
                         key === 'weight' ? '중량' :
                         key === 'maxTemp' ? '최대온도' :
                         key === 'maxPressure' ? '최대압력' : key}
                      </span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 가격정보 탭 */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>가격 히스토리</CardTitle>
                <CardDescription>
                  최근 가격 변동 추이를 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {material.priceHistory.map((history, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-gray-600">{history.date}</span>
                      <span className="font-semibold">₩{history.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 공급업체 탭 */}
          <TabsContent value="suppliers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {material.suppliers.map((supplier, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <CardDescription>평점: {supplier.rating}/5.0</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">가격:</span>
                        <span className="font-semibold">₩{supplier.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">리드타임:</span>
                        <span>{supplier.leadTime}</span>
                      </div>
                      <Button className="w-full" size="sm">
                        견적 요청
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 문서 탭 */}
          <TabsContent value="docs">
            <Card>
              <CardHeader>
                <CardTitle>관련 문서</CardTitle>
                <CardDescription>
                  제품 관련 문서를 다운로드하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: '제품 카탈로그', type: 'PDF', size: '2.3MB' },
                    { name: '기술 데이터시트', type: 'PDF', size: '1.8MB' },
                    { name: '설치 가이드', type: 'PDF', size: '3.1MB' },
                    { name: '품질보증서', type: 'PDF', size: '0.9MB' }
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-gray-500">{doc.type} • {doc.size}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 액션 버튼 */}
        <div className="flex gap-4">
          <Button className="flex-1">
            견적 요청
          </Button>
          <Button variant="outline" className="flex-1">
            장바구니 추가
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
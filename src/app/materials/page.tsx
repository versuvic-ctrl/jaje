'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, TrendingUp, TrendingDown, Filter, Download } from 'lucide-react';

// 샘플 자재 데이터
const materialsData = [
  {
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
    stock: 'In Stock'
  },
  {
    id: 2,
    name: 'A105 플랜지',
    category: '플랜지',
    specification: 'ASTM A105',
    size: '6" 150LB RF',
    price: 85000,
    unit: 'ea',
    change: -1.2,
    supplier: '대한밸브',
    lastUpdated: '2024-01-15',
    stock: 'Low Stock'
  },
  {
    id: 3,
    name: 'A234 WPB 엘보',
    category: '피팅',
    specification: 'ASTM A234 WPB',
    size: '6" 90° LR',
    price: 45000,
    unit: 'ea',
    change: 0.8,
    supplier: '동양피팅',
    lastUpdated: '2024-01-15',
    stock: 'In Stock'
  },
  {
    id: 4,
    name: 'A216 WCB 게이트밸브',
    category: '밸브',
    specification: 'ASTM A216 WCB',
    size: '6" 150LB',
    price: 320000,
    unit: 'ea',
    change: 3.2,
    supplier: '한국밸브',
    lastUpdated: '2024-01-15',
    stock: 'In Stock'
  },
  {
    id: 5,
    name: 'A53 Gr.B 파이프',
    category: '파이프',
    specification: 'ASTM A53 Grade B',
    size: '4" SCH 40',
    price: 95000,
    unit: 'm',
    change: -0.5,
    supplier: '한국철강',
    lastUpdated: '2024-01-15',
    stock: 'In Stock'
  },
  {
    id: 6,
    name: 'A182 F316L 플랜지',
    category: '플랜지',
    specification: 'ASTM A182 F316L',
    size: '4" 150LB RF',
    price: 150000,
    unit: 'ea',
    change: 1.8,
    supplier: '스테인리스코리아',
    lastUpdated: '2024-01-15',
    stock: 'In Stock'
  }
];

const categories = ['전체', '파이프', '플랜지', '피팅', '밸브'];

export default function MaterialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('name');

  const filteredMaterials = materialsData
    .filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.specification.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '전체' || material.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'change':
          return Math.abs(b.change) - Math.abs(a.change);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <Layout title="자재 가격 관리">
      <div className="space-y-6">
        {/* 헤더 섹션 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">자재 가격 관리</h1>
            <p className="text-gray-600 mt-2">
              ASME 표준 자재의 실시간 가격 정보를 확인하고 관리하세요.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            가격표 다운로드
          </Button>
        </div>

        {/* 필터 및 검색 섹션 */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 검색 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="자재명 또는 규격 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 카테고리 필터 */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 정렬 */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">이름순</SelectItem>
                  <SelectItem value="price">가격순</SelectItem>
                  <SelectItem value="change">변동률순</SelectItem>
                </SelectContent>
              </Select>

              {/* 필터 버튼 */}
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                고급 필터
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 자재 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {material.specification}
                    </CardDescription>
                  </div>
                  <Badge variant={material.stock === 'In Stock' ? 'default' : 'destructive'}>
                    {material.stock === 'In Stock' ? '재고있음' : '재고부족'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* 가격 정보 */}
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      ₩{material.price.toLocaleString()}
                    </span>
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

                  {/* 상세 정보 */}
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">규격:</span> {material.size}
                    </div>
                    <div>
                      <span className="font-medium">단위:</span> {material.unit}
                    </div>
                    <div>
                      <span className="font-medium">공급업체:</span> {material.supplier}
                    </div>
                    <div>
                      <span className="font-medium">업데이트:</span> {material.lastUpdated}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      상세보기
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      견적요청
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 결과 없음 메시지 */}
        {filteredMaterials.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">검색 조건에 맞는 자재가 없습니다.</p>
              <p className="text-gray-400 mt-2">다른 검색어나 필터를 시도해보세요.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
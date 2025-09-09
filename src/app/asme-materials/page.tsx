'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  BookOpen, 
  FileText, 
  Database,
  Wrench,
  Settings,
  Thermometer,
  Gauge
} from 'lucide-react';

// ASME 표준 데이터
const asmeStandards = {
  pipes: [
    {
      id: 'A106',
      title: 'ASTM A106',
      description: '고온 서비스용 이음매 없는 탄소강 파이프',
      grades: ['Grade A', 'Grade B', 'Grade C'],
      tempRange: '-29°C ~ 427°C',
      applications: ['보일러', '과열기', '열교환기', '고온 배관'],
      sizes: ['1/8" ~ 26"'],
      schedules: ['SCH 40', 'SCH 80', 'SCH 160', 'XXS']
    },
    {
      id: 'A53',
      title: 'ASTM A53',
      description: '일반 용도 탄소강 파이프',
      grades: ['Grade A', 'Grade B'],
      tempRange: '-29°C ~ 427°C',
      applications: ['일반 배관', '구조용', '소방 배관', '스프링클러'],
      sizes: ['1/8" ~ 26"'],
      schedules: ['SCH 40', 'SCH 80']
    },
    {
      id: 'A312',
      title: 'ASTM A312',
      description: '이음매 없는 및 용접 오스테나이트 스테인리스강 파이프',
      grades: ['TP304', 'TP304L', 'TP316', 'TP316L', 'TP321', 'TP347'],
      tempRange: '-196°C ~ 816°C',
      applications: ['화학공정', '식품산업', '제약', '해양'],
      sizes: ['1/8" ~ 30"'],
      schedules: ['SCH 5S', 'SCH 10S', 'SCH 40S', 'SCH 80S']
    }
  ],
  fittings: [
    {
      id: 'A234',
      title: 'ASTM A234',
      description: '중간 및 고온 서비스용 단조 탄소강 및 합금강 파이프 피팅',
      grades: ['WPB', 'WPC', 'WP1', 'WP11', 'WP22'],
      tempRange: '-29°C ~ 427°C',
      applications: ['석유화학', '발전소', '정유', '가스처리'],
      types: ['엘보', '티', '리듀서', '캡']
    },
    {
      id: 'A403',
      title: 'ASTM A403',
      description: '단조 오스테나이트 스테인리스강 파이프 피팅',
      grades: ['WP304', 'WP304L', 'WP316', 'WP316L', 'WP321', 'WP347'],
      tempRange: '-196°C ~ 816°C',
      applications: ['화학공정', '식품산업', '제약', '해양'],
      types: ['엘보', '티', '리듀서', '캡', '스텁엔드']
    }
  ],
  flanges: [
    {
      id: 'A105',
      title: 'ASTM A105',
      description: '배관용 탄소강 단조품',
      grades: ['Standard Grade'],
      tempRange: '-29°C ~ 427°C',
      applications: ['일반 배관', '석유화학', '발전소'],
      types: ['Slip-on', 'Weld Neck', 'Blind', 'Socket Weld', 'Threaded']
    },
    {
      id: 'A182',
      title: 'ASTM A182',
      description: '고온 서비스용 단조 또는 압연 합금강 및 스테인리스강 파이프 플랜지',
      grades: ['F1', 'F5', 'F9', 'F11', 'F22', 'F304', 'F316', 'F321', 'F347'],
      tempRange: '-196°C ~ 816°C',
      applications: ['고온/고압 배관', '화학공정', '석유화학'],
      types: ['Weld Neck', 'Slip-on', 'Blind', 'Socket Weld']
    }
  ],
  valves: [
    {
      id: 'A216',
      title: 'ASTM A216',
      description: '고온 서비스용 탄소강 주조품',
      grades: ['WCA', 'WCB', 'WCC'],
      tempRange: '-29°C ~ 427°C',
      applications: ['게이트밸브', '글로브밸브', '체크밸브', '볼밸브'],
      types: ['Gate', 'Globe', 'Check', 'Ball']
    },
    {
      id: 'A351',
      title: 'ASTM A351',
      description: '압력 함유 부품용 오스테나이트 스테인리스강 주조품',
      grades: ['CF8', 'CF8M', 'CF3', 'CF3M', 'CF8C'],
      tempRange: '-196°C ~ 816°C',
      applications: ['화학공정 밸브', '해양용 밸브', '식품산업'],
      types: ['Gate', 'Globe', 'Check', 'Ball', 'Butterfly']
    }
  ]
};

const pressureClasses = [
  { class: '150', pressure: '1.4 MPa', temp: '260°C' },
  { class: '300', pressure: '2.8 MPa', temp: '427°C' },
  { class: '600', pressure: '5.5 MPa', temp: '427°C' },
  { class: '900', pressure: '8.3 MPa', temp: '427°C' },
  { class: '1500', pressure: '13.8 MPa', temp: '427°C' },
  { class: '2500', pressure: '23.0 MPa', temp: '427°C' }
];

export default function ASMEMaterialsPage() {
  const [activeTab, setActiveTab] = useState('pipes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('전체');

  const getCurrentData = () => {
    return asmeStandards[activeTab] || [];
  };

  const filteredData = (getCurrentData() || []).filter(item => {
    const matchesSearch = item?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === '전체' || 
                        (item?.grades || []).some(grade => grade.includes(selectedGrade));
    return matchesSearch && matchesGrade;
  });

  return (
    <Layout title="ASME 자재 데이터">
      <div className="space-y-6">
        {/* 헤더 섹션 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ASME 자재 데이터</h1>
            <p className="text-gray-600 mt-2">
              ASME/ASTM 표준에 따른 자재 사양 및 기술 데이터를 확인하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              표준 다운로드
            </Button>
            <Button className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              코드북 보기
            </Button>
          </div>
        </div>

        {/* 압력 등급 참조표 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              ASME B16.5 압력 등급 참조표
            </CardTitle>
            <CardDescription>
              플랜지 및 피팅의 압력-온도 등급 기준입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {pressureClasses.map((item, index) => (
                <div key={index} className="text-center p-3 border rounded-lg">
                  <div className="font-bold text-lg text-blue-600">Class {item.class}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>{item.pressure}</div>
                    <div>{item.temp}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="표준명 또는 설명 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="등급 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 등급</SelectItem>
                  <SelectItem value="Grade A">Grade A</SelectItem>
                  <SelectItem value="Grade B">Grade B</SelectItem>
                  <SelectItem value="Grade C">Grade C</SelectItem>
                  <SelectItem value="304">304 Series</SelectItem>
                  <SelectItem value="316">316 Series</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                고급 필터
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 자재 카테고리 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pipes" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              파이프
            </TabsTrigger>
            <TabsTrigger value="fittings" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              피팅
            </TabsTrigger>
            <TabsTrigger value="flanges" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              플랜지
            </TabsTrigger>
            <TabsTrigger value="valves" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              밸브
            </TabsTrigger>
          </TabsList>

          {/* 파이프 탭 */}
          <TabsContent value="pipes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(filteredData || []).map((standard, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{standard.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {standard.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{standard.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 등급 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">등급</h4>
                        <div className="flex flex-wrap gap-2">
                          {(standard?.grades || []).map((grade, idx) => (
                            <Badge key={idx} variant="secondary">{grade}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* 온도 범위 */}
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">온도 범위:</span>
                        <span className="text-sm">{standard.tempRange}</span>
                      </div>

                      {/* 크기 범위 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">크기 범위</h4>
                        <div className="flex flex-wrap gap-2">
                          {(standard?.sizes || []).map((size, idx) => (
                            <Badge key={idx} variant="outline">{size}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* 스케줄 */}
                      {standard.schedules && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">스케줄</h4>
                          <div className="flex flex-wrap gap-2">
                            {(standard?.schedules || []).map((schedule, idx) => (
                              <Badge key={idx} variant="outline">{schedule}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 적용 분야 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">주요 적용 분야</h4>
                        <div className="text-sm text-gray-600">
                          {(standard?.applications || []).join(', ')}
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          상세 보기
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 피팅 탭 */}
          <TabsContent value="fittings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(filteredData || []).map((standard, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{standard.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {standard.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{standard.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 등급 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">등급</h4>
                        <div className="flex flex-wrap gap-2">
                          {(standard?.grades || []).map((grade, idx) => (
                            <Badge key={idx} variant="secondary">{grade}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* 온도 범위 */}
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">온도 범위:</span>
                        <span className="text-sm">{standard.tempRange}</span>
                      </div>

                      {/* 타입 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">피팅 타입</h4>
                        <div className="flex flex-wrap gap-2">
                          {(standard?.types || []).map((type, idx) => (
                            <Badge key={idx} variant="outline">{type}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* 적용 분야 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">주요 적용 분야</h4>
                        <div className="text-sm text-gray-600">
                          {(standard?.applications || []).join(', ')}
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          상세 보기
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 플랜지 탭 */}
          <TabsContent value="flanges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(filteredData || []).map((standard, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{standard.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {standard.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{standard.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 등급 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">등급</h4>
                        <div className="flex flex-wrap gap-2">
                          {(standard?.grades || []).map((grade, idx) => (
                            <Badge key={idx} variant="secondary">{grade}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* 온도 범위 */}
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">온도 범위:</span>
                        <span className="text-sm">{standard.tempRange}</span>
                      </div>

                      {/* 타입 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">플랜지 타입</h4>
                        <div className="flex flex-wrap gap-2">
                          {(standard?.types || []).map((type, idx) => (
                            <Badge key={idx} variant="outline">{type}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* 적용 분야 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">주요 적용 분야</h4>
                        <div className="text-sm text-gray-600">
                          {standard.applications.join(', ')}
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          상세 보기
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 밸브 탭 */}
          <TabsContent value="valves" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(filteredData || []).map((standard, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{standard.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {standard.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{standard.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 등급 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">등급</h4>
                        <div className="flex flex-wrap gap-2">
                          {(standard?.grades || []).map((grade, idx) => (
                            <Badge key={idx} variant="secondary">{grade}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* 온도 범위 */}
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">온도 범위:</span>
                        <span className="text-sm">{standard.tempRange}</span>
                      </div>

                      {/* 타입 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">밸브 타입</h4>
                        <div className="flex flex-wrap gap-2">
                          {(standard?.types || []).map((type, idx) => (
                            <Badge key={idx} variant="outline">{type}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* 적용 분야 */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">주요 적용 분야</h4>
                        <div className="text-sm text-gray-600">
                          {standard.applications.join(', ')}
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          상세 보기
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* 결과 없음 메시지 */}
        {filteredData.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">검색 조건에 맞는 표준이 없습니다.</p>
              <p className="text-gray-400 mt-2">다른 검색어나 필터를 시도해보세요.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
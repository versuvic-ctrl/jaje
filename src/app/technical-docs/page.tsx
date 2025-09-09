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
  Video,
  ExternalLink,
  Calendar,
  User,
  Tag,
  Clock,
  Eye,
  Star,
  Calculator,
  Upload
} from 'lucide-react';

// 기술 자료 데이터
const technicalDocs = {
  standards: [
    {
      id: 'asme-b31-3',
      title: 'ASME B31.3 - 공정 배관 설계 기준',
      description: '화학공정, 석유정제, 관련 산업의 배관 시스템 설계, 제작, 검사, 시험에 대한 요구사항',
      category: '설계 기준',
      type: 'PDF',
      size: '15.2 MB',
      pages: 342,
      lastUpdated: '2023-12-15',
      downloads: 1250,
      rating: 4.8,
      tags: ['배관설계', 'ASME', '공정배관', '압력용기'],
      author: 'ASME International',
      language: '한국어/영어'
    },
    {
      id: 'asme-b16-5',
      title: 'ASME B16.5 - 파이프 플랜지 및 플랜지 피팅',
      description: '강관 플랜지, 플랜지 피팅, 개스킷 및 볼트의 치수, 공차, 표시, 시험에 대한 표준',
      category: '설계 기준',
      type: 'PDF',
      size: '8.7 MB',
      pages: 156,
      lastUpdated: '2023-11-20',
      downloads: 980,
      rating: 4.7,
      tags: ['플랜지', 'ASME', '치수', '표준'],
      author: 'ASME International',
      language: '한국어/영어'
    },
    {
      id: 'api-650',
      title: 'API 650 - 용접 강제 저장탱크',
      description: '대기압 및 저압 저장탱크의 설계, 제작, 검사에 대한 API 표준',
      category: '설계 기준',
      type: 'PDF',
      size: '22.1 MB',
      pages: 487,
      lastUpdated: '2023-10-05',
      downloads: 756,
      rating: 4.6,
      tags: ['저장탱크', 'API', '용접', '검사'],
      author: 'American Petroleum Institute',
      language: '영어'
    }
  ],
  guides: [
    {
      id: 'piping-design-guide',
      title: '배관 시스템 설계 가이드',
      description: '산업 배관 시스템의 기본 설계 원리부터 고급 설계 기법까지 포괄적으로 다룬 실무 가이드',
      category: '설계 가이드',
      type: 'PDF',
      size: '12.5 MB',
      pages: 285,
      lastUpdated: '2024-01-10',
      downloads: 2150,
      rating: 4.9,
      tags: ['배관설계', '실무가이드', '설계원리', '배관시스템'],
      author: '한국배관기술협회',
      language: '한국어'
    },
    {
      id: 'material-selection',
      title: '화학공정 자재 선정 가이드',
      description: '화학공정에서 사용되는 배관, 밸브, 펌프 등의 자재 선정 기준 및 방법론',
      category: '설계 가이드',
      type: 'PDF',
      size: '9.8 MB',
      pages: 198,
      lastUpdated: '2023-12-28',
      downloads: 1680,
      rating: 4.7,
      tags: ['자재선정', '화학공정', '내식성', '자재특성'],
      author: '화학공학회',
      language: '한국어'
    },
    {
      id: 'welding-procedures',
      title: '배관 용접 절차서 작성 가이드',
      description: '배관 용접 절차서(WPS) 작성 방법 및 용접 품질 관리 기준',
      category: '시공 가이드',
      type: 'PDF',
      size: '7.3 MB',
      pages: 142,
      lastUpdated: '2023-11-15',
      downloads: 1420,
      rating: 4.8,
      tags: ['용접', 'WPS', '품질관리', '시공'],
      author: '대한용접접합학회',
      language: '한국어'
    }
  ],
  videos: [
    {
      id: 'piping-basics',
      title: '배관 기초 이론 강의',
      description: '배관 엔지니어링의 기본 개념과 원리를 쉽게 설명한 교육 영상',
      category: '교육 영상',
      type: 'Video',
      duration: '2시간 15분',
      episodes: 8,
      lastUpdated: '2024-01-05',
      views: 15420,
      rating: 4.6,
      tags: ['배관기초', '교육', '이론', '엔지니어링'],
      author: '배관기술연구소',
      language: '한국어'
    },
    {
      id: 'iso-drawing',
      title: 'ISO 도면 작성 실무',
      description: 'ISO 배관 도면 작성 방법과 실무 노하우를 단계별로 설명',
      category: '교육 영상',
      type: 'Video',
      duration: '1시간 45분',
      episodes: 6,
      lastUpdated: '2023-12-20',
      views: 12850,
      rating: 4.8,
      tags: ['ISO도면', '실무', '도면작성', 'CAD'],
      author: '설계기술원',
      language: '한국어'
    },
    {
      id: 'stress-analysis',
      title: '배관 응력 해석 기초',
      description: '배관 시스템의 응력 해석 이론과 CAESAR II 사용법',
      category: '교육 영상',
      type: 'Video',
      duration: '3시간 20분',
      episodes: 12,
      lastUpdated: '2023-11-30',
      views: 8960,
      rating: 4.7,
      tags: ['응력해석', 'CAESAR', '해석이론', '구조해석'],
      author: '구조해석연구소',
      language: '한국어'
    }
  ],
  tools: [
    {
      id: 'pipe-calculator',
      title: '배관 계산 도구 모음',
      description: '압력손실, 유량, 두께 계산 등 배관 설계에 필요한 각종 계산 도구',
      category: '계산 도구',
      type: 'Tool',
      version: 'v2.1',
      platform: 'Web/Excel',
      lastUpdated: '2024-01-15',
      downloads: 3250,
      rating: 4.9,
      tags: ['계산도구', '압력손실', '유량계산', '두께계산'],
      author: '배관설계연구소',
      language: '한국어'
    },
    {
      id: 'material-database',
      title: '자재 물성 데이터베이스',
      description: '각종 배관 자재의 물성, 규격, 가격 정보를 제공하는 데이터베이스',
      category: '데이터베이스',
      type: 'Database',
      version: 'v1.8',
      platform: 'Web',
      lastUpdated: '2024-01-08',
      downloads: 2890,
      rating: 4.8,
      tags: ['자재정보', '물성', '규격', '데이터베이스'],
      author: '자재정보센터',
      language: '한국어'
    },
    {
      id: 'code-checker',
      title: '설계 코드 검증 도구',
      description: 'ASME, API 등 주요 설계 코드 요구사항 검증 및 체크리스트',
      category: '검증 도구',
      type: 'Tool',
      version: 'v1.5',
      platform: 'Excel/PDF',
      lastUpdated: '2023-12-22',
      downloads: 1950,
      rating: 4.7,
      tags: ['코드검증', 'ASME', 'API', '체크리스트'],
      author: '설계검증센터',
      language: '한국어'
    }
  ]
};

const categories = ['전체', '설계 기준', '설계 가이드', '시공 가이드', '교육 영상', '계산 도구', '데이터베이스', '검증 도구'];
const types = ['전체', 'PDF', 'Video', 'Tool', 'Database'];

export default function TechnicalDocsPage() {
  const [activeTab, setActiveTab] = useState('standards');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedType, setSelectedType] = useState('전체');

  const getCurrentData = () => {
    return technicalDocs[activeTab] || [];
  };

  const filteredData = getCurrentData().filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
    const matchesType = selectedType === '전체' || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Layout title="기술 자료">
      <div className="space-y-6">
        {/* 헤더 섹션 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">기술 자료</h1>
            <p className="text-gray-600 mt-2">
              배관 엔지니어링 관련 표준, 가이드, 교육 자료 및 도구를 제공합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              자료 업로드
            </Button>
            <Button className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              즐겨찾기
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 문서</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">교육 영상</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <Video className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">계산 도구</p>
                  <p className="text-2xl font-bold text-gray-900">18</p>
                </div>
                <Calculator className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">이번 달 다운로드</p>
                  <p className="text-2xl font-bold text-gray-900">2,847</p>
                </div>
                <Download className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="제목, 내용, 태그 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                고급 필터
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 자료 카테고리 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="standards" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              표준/규격
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              가이드
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              교육영상
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              도구
            </TabsTrigger>
          </TabsList>

          {/* 표준/규격 탭 */}
          <TabsContent value="standards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredData.map((doc, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {doc.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{doc.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 메타 정보 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{doc.pages} 페이지</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-gray-500" />
                          <span>{doc.downloads?.toLocaleString() || '0'} 다운로드</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{doc.lastUpdated}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{doc.author}</span>
                        </div>
                      </div>

                      {/* 평점 */}
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(doc.rating)}
                        </div>
                        <span className="text-sm text-gray-600">{doc.rating}</span>
                      </div>

                      {/* 태그 */}
                      <div className="flex flex-wrap gap-2">
                        {doc.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          다운로드
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 가이드 탭 */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredData.map((doc, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {doc.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{doc.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 메타 정보 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{doc.pages} 페이지</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-gray-500" />
                          <span>{doc.downloads?.toLocaleString() || '0'} 다운로드</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{doc.lastUpdated}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{doc.author}</span>
                        </div>
                      </div>

                      {/* 평점 */}
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(doc.rating)}
                        </div>
                        <span className="text-sm text-gray-600">{doc.rating}</span>
                      </div>

                      {/* 태그 */}
                      <div className="flex flex-wrap gap-2">
                        {doc.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          다운로드
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 교육영상 탭 */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredData.map((video, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {video.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{video.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 메타 정보 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{video.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-gray-500" />
                          <span>{video.episodes} 에피소드</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span>{video.views?.toLocaleString() || '0'} 조회</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{video.author}</span>
                        </div>
                      </div>

                      {/* 평점 */}
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(video.rating)}
                        </div>
                        <span className="text-sm text-gray-600">{video.rating}</span>
                      </div>

                      {/* 태그 */}
                      <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Video className="h-4 w-4 mr-2" />
                          시청하기
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 도구 탭 */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredData.map((tool, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{tool.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {tool.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{tool.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 메타 정보 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span>{tool.version}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-gray-500" />
                          <span>{tool.downloads?.toLocaleString() || '0'} 다운로드</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{tool.lastUpdated}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{tool.author}</span>
                        </div>
                      </div>

                      {/* 평점 */}
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(tool.rating)}
                        </div>
                        <span className="text-sm text-gray-600">{tool.rating}</span>
                      </div>

                      {/* 플랫폼 */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">플랫폼:</span>
                        <Badge variant="secondary">{tool.platform}</Badge>
                      </div>

                      {/* 태그 */}
                      <div className="flex flex-wrap gap-2">
                        {tool.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          다운로드
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
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
              <p className="text-gray-500 text-lg">검색 조건에 맞는 자료가 없습니다.</p>
              <p className="text-gray-400 mt-2">다른 검색어나 필터를 시도해보세요.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
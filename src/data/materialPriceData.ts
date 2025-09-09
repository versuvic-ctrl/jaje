// 6개 대표 자재의 월간 가격 동향 데이터

export interface MaterialPriceData {
  period: string;
  steel: number;
  stainlessSteel: number;
  carbonSteel: number;
  copper: number;
  aluminum: number;
  pvc: number;
}

// 최근 12개월 데이터
const months = [
  '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
  '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'
];

// 월간 자재 가격 데이터
export const materialPriceData: MaterialPriceData[] = months.map((month, index) => ({
  period: month.split('-')[1] + '월',
  steel: Math.round(850000 + (Math.sin(index * 0.5) * 50000) + (index * 5000)),
  stainlessSteel: Math.round(4500 + (Math.cos(index * 0.3) * 300) + (index * 50)),
  carbonSteel: Math.round(720000 + (Math.sin(index * 0.4) * 40000) + (index * 3000)),
  copper: Math.round(8500 + (Math.sin(index * 0.6) * 800) + (index * 100)),
  aluminum: Math.round(3200 + (Math.cos(index * 0.5) * 200) + (index * 30)),
  pvc: Math.round(15000 + (Math.sin(index * 0.3) * 1000) + (index * 200))
}));

// 연간 데이터 (최근 5년)
export const yearlyMaterialData: MaterialPriceData[] = ['2020', '2021', '2022', '2023', '2024'].map((year, index) => ({
  period: year,
  steel: Math.round(850000 * (0.8 + index * 0.05) + (Math.random() * 50000)),
  stainlessSteel: Math.round(4500 * (0.8 + index * 0.05) + (Math.random() * 300)),
  carbonSteel: Math.round(720000 * (0.8 + index * 0.05) + (Math.random() * 40000)),
  copper: Math.round(8500 * (0.8 + index * 0.05) + (Math.random() * 800)),
  aluminum: Math.round(3200 * (0.8 + index * 0.05) + (Math.random() * 200)),
  pvc: Math.round(15000 * (0.8 + index * 0.05) + (Math.random() * 1000))
}));

// 자재별 색상 정의
export const materialColors = {
  steel: '#2563eb',
  stainlessSteel: '#dc2626',
  carbonSteel: '#059669',
  copper: '#ea580c',
  aluminum: '#7c3aed',
  pvc: '#0891b2'
};

// 자재별 단위 정의
export const materialUnits = {
  steel: '원/톤',
  stainlessSteel: '원/kg',
  carbonSteel: '원/톤',
  copper: '원/kg',
  aluminum: '원/kg',
  pvc: '원/m'
};
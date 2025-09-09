/**
 * API 클라이언트 모듈
 * 
 * 엔지니어링 계산기 기능을 위한 API 통신을 담당합니다.
 */

export interface CalculationResult {
  value?: number;
  volume?: number;
  npsh?: number;
  results?: {
    flow_rate: number;
    head: number;
    power: number;
  };
  unit?: string;
  units?: {
    flow_rate: string;
    head: string;
    power: string;
  };
  formula?: string;
  formulas?: {
    flow_rate: string;
    head: string;
    power: string;
  };
  inputs?: Record<string, number | string>;
}

export interface TankCalculationInput {
  diameter: number;
  height: number;
  topHeadType?: string;
  bottomHeadType?: string;
  material?: string;
}

export interface NPSHCalculationInput {
  atmospheric_pressure: number;
  vapor_pressure: number;
  static_head: number;
  friction_loss: number;
}

export interface AffinityCalculationInput {
  n1: number;
  n2: number;
  q1: number;
  h1: number;
  p1: number;
}

// 계산기 함수들을 직접 구현
function calculateTankVolumeLocal(input: TankCalculationInput): CalculationResult {
  const { diameter, height, topHeadType = 'flat', bottomHeadType = 'flat' } = input;
  const radius = diameter / 2;
  
  // 원통 부분 부피
  const cylinderVolume = Math.PI * radius * radius * height;
  
  // 헤드 부피 계산
  let topHeadVolume = 0;
  let bottomHeadVolume = 0;
  
  if (topHeadType === 'elliptical') {
    topHeadVolume = (2/3) * Math.PI * radius * radius * (radius / 2);
  } else if (topHeadType === 'hemispherical') {
    topHeadVolume = (2/3) * Math.PI * radius * radius * radius;
  }
  
  if (bottomHeadType === 'elliptical') {
    bottomHeadVolume = (2/3) * Math.PI * radius * radius * (radius / 2);
  } else if (bottomHeadType === 'hemispherical') {
    bottomHeadVolume = (2/3) * Math.PI * radius * radius * radius;
  }
  
  const totalVolume = cylinderVolume + topHeadVolume + bottomHeadVolume;
  
  return {
    volume: totalVolume,
    unit: 'm³',
    formula: 'V = π × r² × h + V_top_head + V_bottom_head',
    inputs: input
  };
}

function calculateNPSHLocal(input: NPSHCalculationInput): CalculationResult {
  const { atmospheric_pressure, vapor_pressure, static_head, friction_loss } = input;
  
  // NPSH = (Pa - Pv) / ρg + Hs - Hf
  // 여기서는 간단히 압력 단위로 계산
  const npsh = atmospheric_pressure - vapor_pressure + static_head - friction_loss;
  
  return {
    npsh: npsh,
    unit: 'm',
    formula: 'NPSH = (Pa - Pv) / ρg + Hs - Hf',
    inputs: input
  };
}

function calculateAffinityLocal(input: AffinityCalculationInput): CalculationResult {
  const { q1, h1, p1, n1, n2 } = input;
  
  // 펌프 친화 법칙
  const q2 = q1 * (n2 / n1);
  const h2 = h1 * Math.pow(n2 / n1, 2);
  const p2 = p1 * Math.pow(n2 / n1, 3);
  
  return {
    results: {
      flow_rate: q2,
      head: h2,
      power: p2
    },
    units: {
      flow_rate: 'm³/h',
      head: 'm',
      power: 'kW'
    },
    formulas: {
      flow_rate: 'Q2 = Q1 × (N2/N1)',
      head: 'H2 = H1 × (N2/N1)²',
      power: 'P2 = P1 × (N2/N1)³'
    },
    inputs: input
  };
}

// 계산기 함수들을 export
export const calculateTankVolume = (input: TankCalculationInput): CalculationResult => {
  return calculateTankVolumeLocal(input);
};

export const calculateNPSH = (input: NPSHCalculationInput): CalculationResult => {
  return calculateNPSHLocal(input);
};

export const calculateAffinity = (input: AffinityCalculationInput): CalculationResult => {
  return calculateAffinityLocal(input);
};

// Local 함수들도 export
export { calculateTankVolumeLocal, calculateNPSHLocal, calculateAffinityLocal };
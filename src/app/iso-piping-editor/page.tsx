'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Minus,
  Trash2,
  Download,
  Undo2,
  Redo2,
  Box,
  Layers,
  Settings,
  Grid,
  Beaker,
  Flame,
  Wrench,
  Bolt,
  X,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Zap,
  Gauge,
  Thermometer,
  Droplets,
  Wind,
  RotateCcw,
  Filter,
  Cylinder,
  Disc,
  Pipette,
  Undo,
  Redo,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

// 노드 인터페이스 (FreeCAD + Flamingo 호환)
interface Node {
  id: string;
  position: Point;
  type: 'connection' | 'equipment' | 'fitting' | 'valve';
  connections: string[]; // 연결된 다른 노드들의 ID
  properties?: {
    size?: string;
    material?: string;
    pressure?: string;
    temperature?: string;
    asmeCode?: string;
  };
}

// 3D 객체 인터페이스
interface Object3D {
  id: string;
  nodeId: string;
  type: string;
  geometry: {
    vertices: Point[];
    faces: number[][];
    normals: Point[];
  };
  material: {
    color: string;
    opacity: number;
    metallic?: boolean;
  };
  transform: {
    position: Point;
    rotation: Point;
    scale: Point;
  };
}

interface PipeSegment {
  id: string;
  start: Point;
  end: Point;
  type: 'horizontal' | 'vertical' | 'diagonal';
  size: string;
  material: string;
  tag?: string;
  asmeCode?: string;
  schedule?: string;
  pressureClass?: string;
  lineNumber?: string;
}

interface Equipment {
  id: string;
  type: string;
  subtype: string;
  position: Point;
  size: string;
  tag: string;
  material: string;
  rotation: number;
  asmeCode?: string;
  pressureClass?: string;
  endConnection?: string;
  facing?: string;
}

interface BOMItem {
  id: string;
  tag: string;
  description: string;
  material: string;
  size: string;
  quantity: number;
  weight?: number;
  cost?: number;
  asmeCode?: string;
  schedule?: string;
  pressureClass?: string;
  lineNumber?: string;
  endConnection?: string;
  facing?: string;
}

// 자재 라이브러리 정의
// ASME B31.3 기반 자재 라이브러리 (FreeCAD + Flamingo 호환)
const ASME_MATERIAL_LIBRARY = {
  pipes: {
    name: 'ASME 배관',
    category: 'piping',
    items: [
      { 
        id: 'asme-pipe-straight', 
        name: 'ASME B36.10M 직관', 
        icon: Pipette,
        asmeCode: 'B36.10M',
        sizes: ['1/2"', '3/4"', '1"', '1-1/4"', '1-1/2"', '2"', '3"', '4"', '6"', '8"'],
        schedules: ['SCH 40', 'SCH 80', 'SCH 160'],
        materials: ['A106 Gr.B', 'A53 Gr.B', 'A312 TP316L']
      },
      { 
        id: 'asme-pipe-bend', 
        name: 'ASME B16.49 벤드', 
        icon: RotateCcw,
        asmeCode: 'B16.49',
        angles: ['45°', '90°'],
        radius: ['1.5D', '3D', '5D']
      }
    ]
  },
  fittings: {
    name: 'ASME 피팅',
    category: 'fittings',
    items: [
      { 
        id: 'asme-elbow-90', 
        name: 'ASME B16.9 90° 엘보', 
        icon: RotateCcw,
        asmeCode: 'B16.9',
        type: 'butt-weld',
        pressureClass: ['150#', '300#', '600#', '900#', '1500#']
      },
      { 
        id: 'asme-elbow-45', 
        name: 'ASME B16.9 45° 엘보', 
        icon: RotateCcw,
        asmeCode: 'B16.9',
        type: 'butt-weld'
      },
      { 
        id: 'asme-tee-straight', 
        name: 'ASME B16.9 스트레이트 티', 
        icon: Wrench,
        asmeCode: 'B16.9',
        type: 'butt-weld'
      },
      { 
        id: 'asme-tee-reducing', 
        name: 'ASME B16.9 리듀싱 티', 
        icon: Wrench,
        asmeCode: 'B16.9',
        type: 'butt-weld'
      },
      { 
        id: 'asme-reducer-concentric', 
        name: 'ASME B16.9 동심 리듀서', 
        icon: Triangle,
        asmeCode: 'B16.9',
        type: 'concentric'
      },
      { 
        id: 'asme-reducer-eccentric', 
        name: 'ASME B16.9 편심 리듀서', 
        icon: Triangle,
        asmeCode: 'B16.9',
        type: 'eccentric'
      },
      { 
        id: 'asme-cap', 
        name: 'ASME B16.9 캡', 
        icon: Circle,
        asmeCode: 'B16.9',
        type: 'butt-weld'
      }
    ]
  },
  flanges: {
    name: 'ASME 플랜지',
    category: 'flanges',
    items: [
      { 
        id: 'asme-flange-wn', 
        name: 'ASME B16.5 용접목 플랜지', 
        icon: Bolt,
        asmeCode: 'B16.5',
        type: 'weld-neck',
        facing: ['RF', 'FF', 'RTJ']
      },
      { 
        id: 'asme-flange-so', 
        name: 'ASME B16.5 소켓용접 플랜지', 
        icon: Bolt,
        asmeCode: 'B16.5',
        type: 'slip-on'
      },
      { 
        id: 'asme-flange-blind', 
        name: 'ASME B16.5 블라인드 플랜지', 
        icon: Bolt,
        asmeCode: 'B16.5',
        type: 'blind'
      }
    ]
  },
  valves: {
    name: 'ASME 밸브',
    category: 'valves',
    items: [
      { 
        id: 'asme-gate-valve', 
        name: 'ASME B16.34 게이트 밸브', 
        icon: Square,
        asmeCode: 'B16.34',
        type: 'gate',
        endConnection: ['flanged', 'butt-weld', 'socket-weld']
      },
      { 
        id: 'asme-globe-valve', 
        name: 'ASME B16.34 글로브 밸브', 
        icon: Circle,
        asmeCode: 'B16.34',
        type: 'globe'
      },
      { 
        id: 'asme-ball-valve', 
        name: 'ASME B16.34 볼 밸브', 
        icon: Circle,
        asmeCode: 'B16.34',
        type: 'ball'
      },
      { 
        id: 'asme-check-valve', 
        name: 'ASME B16.34 체크 밸브', 
        icon: Triangle,
        asmeCode: 'B16.34',
        type: 'check',
        subtype: ['swing', 'lift', 'wafer']
      },
      { 
        id: 'asme-butterfly-valve', 
        name: 'ASME B16.34 버터플라이 밸브', 
        icon: Hexagon,
        asmeCode: 'B16.34',
        type: 'butterfly'
      }
    ]
  },
  equipment: {
    name: 'ASME 압력용기',
    category: 'equipment',
    items: [
      { 
        id: 'asme-vessel-vertical', 
        name: 'ASME VIII Div.1 수직 압력용기', 
        icon: Cylinder,
        asmeCode: 'VIII-1',
        type: 'pressure-vessel'
      },
      { 
        id: 'asme-vessel-horizontal', 
        name: 'ASME VIII Div.1 수평 압력용기', 
        icon: Cylinder,
        asmeCode: 'VIII-1',
        type: 'pressure-vessel'
      },
      { 
        id: 'asme-heat-exchanger', 
        name: 'ASME VIII 열교환기', 
        icon: Thermometer,
        asmeCode: 'VIII-1',
        type: 'heat-exchanger'
      }
    ]
  },
  instruments: {
    name: 'ASME 계기',
    category: 'instruments',
    items: [
      { 
        id: 'asme-pressure-gauge', 
        name: 'ASME B40.100 압력계', 
        icon: Gauge,
        asmeCode: 'B40.100',
        type: 'pressure'
      },
      { 
        id: 'asme-temperature-gauge', 
        name: 'ASME B40.200 온도계', 
        icon: Thermometer,
        asmeCode: 'B40.200',
        type: 'temperature'
      }
    ]
  }
};

const ISOPipingEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<string>('select');
  const [pipes, setPipes] = useState<PipeSegment[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPipeSize, setCurrentPipeSize] = useState('4"');
  const [currentMaterial, setCurrentMaterial] = useState('CS');
  const [gridSize] = useState(40);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [tempLine, setTempLine] = useState<{ start: Point; end: Point } | null>(null);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
  const [lastMouseMoveTime, setLastMouseMoveTime] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const [materialPrices, setMaterialPrices] = useState<any>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  
  // FreeCAD + Flamingo 노드 기반 시스템
  const [nodes, setNodes] = useState<Node[]>([]);
  const [objects3D, setObjects3D] = useState<Object3D[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [connectionMode, setConnectionMode] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [nodeCounter, setNodeCounter] = useState(0);
  
  // 되돌리기/다시하기 시스템
  const [history, setHistory] = useState<{
    pipes: PipeSegment[];
    equipment: Equipment[];
    bomItems: BOMItem[];
  }[]>([{ pipes: [], equipment: [], bomItems: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // 사이드바는 항상 고정된 상태로 유지
  
  // 배관 그리기 모드 상태
  const [isPipeDrawingMode, setIsPipeDrawingMode] = useState(false);
  
  // 팬 관련 상태
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });

  // ISO 그리드 각도 (30도, 90도, 150도)
  const isoAngles = [0, 30, 90, 150, 180, 210, 270, 330];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      setCtx(context);
      
      // 캔버스 크기 설정
      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        context?.scale(window.devicePixelRatio, window.devicePixelRatio);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, []);

  // 캔버스 다시 그리기 (상태 변경 시)
  useEffect(() => {
    draw();
  }, [ctx, pipes, equipment, tempLine, currentMousePos, currentTool, zoom, pan, showGrid, selectedItems]);

  // FreeCAD + Flamingo 스타일 아이소메트릭 그리드 스냅 (정확한 좌표계)
  const snapToGridPoint = (point: Point): Point => {
    if (!snapToGrid) return point;
    
    // 아이소메트릭 좌표계 정의 (30도 각도)
    const cos30 = Math.cos(Math.PI / 6); // cos(30°) = √3/2 ≈ 0.866
    const sin30 = Math.sin(Math.PI / 6); // sin(30°) = 0.5
    
    // 스크린 좌표를 아이소메트릭 월드 좌표로 역변환
    const canvas = canvasRef.current;
    if (!canvas) return point;
    
    const centerX = canvas.width / 2 + pan.x * zoom;
    const centerY = canvas.height / 2 + pan.y * zoom;
    
    // 스크린 좌표를 중심 기준으로 변환
    const screenX = (point.x - centerX) / zoom;
    const screenY = (point.y - centerY) / zoom;
    
    // 아이소메트릭 역변환 매트릭스 적용
    const det = cos30 * sin30 - (-cos30) * sin30; // 행렬식
    const worldX = (sin30 * screenX - (-cos30) * screenY) / det;
    const worldY = (cos30 * screenY - sin30 * screenX) / det;
    
    // 월드 좌표를 그리드에 스냅
    const snapSize = gridSize;
    const snappedWorldX = Math.round(worldX / snapSize) * snapSize;
    const snappedWorldY = Math.round(worldY / snapSize) * snapSize;
    
    // 스냅된 월드 좌표를 다시 스크린 좌표로 변환
    const snappedScreenX = (snappedWorldX * cos30 - snappedWorldY * cos30);
    const snappedScreenY = (snappedWorldX * sin30 + snappedWorldY * sin30);
    
    // 최종 스크린 좌표 계산
    const finalX = centerX + snappedScreenX * zoom;
    const finalY = centerY + snappedScreenY * zoom;
    
    return {
      x: finalX,
      y: finalY
    };
  };

  // FreeCAD 스타일 아이소메트릭 각도 스냅 (정확한 30도 투영)
  const snapToISOAngle = (start: Point, end: Point): Point => {
    if (!snapToGrid) return end;
    
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // FreeCAD 아이소메트릭 표준 각도 (정확한 30도 투영)
    const isoAngle = Math.PI / 6; // 30도
    const cos30 = Math.cos(isoAngle);
    const sin30 = Math.sin(isoAngle);
    
    // 아이소메트릭 축 방향들
    const directions = [
      { x: cos30, y: sin30, name: 'X+' },      // 우측 하향
      { x: -cos30, y: sin30, name: 'Y+' },     // 좌측 하향
      { x: 0, y: -1, name: 'Z+' },             // 수직 상향
      { x: -cos30, y: -sin30, name: 'X-' },    // 좌측 상향
      { x: cos30, y: -sin30, name: 'Y-' },     // 우측 상향
      { x: 0, y: 1, name: 'Z-' }               // 수직 하향
    ];
    
    // 현재 벡터와 가장 가까운 아이소메트릭 방향 찾기
    let bestDirection = directions[0];
    let maxDot = -Infinity;
    
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return end;
    
    const normalizedDx = dx / length;
    const normalizedDy = dy / length;
    
    for (const dir of directions) {
      const dot = normalizedDx * dir.x + normalizedDy * dir.y;
      if (dot > maxDot) {
        maxDot = dot;
        bestDirection = dir;
      }
    }
    
    // 그리드에 맞춰 거리 조정
    const gridDistance = Math.round(length / gridSize) * gridSize;
    
    const newEnd = {
      x: start.x + gridDistance * bestDirection.x,
      y: start.y + gridDistance * bestDirection.y
    };
    
    // 최종 결과를 그리드에 스냅
    return snapToGridPoint(newEnd);
  };
  
  // 히스토리 저장 함수
  const saveToHistory = () => {
    const newState = {
      pipes: [...pipes],
      equipment: [...equipment],
      bomItems: [...bomItems]
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    // 히스토리 크기 제한 (최대 50개)
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  };
  
  // 되돌리기 함수
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      
      setPipes(state.pipes);
      setEquipment(state.equipment);
      setBomItems(state.bomItems);
      setHistoryIndex(newIndex);
    }
  };
  
  // 다시하기 함수
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      
      setPipes(state.pipes);
      setEquipment(state.equipment);
      setBomItems(state.bomItems);
      setHistoryIndex(newIndex);
    }
  };

  // FreeCAD + Flamingo 노드 기반 시스템 함수들
  
  // 노드 생성 함수
  const createNode = (position: Point, type: Node['type'], properties?: Node['properties']): Node => {
    const newNode: Node = {
      id: `node-${nodeCounter}`,
      position: snapToGrid ? snapToGridPoint(position) : position,
      type,
      connections: [],
      properties: {
        size: currentPipeSize,
        material: currentMaterial,
        asmeCode: 'B16.9',
        ...properties
      }
    };
    
    // 노드와 연결된 3D 객체 생성
    const object3D = create3DObject(newNode);
    setObjects3D(prev => [...prev, object3D]);
    
    setNodeCounter(prev => prev + 1);
    return newNode;
  };
  
  // 노드 연결 함수
  const connectNodes = (nodeId1: string, nodeId2: string) => {
    setNodes(prevNodes => 
      prevNodes.map(node => {
        if (node.id === nodeId1 && !node.connections.includes(nodeId2)) {
          return { ...node, connections: [...node.connections, nodeId2] };
        }
        if (node.id === nodeId2 && !node.connections.includes(nodeId1)) {
          return { ...node, connections: [...node.connections, nodeId1] };
        }
        return node;
      })
    );
  };
  
  // 노드 찾기 함수 (마우스 위치 기준)
  const findNodeAtPosition = (position: Point, tolerance: number = 10): Node | null => {
    return nodes.find(node => {
      const distance = Math.sqrt(
        Math.pow(node.position.x - position.x, 2) + 
        Math.pow(node.position.y - position.y, 2)
      );
      return distance <= tolerance / zoom;
    }) || null;
  };
  
  // 3D 객체 생성 함수
  const create3DObject = (node: Node): Object3D => {
    const baseGeometry = {
      vertices: [] as Point[],
      faces: [] as number[][],
      normals: [] as Point[]
    };
    
    const baseMaterial = {
      color: '#4f46e5',
      opacity: 0.8,
      metallic: true
    };
    
    const baseTransform = {
      position: { x: node.position.x, y: node.position.y },
      rotation: { x: 0, y: 0 },
      scale: { x: 1, y: 1 }
    };
    
    switch (node.type) {
      case 'equipment':
        // 장비용 3D 객체 (실린더 형태)
        const equipRadius = 20;
        const equipHeight = 40;
        
        // 실린더 정점 생성
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          baseGeometry.vertices.push({
            x: Math.cos(angle) * equipRadius,
            y: Math.sin(angle) * equipRadius
          });
          baseGeometry.vertices.push({
            x: Math.cos(angle) * equipRadius,
            y: Math.sin(angle) * equipRadius + equipHeight
          });
        }
        
        baseMaterial.color = '#dc2626';
        break;
        
      case 'valve':
        // 밸브용 3D 객체 (육각형 형태)
        const valveSize = 15;
        
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          baseGeometry.vertices.push({
            x: Math.cos(angle) * valveSize,
            y: Math.sin(angle) * valveSize
          });
        }
        
        baseMaterial.color = '#059669';
        break;
        
      case 'fitting':
        // 피팅용 3D 객체 (사각형 형태)
        const fittingSize = 12;
        
        baseGeometry.vertices = [
          { x: -fittingSize, y: -fittingSize },
          { x: fittingSize, y: -fittingSize },
          { x: fittingSize, y: fittingSize },
          { x: -fittingSize, y: fittingSize }
        ];
        
        baseMaterial.color = '#7c3aed';
        break;
        
      case 'connection':
        // 연결점용 3D 객체 (원형)
        const connRadius = 8;
        
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          baseGeometry.vertices.push({
            x: Math.cos(angle) * connRadius,
            y: Math.sin(angle) * connRadius
          });
        }
        
        baseMaterial.color = '#2563eb';
        break;
        
      default:
        // 기본 사각형
        baseGeometry.vertices = [
          { x: -5, y: -5 },
          { x: 5, y: -5 },
          { x: 5, y: 5 },
          { x: -5, y: 5 }
        ];
        baseMaterial.color = '#95a5a6';
        break;
    }
    
    return {
      id: `obj3d-${node.id}`,
      nodeId: node.id,
      type: node.type,
      geometry: baseGeometry,
      material: baseMaterial,
      transform: baseTransform
    };
  };
  
  // 3D 객체 그리기 함수 (2D 투영)
  const draw3DObject = (ctx: CanvasRenderingContext2D, obj: Object3D) => {
    if (obj.geometry.vertices.length === 0) return;
    
    ctx.save();
    
    // 변환 적용
    ctx.translate(obj.transform.position.x, obj.transform.position.y);
    ctx.scale(obj.transform.scale.x, obj.transform.scale.y);
    ctx.rotate(obj.transform.rotation.x);
    
    // 재질 설정
    ctx.fillStyle = obj.material.color;
    ctx.globalAlpha = obj.material.opacity;
    ctx.strokeStyle = obj.material.metallic ? '#374151' : obj.material.color;
    ctx.lineWidth = 2 / zoom;
    
    // 정점들을 연결하여 도형 그리기
    if (obj.geometry.vertices.length > 2) {
      ctx.beginPath();
      ctx.moveTo(obj.geometry.vertices[0].x, obj.geometry.vertices[0].y);
      
      for (let i = 1; i < obj.geometry.vertices.length; i++) {
        ctx.lineTo(obj.geometry.vertices[i].x, obj.geometry.vertices[i].y);
      }
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    
    // 3D 효과를 위한 그라데이션 (선택적)
    if (obj.material.metallic && zoom > 0.5) {
      const gradient = ctx.createRadialGradient(
        -5, -5, 0,
        0, 0, Math.max(...obj.geometry.vertices.map(v => 
          Math.sqrt(v.x * v.x + v.y * v.y)
        ))
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    ctx.restore();
  };
  
  // 노드 그리기 함수
  const drawNode = (ctx: CanvasRenderingContext2D, node: Node) => {
    const { x, y } = node.position;
    const radius = 6 / zoom;
    
    // 노드 타입별 색상
    const colors = {
      connection: '#95a5a6',
      equipment: '#45b7d1',
      fitting: '#4ecdc4',
      valve: '#ff6b6b'
    };
    
    // 노드 원 그리기
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = colors[node.type];
    ctx.fill();
    
    // 선택된 노드 표시
    if (selectedNodes.includes(node.id)) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2 / zoom;
      ctx.stroke();
    }
    
    // 활성 노드 표시
    if (activeNodeId === node.id) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3 / zoom;
      ctx.stroke();
    }
    
    // 노드 ID 표시 (디버그용)
    if (zoom > 0.5) {
      ctx.fillStyle = '#000';
      ctx.font = `${10 / zoom}px Arial`;
      ctx.fillText(node.id.split('-')[1], x + radius + 2, y - radius);
    }
  };
  
  // 노드 간 연결선 그리기 함수
  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = nodes.find(n => n.id === connectionId);
        if (connectedNode) {
          ctx.beginPath();
          ctx.moveTo(node.position.x, node.position.y);
          ctx.lineTo(connectedNode.position.x, connectedNode.position.y);
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2 / zoom;
          ctx.stroke();
        }
      });
    });
  };

  // 캔버스 그리기 (최적화된 버전)
  const draw = () => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const { width, height } = rect;
    
    // 고해상도 디스플레이 지원
    const pixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / pixelRatio;
    const canvasHeight = canvas.height / pixelRatio;
    
    // 캔버스 클리어 (실제 캔버스 크기로)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 변환 적용
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);
    
    // ISO 그리드 그리기 (showGrid가 true일 때만)
    if (showGrid) {
      drawISOGrid(ctx, width, height);
    }
    
    // 배관 그리기
    pipes.forEach(pipe => drawPipe(ctx, pipe));
    
    // 장비 그리기
    equipment.forEach(eq => drawEquipment(ctx, eq));
    
    // 노드 간 연결선 그리기
    drawConnections(ctx);
    
    // 3D 객체 그리기 (2D 투영)
    objects3D.forEach(obj => draw3DObject(ctx, obj));
    
    // 노드 그리기
    nodes.forEach(node => drawNode(ctx, node));
    
    // 임시 라인 그리기 (그리기 중일 때) - ISO 스타일
    if (tempLine && isDrawing && currentTool === 'pipe') {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3 / zoom;
      ctx.setLineDash([8 / zoom, 4 / zoom]);
      ctx.lineCap = 'round';
      
      // 메인 임시 라인
      ctx.beginPath();
      ctx.moveTo(tempLine.start.x, tempLine.start.y);
      ctx.lineTo(tempLine.end.x, tempLine.end.y);
      ctx.stroke();
      
      // 임시 라인의 외곽선 (미리보기)
      if (zoom > 0.4) {
        const dx = tempLine.end.x - tempLine.start.x;
        const dy = tempLine.end.y - tempLine.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
          const unitX = dx / length;
          const unitY = dy / length;
          const perpX = -unitY * (4 / zoom);
          const perpY = unitX * (4 / zoom);
          
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 1 / zoom;
          ctx.setLineDash([4 / zoom, 2 / zoom]);
          
          // 상단 라인
          ctx.beginPath();
          ctx.moveTo(tempLine.start.x + perpX, tempLine.start.y + perpY);
          ctx.lineTo(tempLine.end.x + perpX, tempLine.end.y + perpY);
          ctx.stroke();
          
          // 하단 라인
          ctx.beginPath();
          ctx.moveTo(tempLine.start.x - perpX, tempLine.start.y - perpY);
          ctx.lineTo(tempLine.end.x - perpX, tempLine.end.y - perpY);
          ctx.stroke();
        }
      }
      
      // 시작점과 끝점 표시
      ctx.fillStyle = '#3b82f6';
      ctx.setLineDash([]);
      
      // 시작점
      ctx.beginPath();
      ctx.arc(tempLine.start.x, tempLine.start.y, 4 / zoom, 0, 2 * Math.PI);
      ctx.fill();
      
      // 끝점 (더 크게)
      ctx.beginPath();
      ctx.arc(tempLine.end.x, tempLine.end.y, 6 / zoom, 0, 2 * Math.PI);
      ctx.fill();
      
      // 길이 표시
      if (zoom > 0.6) {
        const midX = (tempLine.start.x + tempLine.end.x) / 2;
        const midY = (tempLine.start.y + tempLine.end.y) / 2;
        const distance = Math.sqrt(
          Math.pow(tempLine.end.x - tempLine.start.x, 2) + 
          Math.pow(tempLine.end.y - tempLine.start.y, 2)
        );
        const lengthInMeters = (distance / 100).toFixed(1); // 픽셀을 미터로 변환
        
        ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
        ctx.font = `bold ${12 / zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`${lengthInMeters}m`, midX, midY - 10 / zoom);
      }
      
      ctx.setLineDash([]);
    }
    
    // 배관 도구 선택 시 현재 마우스 위치에 임시 점 표시
    if (currentTool === 'pipe' && currentMousePos) {
      ctx.fillStyle = '#ef4444'; // 빨간색 점
      ctx.strokeStyle = '#ffffff'; // 흰색 테두리
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([]);
      
      // 메인 점
      ctx.beginPath();
      ctx.arc(currentMousePos.x, currentMousePos.y, 5 / zoom, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // 십자 표시 (그리드 교차점 강조)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1 / zoom;
      const crossSize = 8 / zoom;
      
      // 수평선
      ctx.beginPath();
      ctx.moveTo(currentMousePos.x - crossSize, currentMousePos.y);
      ctx.lineTo(currentMousePos.x + crossSize, currentMousePos.y);
      ctx.stroke();
      
      // 수직선
      ctx.beginPath();
      ctx.moveTo(currentMousePos.x, currentMousePos.y - crossSize);
      ctx.lineTo(currentMousePos.x, currentMousePos.y + crossSize);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  // FreeCAD + Flamingo 스타일 아이소메트릭 그리드 (정확한 30도 투영)
  const drawISOGrid = (context: CanvasRenderingContext2D, width: number, height: number) => {
    context.save();
    
    // 그리드 스타일 설정
    context.strokeStyle = '#e0e4e7';
    context.lineWidth = 0.5 / zoom;
    context.globalAlpha = 0.6;
    
    // 줌 레벨에 따른 적응형 그리드 간격 (부드러운 전환)
    let adaptiveGridSize = gridSize;
    let gridDensity = 1;
    
    // 로그 스케일 기반 부드러운 그리드 간격 계산
    const logZoom = Math.log10(zoom);
    if (zoom < 0.1) {
      adaptiveGridSize = gridSize * 32;
      gridDensity = 0.25;
    } else if (zoom < 0.25) {
      adaptiveGridSize = gridSize * 16;
      gridDensity = 0.5;
    } else if (zoom < 0.5) {
      adaptiveGridSize = gridSize * 8;
      gridDensity = 0.75;
    } else if (zoom < 1.0) {
      adaptiveGridSize = gridSize * 4;
      gridDensity = 1.0;
    } else if (zoom < 2.0) {
      adaptiveGridSize = gridSize * 2;
      gridDensity = 1.0;
    } else {
      adaptiveGridSize = gridSize;
      gridDensity = 1.0;
    }
    
    // 그리드 밀도에 따른 투명도 조절
    context.globalAlpha = Math.min(0.8, gridDensity * 0.8);
    
    // 아이소메트릭 좌표계 정의 (30도 각도)
    const cos30 = Math.cos(Math.PI / 6); // cos(30°) = √3/2 ≈ 0.866
    const sin30 = Math.sin(Math.PI / 6); // sin(30°) = 1/2 = 0.5
    
    // 화면 중심점
    const centerX = width / 2 + pan.x * zoom;
    const centerY = height / 2 + pan.y * zoom;
    
    // 화면 영역 계산 (최적화된 범위)
    const margin = adaptiveGridSize * 2;
    const visibleRange = Math.max(width, height) / zoom;
    const gridSteps = Math.ceil(visibleRange / adaptiveGridSize) + 5; // 여유분 추가
    
    // 성능 최적화: 배치 그리기
    context.beginPath();
    
    // 아이소메트릭 그리드 라인 그리기 (최적화된 버전)
    const stepSize = Math.max(1, Math.floor(gridDensity * 2)); // 밀도에 따른 스텝 크기
    
    for (let i = -gridSteps; i <= gridSteps; i += stepSize) {
      for (let j = -gridSteps; j <= gridSteps; j += stepSize) {
        const gridX = i * adaptiveGridSize;
        const gridY = j * adaptiveGridSize;
        
        // 아이소메트릭 좌표를 스크린 좌표로 변환
        const screenX1 = centerX + (gridX * cos30 - gridY * cos30) * zoom;
        const screenY1 = centerY + (gridX * sin30 + gridY * sin30) * zoom;
        
        // 화면 범위 체크 (최적화)
        if (screenX1 < -margin || screenX1 > width + margin || 
            screenY1 < -margin || screenY1 > height + margin) {
          continue;
        }
        
        // X축 방향 라인 (30도 우하향)
        const nextGridX = (i + stepSize) * adaptiveGridSize;
        const screenX2 = centerX + (nextGridX * cos30 - gridY * cos30) * zoom;
        const screenY2 = centerY + (nextGridX * sin30 + gridY * sin30) * zoom;
        
        context.moveTo(screenX1, screenY1);
        context.lineTo(screenX2, screenY2);
        
        // Y축 방향 라인 (30도 좌하향)
        const nextGridY = (j + stepSize) * adaptiveGridSize;
        const screenX3 = centerX + (gridX * cos30 - nextGridY * cos30) * zoom;
        const screenY3 = centerY + (gridX * sin30 + nextGridY * sin30) * zoom;
        
        context.moveTo(screenX1, screenY1);
        context.lineTo(screenX3, screenY3);
        
        // Z축 방향 라인 (수직) - 높은 줌에서만 표시
        if (zoom > 0.5) {
          const screenX4 = screenX1;
          const screenY4 = screenY1 - adaptiveGridSize * zoom;
          
          context.moveTo(screenX1, screenY1);
          context.lineTo(screenX4, screenY4);
        }
      }
    }
    
    // 배치 그리기 실행
    context.stroke();
    
    // 주요 축 강조
    context.strokeStyle = '#9ca3af';
    context.lineWidth = 1.5 / zoom;
    context.globalAlpha = 0.8;
    
    // 축 표시 범위 계산
    const axisRange = visibleRange / 2;
    
    // X축 (30도 우하향)
    context.beginPath();
    context.moveTo(centerX - axisRange * cos30 * zoom, centerY - axisRange * sin30 * zoom);
    context.lineTo(centerX + axisRange * cos30 * zoom, centerY + axisRange * sin30 * zoom);
    context.stroke();
    
    // Y축 (30도 좌하향)
    context.beginPath();
    context.moveTo(centerX + axisRange * cos30 * zoom, centerY - axisRange * sin30 * zoom);
    context.lineTo(centerX - axisRange * cos30 * zoom, centerY + axisRange * sin30 * zoom);
    context.stroke();
    
    // Z축 (수직)
    context.beginPath();
    context.moveTo(centerX, centerY - axisRange * zoom);
    context.lineTo(centerX, centerY + axisRange * zoom);
    context.stroke();
    
    context.restore();
  };

  // 배관 그리기 (ISO 표준 라인)
  // ASME 표준 배관 그리기 함수
  const drawPipe = (context: CanvasRenderingContext2D, pipe: PipeSegment) => {
    const isSelected = selectedItems.includes(pipe.id);
    
    // ASME 코드별 선 스타일 설정
    const getASMELineStyle = (asmeCode?: string) => {
      switch (asmeCode) {
        case 'B36.10M': // 직관
          return { color: '#374151', width: 3, dash: [] };
        case 'B16.49': // 벤드
          return { color: '#059669', width: 3, dash: [5, 3] };
        case 'B16.9': // 피팅
          return { color: '#dc2626', width: 4, dash: [] };
        case 'B16.5': // 플랜지
          return { color: '#7c3aed', width: 5, dash: [8, 4] };
        case 'B16.34': // 밸브
          return { color: '#ea580c', width: 4, dash: [3, 2, 8, 2] };
        default:
          return { color: '#374151', width: 3, dash: [] };
      }
    };
    
    const lineStyle = getASMELineStyle(pipe.asmeCode);
    context.strokeStyle = isSelected ? '#3b82f6' : lineStyle.color;
    context.lineWidth = (isSelected ? lineStyle.width + 1 : lineStyle.width) / zoom;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.setLineDash(lineStyle.dash.map(d => d / zoom));
    
    // 아이소메트릭 좌표계 정의 (30도 각도)
    const cos30 = Math.cos(Math.PI / 6); // cos(30°) = √3/2 ≈ 0.866
    const sin30 = Math.sin(Math.PI / 6); // sin(30°) = 1/2 = 0.5
    
    // 화면 중심점
    const centerX = context.canvas.width / 2 + pan.x * zoom;
    const centerY = context.canvas.height / 2 + pan.y * zoom;
    
    // 월드 좌표를 아이소메트릭 스크린 좌표로 변환
    const startScreenX = centerX + (pipe.start.x * cos30 - pipe.start.y * cos30) * zoom;
    const startScreenY = centerY + (pipe.start.x * sin30 + pipe.start.y * sin30) * zoom;
    const endScreenX = centerX + (pipe.end.x * cos30 - pipe.end.y * cos30) * zoom;
    const endScreenY = centerY + (pipe.end.x * sin30 + pipe.end.y * sin30) * zoom;
    
    // 메인 배관 라인
    context.beginPath();
    context.moveTo(startScreenX, startScreenY);
    context.lineTo(endScreenX, endScreenY);
    context.stroke();
    
    // 배관 외곽선 (이중선 효과) - ASME 표준
    if (zoom > 0.3) {
      // 아이소메트릭 좌표계 정의 (30도 각도)
      const cos30 = Math.cos(Math.PI / 6);
      const sin30 = Math.sin(Math.PI / 6);
      
      // 화면 중심점 계산
      const centerX = context.canvas.width / 2;
      const centerY = context.canvas.height / 2;
      
      // 월드 좌표를 아이소메트릭 스크린 좌표로 변환
      const startScreenX = centerX + (pipe.start.x * cos30 - pipe.start.y * cos30) * zoom + panX;
      const startScreenY = centerY + (pipe.start.x * sin30 + pipe.start.y * sin30) * zoom + panY;
      const endScreenX = centerX + (pipe.end.x * cos30 - pipe.end.y * cos30) * zoom + panX;
      const endScreenY = centerY + (pipe.end.x * sin30 + pipe.end.y * sin30) * zoom + panY;
      
      const dx = endScreenX - startScreenX;
      const dy = endScreenY - startScreenY;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        const unitX = dx / length;
        const unitY = dy / length;
        
        // 배관 크기에 따른 외곽선 간격
        const pipeWidth = getPipeWidth(pipe.size);
        const perpX = -unitY * (pipeWidth / zoom);
        const perpY = unitX * (pipeWidth / zoom);
        
        context.strokeStyle = isSelected ? '#60a5fa' : '#6b7280';
        context.lineWidth = 1 / zoom;
        context.setLineDash([]);
        
        // 상단 라인
        context.beginPath();
        context.moveTo(startScreenX + perpX, startScreenY + perpY);
        context.lineTo(endScreenX + perpX, endScreenY + perpY);
        context.stroke();
        
        // 하단 라인
        context.beginPath();
        context.moveTo(startScreenX - perpX, startScreenY - perpY);
        context.lineTo(endScreenX - perpX, endScreenY - perpY);
        context.stroke();
        
        // ASME 심볼 표시
        drawASMESymbols(context, pipe, unitX, unitY, length);
      }
    }
    
    // ASME 정보 표시
    if (zoom > 0.5) {
      // 아이소메트릭 좌표계 정의 (30도 각도)
      const cos30 = Math.cos(Math.PI / 6);
      const sin30 = Math.sin(Math.PI / 6);
      
      // 화면 중심점 계산
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // 월드 좌표 중점 계산
      const midWorldX = (pipe.start.x + pipe.end.x) / 2;
      const midWorldY = (pipe.start.y + pipe.end.y) / 2;
      
      // 월드 좌표를 아이소메트릭 스크린 좌표로 변환
      const midX = centerX + (midWorldX * cos30 - midWorldY * cos30) * zoom + panX;
      const midY = centerY + (midWorldX * sin30 + midWorldY * sin30) * zoom + panY;
      
      // 배관 정보 텍스트 구성
      const infoLines = [];
      if (pipe.lineNumber) infoLines.push(pipe.lineNumber);
      if (pipe.size && pipe.schedule) infoLines.push(`${pipe.size} ${pipe.schedule}`);
      if (pipe.material) infoLines.push(pipe.material);
      if (pipe.asmeCode) infoLines.push(`ASME ${pipe.asmeCode}`);
      if (pipe.pressureClass) infoLines.push(pipe.pressureClass);
      
      // 정보 표시
      context.font = `bold ${8 / zoom}px Arial`;
      context.fillStyle = 'rgba(255, 255, 255, 0.9)';
      context.strokeStyle = '#374151';
      context.lineWidth = 0.5 / zoom;
      
      infoLines.forEach((line, index) => {
        const textWidth = context.measureText(line).width;
        const yOffset = (index - infoLines.length / 2) * 12 / zoom;
        
        // 배경
        context.fillRect(
          midX - textWidth / 2 - 2 / zoom,
          midY + yOffset - 6 / zoom,
          textWidth + 4 / zoom,
          10 / zoom
        );
        
        // 테두리
        context.strokeRect(
          midX - textWidth / 2 - 2 / zoom,
          midY + yOffset - 6 / zoom,
          textWidth + 4 / zoom,
          10 / zoom
        );
        
        // 텍스트
        context.fillStyle = isSelected ? '#1d4ed8' : '#374151';
        context.textAlign = 'center';
        context.fillText(line, midX, midY + yOffset);
      });
      
      // 태그 표시
      if (pipe.tag) {
        context.font = `bold ${10 / zoom}px Arial`;
        context.fillStyle = isSelected ? '#3b82f6' : '#dc2626';
        context.fillText(pipe.tag, midX, midY + (infoLines.length * 6 + 15) / zoom);
      }
    }
    
    // 연결점 표시
    if (zoom > 0.7) {
      context.fillStyle = isSelected ? '#3b82f6' : '#6b7280';
      context.setLineDash([]);
      
      // 시작점
      context.beginPath();
      context.arc(pipe.start.x, pipe.start.y, 3 / zoom, 0, 2 * Math.PI);
      context.fill();
      
      // 끝점
      context.beginPath();
      context.arc(pipe.end.x, pipe.end.y, 3 / zoom, 0, 2 * Math.PI);
      context.fill();
    }
  };
  
  // 배관 크기에 따른 외곽선 간격 계산
  const getPipeWidth = (size: string): number => {
    const sizeMap: { [key: string]: number } = {
      '1/2"': 4, '3/4"': 5, '1"': 6, '1-1/4"': 7, '1-1/2"': 8,
      '2"': 10, '3"': 12, '4"': 15, '6"': 20, '8"': 25
    };
    return sizeMap[size] || 6;
  };
  
  // ASME 심볼 그리기
  const drawASMESymbols = (
    context: CanvasRenderingContext2D,
    pipe: PipeSegment,
    unitX: number,
    unitY: number,
    length: number
  ) => {
    const midX = (pipe.start.x + pipe.end.x) / 2;
    const midY = (pipe.start.y + pipe.end.y) / 2;
    
    context.save();
    context.translate(midX, midY);
    context.rotate(Math.atan2(unitY, unitX));
    
    switch (pipe.asmeCode) {
      case 'B16.9': // 피팅 심볼
        context.strokeStyle = '#dc2626';
        context.lineWidth = 2 / zoom;
        context.beginPath();
        context.arc(0, 0, 8 / zoom, 0, 2 * Math.PI);
        context.stroke();
        break;
        
      case 'B16.5': // 플랜지 심볼
        context.strokeStyle = '#7c3aed';
        context.lineWidth = 3 / zoom;
        context.beginPath();
        context.rect(-6 / zoom, -8 / zoom, 12 / zoom, 16 / zoom);
        context.stroke();
        break;
        
      case 'B16.34': // 밸브 심볼
        context.strokeStyle = '#ea580c';
        context.lineWidth = 2 / zoom;
        context.beginPath();
        context.moveTo(-8 / zoom, -8 / zoom);
        context.lineTo(8 / zoom, 8 / zoom);
        context.moveTo(-8 / zoom, 8 / zoom);
        context.lineTo(8 / zoom, -8 / zoom);
        context.stroke();
        break;
    }
    
    context.restore();
  };

  // 장비 그리기
  // ASME 표준 장비 그리기 함수
  const drawEquipment = (context: CanvasRenderingContext2D, eq: Equipment) => {
    context.save();
    context.translate(eq.position.x, eq.position.y);
    context.rotate(eq.rotation * Math.PI / 180);
    
    // ASME 코드별 색상 및 스타일 설정
    const getASMEEquipmentStyle = (asmeCode?: string, subtype?: string) => {
      switch (asmeCode) {
        case 'VIII-1': // 압력용기
          return { 
            stroke: '#1f2937', 
            fill: '#e5e7eb', 
            lineWidth: 3,
            symbolColor: '#dc2626'
          };
        case 'B40.100': // 압력계
          return { 
            stroke: '#059669', 
            fill: '#d1fae5', 
            lineWidth: 2,
            symbolColor: '#059669'
          };
        case 'B40.200': // 온도계
          return { 
            stroke: '#dc2626', 
            fill: '#fee2e2', 
            lineWidth: 2,
            symbolColor: '#dc2626'
          };
        default:
          return { 
            stroke: '#1f2937', 
            fill: '#f3f4f6', 
            lineWidth: 2,
            symbolColor: '#6b7280'
          };
      }
    };
    
    const style = getASMEEquipmentStyle(eq.asmeCode, eq.subtype);
    context.strokeStyle = style.stroke;
    context.fillStyle = style.fill;
    context.lineWidth = style.lineWidth / zoom;
    
    // 장비 크기 계산
    const baseSize = 30 / zoom;
    const size = getSizeMultiplier(eq.size) * baseSize;
    
    // ASME 표준 장비 심볼 그리기
    switch (eq.asmeCode) {
      case 'VIII-1': // ASME VIII Div.1 압력용기
        drawPressureVessel(context, eq.subtype, size, style);
        break;
        
      case 'B40.100': // ASME B40.100 압력계
        drawPressureGauge(context, size, style);
        break;
        
      case 'B40.200': // ASME B40.200 온도계
        drawTemperatureGauge(context, size, style);
        break;
        
      default:
        // 기존 장비 타입별 그리기
        drawStandardEquipment(context, eq, size, style);
    }
    
    // ASME 정보 및 태그 표시
    drawEquipmentInfo(context, eq, size);
    
    context.restore();
  };
  
  // 크기 승수 계산
  const getSizeMultiplier = (size: string): number => {
    const sizeMap: { [key: string]: number } = {
      'small': 0.7, 'medium': 1.0, 'large': 1.3, 'x-large': 1.6
    };
    return sizeMap[size] || 1.0;
  };
  
  // ASME VIII 압력용기 그리기
  const drawPressureVessel = (
    context: CanvasRenderingContext2D, 
    subtype: string, 
    size: number, 
    style: any
  ) => {
    if (subtype.includes('vertical')) {
      // 수직 압력용기
      context.beginPath();
      context.rect(-size * 0.4, -size, size * 0.8, size * 2);
      context.fill();
      context.stroke();
      
      // 상부 헤드
      context.beginPath();
      context.arc(0, -size, size * 0.4, Math.PI, 0);
      context.fill();
      context.stroke();
      
      // 하부 헤드
      context.beginPath();
      context.arc(0, size, size * 0.4, 0, Math.PI);
      context.fill();
      context.stroke();
      
    } else if (subtype.includes('horizontal')) {
      // 수평 압력용기
      context.beginPath();
      context.rect(-size, -size * 0.4, size * 2, size * 0.8);
      context.fill();
      context.stroke();
      
      // 좌측 헤드
      context.beginPath();
      context.arc(-size, 0, size * 0.4, Math.PI / 2, -Math.PI / 2);
      context.fill();
      context.stroke();
      
      // 우측 헤드
      context.beginPath();
      context.arc(size, 0, size * 0.4, -Math.PI / 2, Math.PI / 2);
      context.fill();
      context.stroke();
      
    } else if (subtype.includes('heat-exchanger')) {
      // 열교환기
      context.beginPath();
      context.rect(-size, -size * 0.3, size * 2, size * 0.6);
      context.fill();
      context.stroke();
      
      // 튜브 번들 표시
      for (let i = -3; i <= 3; i++) {
        context.beginPath();
        context.moveTo(-size * 0.8, i * size * 0.1);
        context.lineTo(size * 0.8, i * size * 0.1);
        context.strokeStyle = style.symbolColor;
        context.lineWidth = 1 / zoom;
        context.stroke();
      }
    }
    
    // 압력 등급 표시
    context.fillStyle = style.symbolColor;
    context.font = `bold ${8 / zoom}px Arial`;
    context.textAlign = 'center';
    context.fillText('PV', 0, -size * 1.2);
  };
  
  // 압력계 그리기
  const drawPressureGauge = (
    context: CanvasRenderingContext2D, 
    size: number, 
    style: any
  ) => {
    // 게이지 몸체
    context.beginPath();
    context.arc(0, 0, size * 0.6, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    
    // 게이지 면
    context.beginPath();
    context.arc(0, 0, size * 0.4, 0, 2 * Math.PI);
    context.fillStyle = '#ffffff';
    context.fill();
    context.stroke();
    
    // 바늘
    context.strokeStyle = style.symbolColor;
    context.lineWidth = 2 / zoom;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(size * 0.3, -size * 0.1);
    context.stroke();
    
    // 연결부
    context.beginPath();
    context.rect(-size * 0.1, size * 0.6, size * 0.2, size * 0.3);
    context.fillStyle = style.fill;
    context.fill();
    context.stroke();
  };
  
  // 온도계 그리기
  const drawTemperatureGauge = (
    context: CanvasRenderingContext2D, 
    size: number, 
    style: any
  ) => {
    // 온도계 몸체
    context.beginPath();
    context.rect(-size * 0.1, -size * 0.8, size * 0.2, size * 1.6);
    context.fill();
    context.stroke();
    
    // 온도계 구근
    context.beginPath();
    context.arc(0, size * 0.8, size * 0.2, 0, 2 * Math.PI);
    context.fillStyle = style.symbolColor;
    context.fill();
    context.stroke();
    
    // 눈금
    for (let i = -3; i <= 3; i++) {
      context.beginPath();
      context.moveTo(size * 0.1, i * size * 0.2);
      context.lineTo(size * 0.2, i * size * 0.2);
      context.strokeStyle = style.symbolColor;
      context.lineWidth = 1 / zoom;
      context.stroke();
    }
  };
  
  // 표준 장비 그리기
  const drawStandardEquipment = (
    context: CanvasRenderingContext2D, 
    eq: Equipment, 
    size: number, 
    style: any
  ) => {
    switch (eq.type) {
      case 'equipment':
        if (eq.subtype.includes('tank')) {
          context.beginPath();
          context.arc(0, 0, size, 0, 2 * Math.PI);
          context.fill();
          context.stroke();
        } else if (eq.subtype.includes('pump')) {
          context.beginPath();
          context.arc(0, 0, size * 0.8, 0, 2 * Math.PI);
          context.fill();
          context.stroke();
          
          context.beginPath();
          context.arc(0, 0, size * 0.5, 0, 2 * Math.PI);
          context.stroke();
        } else {
          context.beginPath();
          context.rect(-size, -size, size * 2, size * 2);
          context.fill();
          context.stroke();
        }
        break;
        
      case 'valves':
        context.beginPath();
        context.rect(-size * 0.5, -size * 0.5, size, size);
        context.fill();
        context.stroke();
        
        context.beginPath();
        context.moveTo(0, -size * 0.5);
        context.lineTo(0, -size);
        context.stroke();
        break;
        
      default:
        context.beginPath();
        context.rect(-size * 0.7, -size * 0.7, size * 1.4, size * 1.4);
        context.fill();
        context.stroke();
    }
  };
  
  // 장비 정보 표시
  const drawEquipmentInfo = (
    context: CanvasRenderingContext2D, 
    eq: Equipment, 
    size: number
  ) => {
    const infoLines = [];
    if (eq.tag) infoLines.push(eq.tag);
    if (eq.asmeCode) infoLines.push(`ASME ${eq.asmeCode}`);
    if (eq.pressureClass) infoLines.push(eq.pressureClass);
    if (eq.material) infoLines.push(eq.material);
    
    context.fillStyle = '#1f2937';
    context.font = `bold ${8 / zoom}px Arial`;
    context.textAlign = 'center';
    
    infoLines.forEach((line, index) => {
      const yOffset = size + (index + 1) * 12 / zoom;
      
      // 배경
      const textWidth = context.measureText(line).width;
      context.fillStyle = 'rgba(255, 255, 255, 0.9)';
      context.fillRect(
        -textWidth / 2 - 2 / zoom,
        yOffset - 8 / zoom,
        textWidth + 4 / zoom,
        10 / zoom
      );
      
      // 텍스트
      context.fillStyle = index === 0 ? '#dc2626' : '#1f2937';
      context.fillText(line, 0, yOffset);
    });
  };

  // 마우스 이벤트 처리 (정확도 개선된 버전 - 새로운 라이브러리 적용)
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    // 고해상도 디스플레이 지원을 위한 정확한 스케일 계산
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // 정확한 좌표 변환: 요소 상대 좌표로 먼저 변환 후 스케일 적용
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    
    // 아이소메트릭 좌표계를 위한 역변환 계산
    const screenX = canvasX - canvas.width / 2 - pan.x * zoom;
    const screenY = canvasY - canvas.height / 2 - pan.y * zoom;
    
    // 아이소메트릭 좌표계 정의 (30도 각도)
    const cos30 = Math.cos(Math.PI / 6); // cos(30°) = √3/2 ≈ 0.866
    const sin30 = Math.sin(Math.PI / 6); // sin(30°) = 1/2 = 0.5
    
    // 스크린 좌표를 아이소메트릭 월드 좌표로 역변환
    // 역변환 매트릭스 적용
    const det = cos30 * sin30 - (-cos30) * sin30; // 행렬식
    const worldX = ((screenX / zoom) * sin30 - (screenY / zoom) * (-cos30)) / det;
    const worldY = ((screenY / zoom) * cos30 - (screenX / zoom) * sin30) / det;
    
    const rawPos = { x: worldX, y: worldY };
    
    // 배관 도구 선택 시 항상 그리드 스냅 적용, 그 외에는 설정에 따라
    const shouldSnap = currentTool === 'pipe' || snapToGrid;
    return shouldSnap ? snapToGridPoint(rawPos) : rawPos;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 우클릭 처리
    if (e.button === 2) {
      e.preventDefault();
      // 배관 그리기 종료
      if (currentTool === 'pipe' && isPipeDrawingMode) {
        setIsPipeDrawingMode(false);
        setLastPoint(null);
        setTempLine(null);
      }
      return;
    }
    
    // 마우스 휠 가운데 버튼 처리 (화면 이동)
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    const pos = getMousePos(e); // 이미 스냅된 위치
    
    if (currentTool === 'pipe') {
      if (!isPipeDrawingMode) {
        // 첫 번째 클릭 - 배관 그리기 모드 시작
        setIsPipeDrawingMode(true);
        setLastPoint(pos);
        
        // 시작점에 노드 생성
        const startNode = createNode(pos, 'connection');
        setNodes(prev => [...prev, startNode]);
      } else {
        // 배관 그리기 모드에서 클릭 - 배관 세그먼트 생성
        const endPos = snapToISOAngle(lastPoint!, pos);
        
        // 최소 길이 체크 (너무 짧은 라인 방지)
        const distance = Math.sqrt(
          Math.pow(endPos.x - lastPoint!.x, 2) + Math.pow(endPos.y - lastPoint!.y, 2)
        );
        
        if (distance > gridSize / 2) { // 그리드 크기의 절반 이상일 때만 생성
          // ASME 배관 표준 정보 설정
          const asmeCode = 'B36.10M'; // ASME B36.10M 표준 배관
          const schedule = 'SCH 40'; // 기본 스케줄
          const pressureClass = '150#'; // 기본 압력 등급
          const lineNumber = `L-${pipes.length + 1}`;
          
          const newPipe: PipeSegment = {
            id: `pipe-${Date.now()}`,
            start: lastPoint!,
            end: endPos,
            type: 'horizontal',
            size: currentPipeSize,
            material: currentMaterial,
            tag: `P-${pipes.length + 1}`,
            asmeCode,
            schedule,
            pressureClass,
            lineNumber
          };
          
          setPipes(prev => [...prev, newPipe]);
          
          // 끝점에 노드 생성
          const endNode = createNode(endPos, 'connection');
          setNodes(prev => [...prev, endNode]);
          
          // BOM에 ASME 정보 포함하여 추가
          const length = distance / gridSize;
          const bomItem: BOMItem = {
            id: newPipe.id,
            tag: newPipe.tag || '',
            description: `PIPE ${newPipe.size} ${newPipe.material} (ASME ${asmeCode} ${schedule})`,
            material: newPipe.material,
            size: newPipe.size,
            quantity: Math.round(length * 100) / 100,
            asmeCode,
            schedule,
            pressureClass,
            lineNumber
          };
          
          setBomItems(prev => [...prev, bomItem]);
          
          // 히스토리에 저장
          setTimeout(() => saveToHistory(), 0);
        }
        
        // 연속 그리기를 위해 새 시작점 설정
        setLastPoint(endPos);
      }
    } else if (currentTool === 'select') {
      // 선택 도구 로직
      const clickedPipe = pipes.find(pipe => {
        const dx = pipe.end.x - pipe.start.x;
        const dy = pipe.end.y - pipe.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return false;
        
        const t = Math.max(0, Math.min(1, ((pos.x - pipe.start.x) * dx + (pos.y - pipe.start.y) * dy) / (length * length)));
        const projection = {
          x: pipe.start.x + t * dx,
          y: pipe.start.y + t * dy
        };
        
        const dist = Math.sqrt(
          Math.pow(pos.x - projection.x, 2) + Math.pow(pos.y - projection.y, 2)
        );
        
        return dist < 15 / zoom;
      });
      
      const clickedEquipment = equipment.find(eq => {
        const dist = Math.sqrt(
          Math.pow(pos.x - eq.position.x, 2) + Math.pow(pos.y - eq.position.y, 2)
        );
        return dist < 30;
      });
      
      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd 클릭으로 다중 선택
        if (clickedPipe) {
          setSelectedItems(prev => 
            prev.includes(clickedPipe.id) 
              ? prev.filter(id => id !== clickedPipe.id)
              : [...prev, clickedPipe.id]
          );
        } else if (clickedEquipment) {
          setSelectedItems(prev => 
            prev.includes(clickedEquipment.id) 
              ? prev.filter(id => id !== clickedEquipment.id)
              : [...prev, clickedEquipment.id]
          );
        }
      } else {
        // 단일 선택
        if (clickedPipe) {
          setSelectedItems([clickedPipe.id]);
        } else if (clickedEquipment) {
          setSelectedItems([clickedEquipment.id]);
        } else {
          setSelectedItems([]);
        }
      }
      
      // 노드 선택 처리
      const clickedNode = findNodeAtPosition(pos);
      if (clickedNode) {
        if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd 클릭으로 다중 선택
          setSelectedNodes(prev => 
            prev.includes(clickedNode.id) 
              ? prev.filter(id => id !== clickedNode.id)
              : [...prev, clickedNode.id]
          );
        } else {
          // 단일 선택
          setSelectedNodes([clickedNode.id]);
        }
      } else if (!e.ctrlKey && !e.metaKey) {
        // 빈 공간 클릭 시 노드 선택 해제
        setSelectedNodes([]);
      }
    } else if (currentTool === 'node') {
      // 노드 생성 모드
      const newNode = createNode(pos, 'connection');
      
      // 기존 노드와 자동 연결 (일정 거리 내)
      const nearbyNodes = findNearbyNodes(pos, gridSize * 2);
      if (nearbyNodes.length > 0 && selectedNodes.length > 0) {
        // 선택된 노드와 새 노드 연결
        selectedNodes.forEach(selectedNodeId => {
          connectNodes(selectedNodeId, newNode.id);
        });
      }
      
      // 새 노드 선택
      setSelectedNodes([newNode.id]);
      
      // 히스토리 저장
      setTimeout(() => saveToHistory(), 0);
    } else if (currentTool.includes('-')) {
      const [category, itemId] = currentTool.split('-', 2);
      addEquipment(category, itemId, pos);
    }
    
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 마우스 이벤트 최적화를 위한 throttling
    if (Date.now() - lastMouseMoveTime < 16) return; // 60fps 제한
    setLastMouseMoveTime(Date.now());
    
    // 팬 모드 처리
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX / zoom,
        y: prev.y + deltaY / zoom
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    const pos = getMousePos(e); // 이미 스냅된 위치
    
    // 현재 마우스 위치 업데이트 (배관 도구 선택 시 스냅된 위치)
    if (currentTool === 'pipe') {
      setCurrentMousePos(pos);
    } else {
      setCurrentMousePos(null);
    }
    
    // 배관 그리기 모드에서 임시선 표시
    if (currentTool === 'pipe' && isPipeDrawingMode && lastPoint) {
      const endPos = snapToISOAngle(lastPoint, pos);
      setTempLine({ start: lastPoint, end: endPos });
    } else {
      // 배관 그리기 모드가 아닐 때는 임시선 제거
      setTempLine(null);
    }
    
    // 커서 스타일 변경
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      if (currentTool === 'pipe') {
        canvas.style.cursor = isDrawing ? 'crosshair' : 'crosshair';
      } else if (currentTool === 'select') {
        // 선택 가능한 객체 위에 있는지 확인
        const clickedPipe = pipes.find(pipe => {
          const dx = pipe.end.x - pipe.start.x;
          const dy = pipe.end.y - pipe.start.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          if (length === 0) return false;
          
          const t = Math.max(0, Math.min(1, ((pos.x - pipe.start.x) * dx + (pos.y - pipe.start.y) * dy) / (length * length)));
          const projection = {
            x: pipe.start.x + t * dx,
            y: pipe.start.y + t * dy
          };
          
          const dist = Math.sqrt(
            Math.pow(pos.x - projection.x, 2) + Math.pow(pos.y - projection.y, 2)
          );
          
          return dist < 15 / zoom;
        });
        
        const clickedEquipment = equipment.find(eq => {
          const dist = Math.sqrt(
            Math.pow(pos.x - eq.position.x, 2) + Math.pow(pos.y - eq.position.y, 2)
          );
          return dist < 30;
        });
        
        canvas.style.cursor = (clickedPipe || clickedEquipment) ? 'pointer' : 'default';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setTempLine(null);
    setIsPanning(false);
  };

  // 마우스 휠 줌 기능
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 줌 팩터 (휠 방향에 따라 줌인/줌아웃)
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    
    // 마우스 위치를 중심으로 줌
    const zoomRatio = newZoom / zoom;
    const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+Z (되돌리기)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    
    // Ctrl+Y 또는 Ctrl+Shift+Z (다시하기)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
      return;
    }
    
    if (e.key === 'Escape') {
      // ESC 키로 그리기 모드 취소
      if (isPipeDrawingMode) {
        setIsPipeDrawingMode(false);
        setLastPoint(null);
        setTempLine(null);
      }
      setSelectedItems([]);
    } else if ((e.key === 'Enter' || e.key === ' ') && isPipeDrawingMode) {
      // Enter 키 또는 스페이스바로 배관 그리기 완료
      e.preventDefault();
      setIsPipeDrawingMode(false);
      setLastPoint(null);
      setTempLine(null);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      // Delete/Backspace 키로 선택된 항목 삭제
      if (selectedItems.length > 0) {
        setPipes(prev => prev.filter(pipe => !selectedItems.includes(pipe.id)));
        setEquipment(prev => prev.filter(eq => !selectedItems.includes(eq.id)));
        setBomItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        
        // 삭제 후 히스토리에 저장
        setTimeout(() => saveToHistory(), 0);
      }
    } else if (e.key === 'g' || e.key === 'G') {
      // G 키로 그리드 토글
      setShowGrid(prev => !prev);
    } else if (e.key === 's' || e.key === 'S') {
      // S 키로 스냅 토글
      setSnapToGrid(prev => !prev);
    }
  };

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawing, selectedItems]);

  // 장비 추가
  const addEquipment = (category: string, itemId: string, position: Point) => {
    const categoryData = ASME_MATERIAL_LIBRARY[category as keyof typeof ASME_MATERIAL_LIBRARY];
    const item = categoryData?.items.find(i => i.id === itemId);
    
    if (!item) return;
    
    // ASME 코드 정보 추출
    const asmeCode = (item as any).asmeCode;
    const pressureClass = (item as any).pressureClass?.[0] || '150#';
    const endConnection = (item as any).endConnection?.[0] || 'butt-weld';
    const facing = (item as any).facing?.[0] || 'RF';
    
    const newEquipment: Equipment = {
      id: `eq-${Date.now()}`,
      type: category,
      subtype: itemId,
      position,
      size: '4"',
      tag: `${item.name.split(' ')[0]}-${equipment.length + 1}`,
      material: currentMaterial,
      rotation: 0,
      asmeCode,
      pressureClass,
      endConnection,
      facing
    };
    
    setEquipment(prev => [...prev, newEquipment]);
    
    // BOM에 ASME 정보 포함하여 추가
    const bomItem: BOMItem = {
      id: newEquipment.id,
      tag: newEquipment.tag,
      description: `${item.name} ${newEquipment.size}${asmeCode ? ` (ASME ${asmeCode})` : ''}`,
      material: newEquipment.material,
      size: newEquipment.size,
      quantity: 1,
      asmeCode,
      pressureClass,
      endConnection,
      facing
    };
    
    setBomItems(prev => [...prev, bomItem]);
    
    // 장비 추가 후 히스토리에 저장
    setTimeout(() => saveToHistory(), 0);
  };

  // BOM 가격 정보 업데이트
  const updateBOMPrices = async () => {
    try {
      const response = await fetch('/api/piping-materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bomItems }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setBomItems(data.bomItems);
      }
    } catch (error) {
      console.error('가격 정보 업데이트 실패:', error);
    }
  };

  // BOM 내보내기
  const exportBOM = async () => {
    // 먼저 가격 정보 업데이트
    await updateBOMPrices();
    
    const csvContent = [
      ['MARK', 'QTY/LGTH', 'SIZE', 'DESCRIPTION', 'MATERIAL', 'UNIT_PRICE', 'TOTAL_PRICE', 'WEIGHT'],
      ...bomItems.map((item, index) => [
        (index + 1).toString(),
        item.quantity.toString(),
        item.size,
        item.description,
        item.material,
        item.cost ? `$${item.cost.toFixed(2)}` : 'N/A',
        item.cost ? `$${(item.cost * item.quantity).toFixed(2)}` : 'N/A',
        item.weight ? `${item.weight.toFixed(2)} kg` : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iso-piping-bom.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    draw();
  }, [ctx, zoom, pan, pipes, equipment, tempLine, showGrid]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 고정 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = '/'}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">ISO 배관 편집기</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex h-screen pt-16 bg-gray-50">
      {/* 왼쪽 툴바 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              도구 패널
            </h2>
            <p className="text-sm text-gray-600">
              ASME 표준 기반 배관 설계
            </p>
          </div>
        </div>
        
        {/* 도구 선택 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">도구</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={currentTool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCurrentTool('select');
                setCurrentMousePos(null);
                setLastPoint(null);
                setTempLine(null);
              }}
            >
              선택
            </Button>
            <Button
              variant={currentTool === 'pipe' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCurrentTool('pipe');
                setLastPoint(null);
                setTempLine(null);
              }}
            >
              배관
            </Button>
            <Button
              variant={currentTool === 'node' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCurrentTool('node');
                setLastPoint(null);
                setTempLine(null);
              }}
            >
              <Circle className="w-4 h-4 mr-1" />
              노드
            </Button>
          </div>
        </div>
        
        {/* 배관 설정 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            배관 설정
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                사이즈
              </label>
              <select
                title="파이프 크기 선택"
                aria-label="파이프 크기 선택"
                value={currentPipeSize}
                onChange={(e) => setCurrentPipeSize(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value='1"'>1"</option>
                <option value='2"'>2"</option>
                <option value='3"'>3"</option>
                <option value='4"'>4"</option>
                <option value='6"'>6"</option>
                <option value='8"'>8"</option>
                <option value='10"'>10"</option>
                <option value='12"'>12"</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                재질
              </label>
              <select
                value={currentMaterial}
                onChange={(e) => setCurrentMaterial(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="CS">CS (Carbon Steel)</option>
                <option value="SS">SS (Stainless Steel)</option>
                <option value="AS">AS (Alloy Steel)</option>
                <option value="PVC">PVC</option>
                <option value="HDPE">HDPE</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* 자재 라이브러리 */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">자재 라이브러리</h3>
          <div className="space-y-2">
            {Object.entries(ASME_MATERIAL_LIBRARY).map(([categoryKey, category]) => (
              <div key={categoryKey} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === categoryKey ? '' : categoryKey)}
                  className="w-full flex items-center justify-between p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                >
                  <span className="font-medium">{category.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    openDropdown === categoryKey ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {openDropdown === categoryKey && (
                  <div className="mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                    {category.items.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentTool(`${categoryKey}-${item.id}`);
                            setCurrentMousePos(null);
                            setLastPoint(null);
                            setTempLine(null);
                            setOpenDropdown('');
                          }}
                          className={`w-full flex items-center gap-2 p-2 text-sm hover:bg-blue-50 transition-colors ${
                            currentTool === `${categoryKey}-${item.id}` ? 'bg-blue-100 text-blue-700' : ''
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* 설정 */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">설정</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">그리드 스냅</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">그리드 표시</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* 중앙 편집 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 툴바 */}
        <div className="bg-white border-b border-gray-200 p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="되돌리기 (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="다시하기 (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={showGrid ? 'bg-blue-50 text-blue-700' : ''}
            >
              <Grid className="w-4 h-4" />
              그리드
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={exportBOM}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              BOM 내보내기
            </Button>
          </div>
        </div>
        
        {/* 캔버스 */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
          />
          
          {/* 상태 표시 */}
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
            <div className="text-sm font-medium text-gray-900">
              현재 도구: {currentTool === 'select' ? '선택' : 
                        currentTool === 'pipe' ? '배관' : 
                        currentTool === 'node' ? '노드' :
                        currentTool.includes('-') ? 
                          ASME_MATERIAL_LIBRARY[currentTool.split('-')[0] as keyof typeof ASME_MATERIAL_LIBRARY]?.items
                            .find(item => item.id === currentTool.split('-').slice(1).join('-'))?.name || currentTool
                        : currentTool}
            </div>
            <div className="text-xs text-gray-600">
              배관: {currentPipeSize} {currentMaterial}
            </div>
            {currentTool === 'pipe' && (
              <div className="text-xs text-blue-600 mt-1">
                {lastPoint ? '다음 점을 클릭하세요' : '시작점을 클릭하세요'}
              </div>
            )}
            {currentTool === 'node' && (
              <div className="text-xs text-blue-600 mt-1">
                클릭하여 노드를 생성하세요
                {selectedNodes.length > 0 && ` (${selectedNodes.length}개 노드 선택됨)`}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 오른쪽 BOM 패널 */}
      <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                자재 명세서 (BOM)
              </h3>
              <p className="text-sm text-gray-600">
                ISO 배관 자재 목록
              </p>
            </div>
            {bomItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={updateBOMPrices}
                className="text-xs"
              >
                가격 업데이트
              </Button>
            )}
          </div>
          {bomItems.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">
                비용 요약
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <div>총 항목: {bomItems.length}개</div>
                <div>총 무게: {bomItems.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0).toFixed(2)} kg</div>
                <div className="font-semibold text-blue-900">
                  총 비용: ${bomItems.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {bomItems.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Box className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                배관이나 장비를 추가하면<br />BOM이 자동 생성됩니다
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bomItems.map((item, index) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm text-gray-900">
                      {index + 1}. {item.tag}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setBomItems(prev => prev.filter(i => i.id !== item.id));
                        setPipes(prev => prev.filter(p => p.id !== item.id));
                        setEquipment(prev => prev.filter(e => e.id !== item.id));
                      }}
                      className="text-red-500 hover:text-red-700 h-auto p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>설명: {item.description}</div>
                    <div>재질: {item.material}</div>
                    <div>사이즈: {item.size}</div>
                    <div>수량: {item.quantity}</div>
                    {item.cost && (
                      <div className="text-green-600 font-medium">
                        단가: ${item.cost.toFixed(2)}
                      </div>
                    )}
                    {item.weight && (
                      <div>무게: {item.weight.toFixed(2)} kg</div>
                    )}
                    {item.cost && (
                      <div className="text-blue-600 font-medium">
                        총액: ${(item.cost * item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ISOPipingEditor;
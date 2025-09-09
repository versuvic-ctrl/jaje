'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface MaterialPriceData {
  period: string;
  steel: number;
  stainlessSteel: number;
  carbonSteel: number;
  copper: number;
  aluminum: number;
  pvc: number;
}

interface MaterialPriceChartProps {
  data: MaterialPriceData[];
  materialKey?: string;
  compact?: boolean;
}

export default function MaterialPriceChart({
  data,
  materialKey,
  compact = false
}: MaterialPriceChartProps) {
  // 개별 자재 차트인 경우
  if (materialKey && compact) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={materialKey}
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // 전체 자재 차트
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="period" 
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <Tooltip 
          labelStyle={{ color: '#333' }}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="steel"
          stroke="#8884d8"
          strokeWidth={2}
          name="철강"
        />
        <Line
          type="monotone"
          dataKey="stainlessSteel"
          stroke="#82ca9d"
          strokeWidth={2}
          name="스테인리스강"
        />
        <Line
          type="monotone"
          dataKey="carbonSteel"
          stroke="#ffc658"
          strokeWidth={2}
          name="탄소강"
        />
        <Line
          type="monotone"
          dataKey="copper"
          stroke="#ff7300"
          strokeWidth={2}
          name="구리"
        />
        <Line
          type="monotone"
          dataKey="aluminum"
          stroke="#8dd1e1"
          strokeWidth={2}
          name="알루미늄"
        />
        <Line
          type="monotone"
          dataKey="pvc"
          stroke="#d084d0"
          strokeWidth={2}
          name="PVC"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
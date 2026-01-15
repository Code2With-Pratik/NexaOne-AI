"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminChartProps {
  data: {
    name: string;
    users: number;
    generations: number;
  }[];
}

export const AdminChart = ({ data }: AdminChartProps) => {
  // State to track which bar is being hovered
  const [hovered, setHovered] = useState<{ index: number; key: string } | null>(null);

  return (
    <Card className="bg-[#1f2937] border-white/10 text-white col-span-4 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-medium text-white/80">Weekly Performance</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={8}>
                <defs>
                    <linearGradient id="userBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="genBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f472b6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#db2777" stopOpacity={0.8}/>
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
                
                <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10} 
                />
                <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                />
                
                {/* 👇 UPDATED: cursor is set to false (or transparent) to remove the background highlight */}
                <Tooltip 
                    cursor={false} // This removes the grey/white background bar on hover
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff', zIndex: 100 }}
                    itemStyle={{ color: '#fff' }}
                    wrapperStyle={{ zIndex: 1000 }}
                />
                
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                
                {/* 1. USERS BAR */}
                <Bar 
                    dataKey="users" 
                    name="New Users" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    fill="url(#userBar)"
                >
                    {data.map((entry, index) => (
                        <Cell 
                            key={`cell-users-${index}`}
                            fill="url(#userBar)"
                            onMouseEnter={() => setHovered({ index, key: 'users' })}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                filter: hovered?.index === index && hovered?.key === 'users' 
                                    ? "drop-shadow(0px 0px 10px rgba(129, 140, 248, 0.7))" 
                                    : "none",
                                opacity: hovered && (hovered.index !== index || hovered.key !== 'users') 
                                    ? 0.4 
                                    : 1,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                </Bar>

                {/* 2. GENERATIONS BAR */}
                <Bar 
                    dataKey="generations" 
                    name="AI Generations" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    fill="url(#genBar)"
                >
                    {data.map((entry, index) => (
                        <Cell 
                            key={`cell-gen-${index}`}
                            fill="url(#genBar)"
                            onMouseEnter={() => setHovered({ index, key: 'generations' })}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                filter: hovered?.index === index && hovered?.key === 'generations' 
                                    ? "drop-shadow(0px 0px 10px rgba(244, 114, 182, 0.7))" 
                                    : "none",
                                opacity: hovered && (hovered.index !== index || hovered.key !== 'generations') 
                                    ? 0.4 
                                    : 1,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                </Bar>

            </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
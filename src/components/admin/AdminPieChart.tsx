"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminPieChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = [
    { start: "#A9E002", end: "#1ED760" }, // green
    { start: "#818cf8", end: "#4f46e5" }, // Indigo
    { start: "#f472b6", end: "#db2777" }, // Pink
    { start: "#34d399", end: "#059669" }, // Emerald
    { start: "#fbbf24", end: "#d97706" }, // Amber
    { start: "#38bdf8", end: "#0284c7" }, // Sky
];

// Custom Active Shape (The "Pop out" effect)
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10} // 👈 Make it 10px larger
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0px 0px 8px rgba(255,255,255,0.4))" }} // Glow effect
      />
    </g>
  );
};

export const AdminPieChart = ({ data }: AdminPieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <Card className="bg-[#1f2937] border-white/10 text-white flex flex-col shadow-xl">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-2xl font-medium text-white/80">Tool Popularity</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 pb-4">
        {/* Responsive Height: Taller on mobile to fit the legend */}
        <div className="h-[450px] md:h-[370px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                    {data.map((_, index) => (
                        <linearGradient key={`grad-${index}`} id={`pieGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS[index % COLORS.length].start} stopOpacity={1}/>
                            <stop offset="100%" stopColor={COLORS[index % COLORS.length].end} stopOpacity={1}/>
                        </linearGradient>
                    ))}
                </defs>

                <Pie
                  data={data}
                  cx="50%"
                  cy="50%" // Centered exactly
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  // @ts-ignore: Recharts type definition missing activeIndex
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape} // 👈 Use the custom shape
                  onMouseEnter={onPieEnter} // Highlight on hover
                  onClick={onPieEnter} // Highlight on click
                  cursor="pointer"
                >
                  {data.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#pieGrad-${index})`} 
                        style={{ filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.3))", outline: 'none' }} 
                    />
                  ))}
                </Pie>
                
                <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff', zIndex: 100 }}
                    itemStyle={{ color: '#fff' }}
                    wrapperStyle={{ zIndex: 1000 }} // 👈 Increased Z-Index for Tooltip
                />
                
                <Legend 
                    verticalAlign="bottom" 
                    height={undefined}
                    wrapperStyle={{ paddingTop: "24px", paddingBottom: "10px" }} 
                    iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
             
             {/* Center Text */}
             <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none mb-6">
                 <span className="text-3xl font-bold text-white drop-shadow-md">AI</span>
                 <span className="text-xs text-white/40 uppercase tracking-widest">Usage</span>
             </div>
        </div>
      </CardContent>
    </Card>
  );
};
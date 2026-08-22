"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export function Graphic({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          // tickLine={false}
          // axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          // tickLine={false}
          // axisLine={false}
        />
        <Bar dataKey="total" fill="#D45110" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

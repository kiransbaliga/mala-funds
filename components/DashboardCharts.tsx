'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { formatINR } from './CurrencyDisplay';

interface DashboardChartsProps {
  yearlyData: any[];
  panchayatData: any[];
  schemeData: any[];
  categoryData: any[];
}

const COLORS = ['#0f766e', '#2563eb', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#475569'];

export default function DashboardCharts({
  yearlyData,
  panchayatData,
  schemeData,
  categoryData
}: DashboardChartsProps) {
  // Format yearly data in Lakhs
  const yearlyChartData = yearlyData.map(item => ({
    name: item.year,
    'Sanctioned (₹ Lakh)': (item.sanctioned / 100000).toFixed(2),
    'Tendered (₹ Lakh)': (item.tendered / 100000).toFixed(2),
    'Paid (₹ Lakh)': (item.spent / 100000).toFixed(2),
  }));

  // Format panchayat data in Lakhs
  const panchayatChartData = panchayatData.map(item => ({
    name: item.name,
    'Sanctioned (₹ Lakh)': (item.sanctioned / 100000).toFixed(2),
    'Tendered (₹ Lakh)': (item.tendered / 100000).toFixed(2),
  }));

  const categoryPieData = categoryData.map(item => ({
    name: item.category,
    value: item.projectCount
  }));

  return (
    <div className="space-y-8">
      {/* 1. Yearly Financial Lifecycle Trend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Financial Allocation Lifecycle by Financial Year
          </h3>
          <p className="text-xs text-slate-500">
            Comparing Sanctioned Outlay (Sulekha) vs Tendered / Contract Amount (e-Tender) vs Verified Expenditure (Saankhya).
          </p>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} unit=" L" />
              <Tooltip 
                formatter={(val) => [`₹${val} Lakh`, '']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Sanctioned (₹ Lakh)" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tendered (₹ Lakh)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Paid (₹ Lakh)" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Panchayat and Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Allocation by Panchayat */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Sanctioned vs Tendered by Grama Panchayat
            </h3>
            <p className="text-xs text-slate-500">
              Comparison across constituent local bodies in Mala Block.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={panchayatChartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} unit=" L" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val) => [`₹${val} Lakh`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Sanctioned (₹ Lakh)" fill="#0f766e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Tendered (₹ Lakh)" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Projects by Sector / Category
            </h3>
            <p className="text-xs text-slate-500">
              Roads, School Infrastructure, Healthcare, Drinking Water, etc.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [`${val} projects`, 'Count']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

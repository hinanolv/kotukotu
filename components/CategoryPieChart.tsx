'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, Category } from '@/types';
import styles from './CategoryPieChart.module.css';

// Fixed color palette for categories
const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

interface CategoryPieChartProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function CategoryPieChart({ transactions, categories }: CategoryPieChartProps) {
  const data = useMemo(() => {
    const totals: Record<string, number> = {};

    transactions.forEach(t => {
      const categoryName = categories.find(c => c.id === t.categoryId)?.name || '未分類';
      totals[categoryName] = (totals[categoryName] || 0) + t.amount;
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by highest value
  }, [transactions, categories]);

  const totalAmount = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalAmount) * 100).toFixed(1);
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{data.name}</p>
          <p className={styles.tooltipValue}>{data.value.toLocaleString()}円 ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>カテゴリ別の割合</h2>
      <div className={styles.chartWrapper}>
        {data.length === 0 ? (
          <div className={styles.empty}>データがありません</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

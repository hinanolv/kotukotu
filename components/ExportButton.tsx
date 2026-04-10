'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { Transaction, Category } from '@/types';
import styles from './ExportButton.module.css';

interface ExportButtonProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function ExportButton({ transactions, categories }: ExportButtonProps) {
  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || '未分類';
  };

  const handleExport = () => {
    const headers = ['日付', 'カテゴリー', '金額', 'メモ'];
    
    // Excelでのパースを安定させるため、全てのフィールドをダブルクオートで囲む
    const formatField = (field: string | number) => `"${String(field).replace(/"/g, '""')}"`;

    const rows = transactions.map(t => [
      formatField(t.date),
      formatField(getCategoryName(t.categoryId)),
      formatField(t.amount),
      formatField(t.memo || '')
    ]);

    // Windows版Excelのために改行コードを CRLF (\r\n) にする
    const csvContent = [
      headers.map(formatField).join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    // BOM文字列（\uFEFF）を直接CSVデータの先頭に付与してUTF-8として認識させる
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const filename = `kakeibo_data_${dateStr}.csv`;

    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <button 
      className={styles.button} 
      onClick={handleExport}
      aria-label="Export to CSV"
    >
      <Download size={18} />
      <span>CSV出力</span>
    </button>
  );
}

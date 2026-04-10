'use client';

import React from 'react';
import { Save } from 'lucide-react';
import styles from './ExportButton.module.css';

export default function BackupButton() {
  const handleBackup = () => {
    // localStorageから既存データを取得
    const categories = localStorage.getItem('kakeibo_categories');
    const transactions = localStorage.getItem('kakeibo_transactions');
    const budgets = localStorage.getItem('kakeibo_budgets');

    const backupData = {
      categories: categories ? JSON.parse(categories) : [],
      transactions: transactions ? JSON.parse(transactions) : [],
      budgets: budgets ? JSON.parse(budgets) : {},
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const filename = `kakeibo_backup_${dateStr}.json`;

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
      onClick={handleBackup}
      aria-label="Backup to JSON"
    >
      <Save size={18} />
      <span>バックアップ (JSON)</span>
    </button>
  );
}

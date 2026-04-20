'use client';

import React, { useState, useEffect } from 'react';
import { Category, Transaction } from '@/types';
import styles from './AddTransactionForm.module.css';

interface AddTransactionFormProps {
  categories: Category[];
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction | null;
  isDuplicate?: boolean;
}

export default function AddTransactionForm({ categories, onSubmit, initialData, isDuplicate }: AddTransactionFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [memo, setMemo] = useState('');

  // Update form values when initialData changes (for editing or duplicating)
  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setAmount(String(initialData.amount));
      setCategoryId(initialData.categoryId);
      setMemo(initialData.memo || '');
    } else {
      // Reset to defaults if no initialData (switching back to "Add")
      setDate(today);
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      setMemo('');
    }
  }, [initialData, categories, today]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    onSubmit({
      date,
      amount: Number(amount),
      categoryId,
      memo,
    });

    if (!initialData || isDuplicate) {
      setAmount('');
      setMemo('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.group}>
        <label className={styles.label}>日付</label>
        <input 
          type="date" 
          className={styles.input} 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className={styles.group}>
        <label className={styles.label}>金額 (円)</label>
        <input 
          type="number" 
          inputMode="numeric"
          className={`${styles.input} ${styles.inputAmount}`} 
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className={styles.group}>
        <label className={styles.label}>カテゴリー</label>
        <select 
          className={styles.select}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>メモ</label>
        <textarea 
          className={styles.textarea}
          placeholder="買い物の内容など..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <button type="submit" className={styles.submitButton}>
        {initialData && !isDuplicate ? '更新する' : '登録する'}
      </button>
    </form>
  );
}

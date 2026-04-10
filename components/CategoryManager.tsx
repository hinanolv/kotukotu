'use client';

import React, { useState } from 'react';
import { Category } from '@/types';
import styles from './CategoryManager.module.css';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
}

export default function CategoryManager({ categories, onAddCategory }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddCategory(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <span>🏷️</span> カテゴリー管理
      </h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          className={styles.input}
          placeholder="新しいカテゴリー名を入力..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className={styles.addButton}>
          追加
        </button>
      </form>

      <div className={styles.list}>
        {categories.map((category) => (
          <span key={category.id} className={styles.badge}>
            {category.name}
          </span>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { Category } from '@/types';
import styles from './CategoryDialog.module.css';
import { addCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/app/actions';
import { getColorForCategory } from '@/lib/colors';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#94a3b8', '#475569'
];

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdate: () => Promise<void>;
}

export default function CategoryDialog({ isOpen, onClose, categories, onUpdate }: CategoryDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSelectedColor(cat.color || PRESET_COLORS[0]);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setSelectedColor(PRESET_COLORS[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (editingId) {
        await updateCategoryAction(editingId, name.trim(), selectedColor);
      } else {
        await addCategoryAction(name.trim(), selectedColor);
      }
      await onUpdate();
      handleCancel();
    } catch (error: any) {
      alert(error.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このカテゴリーを削除しますか？')) return;

    setLoading(true);
    try {
      await deleteCategoryAction(id);
      await onUpdate();
    } catch (error: any) {
      alert(error.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>カテゴリー管理</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <h3 className={styles.sectionTitle}>登録済み</h3>
          <div className={styles.categoryList}>
            {categories.map(cat => (
              <div key={cat.id} className={styles.categoryItem}>
                <div 
                  className={styles.colorIndicator} 
                  style={{ backgroundColor: getColorForCategory(cat.name, cat.color) }}
                />
                <span className={styles.categoryName}>{cat.name}</span>
                <div className={styles.itemActions}>
                  <button className={styles.iconButton} onClick={() => handleEdit(cat)}>
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className={`${styles.iconButton} ${styles.deleteButton}`}
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 className={styles.sectionTitle}>
            {editingId ? 'カテゴリーを編集' : '新しいカテゴリーを追加'}
          </h3>
          <form onSubmit={handleSubmit} className={styles.addForm}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>名称</label>
              <input 
                className={styles.input}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例: 食費、日用品など"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>カラー</label>
              <div className={styles.colorPicker}>
                {PRESET_COLORS.map(color => (
                  <div 
                    key={color}
                    className={`${styles.colorOption} ${selectedColor === color ? styles.colorOptionSelected : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? '保存中...' : (editingId ? '更新する' : '追加する')}
            </button>
            {editingId && (
              <button type="button" className={styles.cancelEditButton} onClick={handleCancel}>
                キャンセル
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

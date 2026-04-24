import React, { useState, useEffect } from 'react';
import { Category, Transaction } from '@/types';
import styles from './AddTransactionForm.module.css';
import { Settings, Plus } from 'lucide-react';
import { addCategoryAction } from '@/app/actions';

interface AddTransactionFormProps {
  categories: Category[];
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onManageCategories: () => void;
  onRefreshCategories: () => Promise<void>;
  initialData?: Transaction | null;
  isDuplicate?: boolean;
}

export default function AddTransactionForm({ 
  categories, 
  onSubmit, 
  onManageCategories, 
  onRefreshCategories,
  initialData, 
  isDuplicate 
}: AddTransactionFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [memo, setMemo] = useState('');

  const [showInlineAdd, setShowInlineAdd] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#ef4444');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#94a3b8', '#475569'
  ];

  // Update form values when initialData changes (for editing or duplicating)
  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setAmount(String(initialData.amount));
      setCategoryId(initialData.categoryId);
      setMemo(initialData.memo || '');
    } else {
      setDate(today);
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      setMemo('');
    }
  }, [initialData, categories, today]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || categoryId === 'new') return;

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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'new') {
      setShowInlineAdd(true);
    } else {
      setCategoryId(val);
      setShowInlineAdd(false);
    }
  };

  const handleInlineAdd = async () => {
    if (!newCatName.trim()) return;
    setIsSubmittingCat(true);
    try {
      const newCat = await addCategoryAction(newCatName.trim(), newCatColor);
      await onRefreshCategories();
      setCategoryId(newCat.id);
      setShowInlineAdd(false);
      setNewCatName('');
    } catch (error) {
      alert('カテゴリーの追加に失敗しました。');
    } finally {
      setIsSubmittingCat(false);
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
        <div className={styles.labelHeader}>
          <label className={styles.label}>カテゴリー</label>
          <button 
            type="button" 
            className={styles.manageButton}
            onClick={onManageCategories}
          >
            <Settings size={14} /> 管理
          </button>
        </div>
        <select 
          className={styles.select}
          value={showInlineAdd ? 'new' : categoryId}
          onChange={handleCategoryChange}
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          <option value="new">＋ 新規追加...</option>
        </select>

        {showInlineAdd && (
          <div className={styles.inlineAddForm}>
            <input 
              type="text"
              className={styles.inlineInput}
              placeholder="カテゴリー名"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              autoFocus
            />
            
            <div className={styles.inlineColorPicker}>
              {PRESET_COLORS.map(color => (
                <div 
                  key={color}
                  className={`${styles.inlineColorOption} ${newCatColor === color ? styles.selected : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewCatColor(color)}
                />
              ))}
            </div>

            <div className={styles.inlineActions}>
              <button 
                type="button" 
                className={`${styles.inlineButton} ${styles.confirmButton}`}
                onClick={handleInlineAdd}
                disabled={isSubmittingCat}
              >
                {isSubmittingCat ? '追加中...' : '追加'}
              </button>
              <button 
                type="button" 
                className={`${styles.inlineButton} ${styles.cancelButton}`}
                onClick={() => setShowInlineAdd(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
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

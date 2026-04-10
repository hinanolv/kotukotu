import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import styles from './SummaryCard.module.css';

interface SummaryCardProps {
  total: number;
  budget: number;
  onUpdateBudget: (newBudget: number) => void;
}

export default function SummaryCard({ total, budget, onUpdateBudget }: SummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(budget));

  // Sync internal input state if budget prop changes
  useEffect(() => {
    setBudgetInput(String(budget));
  }, [budget]);

  const formattedTotal = total.toLocaleString();
  const percentage = Math.min((total / budget) * 100, 100);
  
  let fillClass = '';
  if (percentage >= 100) fillClass = styles.danger;
  else if (percentage >= 80) fillClass = styles.warning;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = Number(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      onUpdateBudget(newBudget);
      setIsEditing(false);
    }
  };

  return (
    <div className={styles.card}>
      <span className={styles.label}>今月の合計支出</span>
      <div className={styles.amount}>
        {formattedTotal}
        <span className={styles.currency}>円</span>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.budgetHeader}>
          <span>予算: {budget.toLocaleString()}円</span>
          <button 
            className={styles.budgetEditButton}
            onClick={() => setIsEditing(!isEditing)}
            aria-label="Edit budget"
          >
            <Edit3 size={14} /> 変更
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className={styles.editBudgetForm}>
            <input 
              type="number"
              className={styles.budgetInput}
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="新しい予算を入力"
              autoFocus
              required
              min="1"
            />
            <button type="submit" className={styles.saveButton}>保存</button>
          </form>
        ) : (
          <>
            <div className={styles.progressBarTrack}>
              <div 
                className={`${styles.progressBarFill} ${fillClass}`} 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {((total / budget) * 100).toFixed(1)}%
            </div>
          </>
        )}
      </div>
    </div>
  );
}

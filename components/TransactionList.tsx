import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Transaction, Category } from '@/types';
import styles from './TransactionList.module.css';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, categories, onEdit, onDelete }: TransactionListProps) {
  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || '未分類';
  };

  if (transactions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>取引データがありません</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>内容</th>
              <th className={styles.th}>メモ</th>
              <th className={styles.th} style={{textAlign: 'right'}}>金額</th>
              <th className={styles.th} style={{textAlign: 'right'}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className={styles.tr}>
                <td className={styles.td} data-label="内容">
                  <div className={styles.infoCell}>
                    <span className={styles.categoryBadge}>{getCategoryName(t.categoryId)}</span>
                    <span className={styles.dateText}>{t.date}</span>
                  </div>
                </td>
                <td className={styles.td} data-label="メモ">
                  <div className={styles.memo}>{t.memo || '-'}</div>
                </td>
                <td className={styles.td} data-label="金額">
                  <div className={styles.amount}>{t.amount.toLocaleString()}円</div>
                </td>
                <td className={styles.td} data-label="操作">
                    <div className={styles.actions}>
                        <button 
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => onEdit(t)}
                            aria-label="Edit transaction"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button 
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => onDelete(t.id)}
                            aria-label="Delete transaction"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

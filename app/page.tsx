'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Category, Transaction } from '@/types';
import SummaryCard from '@/components/SummaryCard';
import TransactionList from '@/components/TransactionList';
import ThemeToggle from '@/components/ThemeToggle';
import Drawer from '@/components/Drawer';
import AddTransactionForm from '@/components/AddTransactionForm';
import FAB from '@/components/FAB';
import MonthSwitcher from '@/components/MonthSwitcher';
import CategoryPieChart from '@/components/CategoryPieChart';
import ExportButton from '@/components/ExportButton';
import BackupButton from '@/components/BackupButton';
import CategoryDialog from '@/components/CategoryDialog';
import { useTheme } from '@/components/ThemeProvider';
import { UserButton } from "@clerk/nextjs";
import {
  fetchAllData, addCategoryAction, addTransactionAction,
  updateTransactionAction, deleteTransactionAction, updateBudgetAction
} from './actions';
import styles from './page.module.css';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: '食費' },
  { id: '2', name: '日用品' },
  { id: '3', name: '交際費' },
  { id: '4', name: '固定費' },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-04-01', amount: 1500, categoryId: '1', memo: 'ランチ' },
  { id: '2', date: '2026-04-02', amount: 3000, categoryId: '2', memo: 'ドラッグストア' },
  { id: '3', date: '2026-04-03', amount: 5000, categoryId: '3', memo: '飲み会' },
  { id: '4', date: '2026-04-05', amount: 120000, categoryId: '4', memo: '家賃' },
  { id: '5', date: '2026-03-31', amount: 2000, categoryId: '1', memo: '昨日の夕食' },
];

export default function Dashboard() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [isMounted, setIsMounted] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const refreshData = async () => {
    try {
      const data = await fetchAllData();
      setCategories(data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES);
      setTransactions(data.transactions.length > 0 ? data.transactions : DEFAULT_TRANSACTIONS);
      setBudgets(data.budgets);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => t.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredTransactions]);

  const currentBudget = budgets[selectedMonth] || 50000;

  const handleUpdateBudget = async (newBudget: number) => {
    setBudgets(prev => ({ ...prev, [selectedMonth]: newBudget }));
    await updateBudgetAction(selectedMonth, newBudget);
  };

  const handleOpenAddDrawer = () => {
    setEditingTransaction(null);
    setIsDuplicate(false);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (transaction: Transaction) => {
    if (window.confirm('この取引を編集しますか？')) {
      setEditingTransaction(transaction);
      setIsDuplicate(false);
      setIsDrawerOpen(true);
    }
  };

  const handleOpenDuplicateDrawer = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDuplicate(true);
    setIsDrawerOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('この取引を削除してもよろしいですか？')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      await deleteTransactionAction(id);
    }
  };

  const handleFormSubmit = async (data: Omit<Transaction, 'id'>) => {
    if (editingTransaction && !isDuplicate) {
      setTransactions(prev => prev.map(t =>
        t.id === editingTransaction.id ? { ...t, ...data } : t
      ));
      await updateTransactionAction(editingTransaction.id, data);
    } else {
      const tempId = Math.random().toString(36).substr(2, 9);
      const newTransaction: Transaction = { id: tempId, ...data };
      setTransactions(prev => [newTransaction, ...prev]);

      const savedTransaction = await addTransactionAction(data);
      setTransactions(prev => prev.map(t => t.id === tempId ? savedTransaction : t));
    }

    setIsDrawerOpen(false);
    setEditingTransaction(null);
    setIsDuplicate(false);

    const targetMonth = data.date.substring(0, 7);
    if (targetMonth !== selectedMonth) {
      setSelectedMonth(targetMonth);
    }
  };

  if (!isMounted) {
    return null; 
  }

  const logoSrc = theme === 'dark' ? '/kotukotu_dark_logo.png' : '/kotukotu_light_logo.png';

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1 className={styles.logoWrapper}>
              <img src={logoSrc} alt="Kotukotu" className={styles.logo} />
            </h1>
            <div className={styles.brandText}>
              <p className={styles.subtitle}>{selectedMonth.replace('-', '年')}月の支出状況</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <BackupButton />
            <ExportButton transactions={transactions} categories={categories} />
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.toolbar}>
          <MonthSwitcher currentMonth={selectedMonth} onChange={setSelectedMonth} />
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>取引履歴 ({selectedMonth.replace('-', '年')}月)</h2>
              </div>
              <TransactionList
                transactions={filteredTransactions}
                categories={categories}
                onEdit={handleOpenEditDrawer}
                onDelete={handleDeleteTransaction}
                onDuplicate={handleOpenDuplicateDrawer}
              />
            </section>
          </div>

          <div className={styles.sideColumn}>
            <SummaryCard
              total={totalAmount}
              budget={currentBudget}
              onUpdateBudget={handleUpdateBudget}
            />
            <CategoryPieChart
              transactions={filteredTransactions}
              categories={categories}
            />
          </div>
        </div>
      </div>

      <FAB onClick={handleOpenAddDrawer} />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingTransaction ? (isDuplicate ? '出費の複製' : '出費の編集') : '出費の登録'}
      >
        <AddTransactionForm
          categories={categories}
          onSubmit={handleFormSubmit}
          onManageCategories={() => setIsCategoryDialogOpen(true)}
          onRefreshCategories={refreshData}
          initialData={editingTransaction}
          isDuplicate={isDuplicate}
        />
      </Drawer>

      <CategoryDialog 
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        categories={categories}
        onUpdate={refreshData}
      />
    </main>
  );
}

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function fetchAllData() {
  const [categories, transactions, budgets] = await Promise.all([
    prisma.category.findMany(),
    prisma.transaction.findMany({
      orderBy: { date: 'desc' },
    }),
    prisma.budget.findMany(),
  ]);

  const formattedTransactions = transactions.map((t: any) => ({
    ...t,
    memo: t.memo === null ? undefined : t.memo,
  }));

  // Transform budgets array into a record map { "yyyy-mm": amount }
  const budgetRecord = budgets.reduce((acc: Record<string, number>, current: { month: string; amount: number }) => {
    acc[current.month] = current.amount;
    return acc;
  }, {});

  return { categories, transactions: formattedTransactions, budgets: budgetRecord };
}

function formatTransaction(t: any) {
  return {
    ...t,
    memo: t.memo === null ? undefined : t.memo,
  };
}

export async function addCategoryAction(name: string) {
  const newCategory = await prisma.category.create({
    data: { name },
  });
  return newCategory;
}

export async function addTransactionAction(data: { date: string; amount: number; categoryId: string; memo?: string }) {
  const newTransaction = await prisma.transaction.create({
    data: {
      date: data.date,
      amount: data.amount,
      categoryId: data.categoryId,
      memo: data.memo,
    },
  });
  return formatTransaction(newTransaction);
}

export async function updateTransactionAction(id: string, data: { date: string; amount: number; categoryId: string; memo?: string }) {
  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: {
      date: data.date,
      amount: data.amount,
      categoryId: data.categoryId,
      memo: data.memo,
    },
  });
  return formatTransaction(updatedTransaction);
}

export async function deleteTransactionAction(id: string) {
  await prisma.transaction.delete({
    where: { id },
  });
  return { success: true };
}

export async function updateBudgetAction(month: string, amount: number) {
  const upsertedBudget = await prisma.budget.upsert({
    where: { month },
    update: { amount },
    create: { month, amount },
  });
  return upsertedBudget;
}

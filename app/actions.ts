'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { Category, Transaction } from '@/types';

async function getUserIdOrThrow() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function fetchAllData() {
  const userId = await getUserIdOrThrow();

  // "Claim Logic": Assign orphaned records (userId is null) to the first user
  const orphanedCount = await prisma.transaction.count({ 
    where: { 
      OR: [{ userId: null }, { userId: 'anonymous' }] 
    } 
  });
  
  if (orphanedCount > 0) {
    const orphanFilter = { OR: [{ userId: null }, { userId: 'anonymous' }] };
    await prisma.$transaction([
      prisma.category.updateMany({ where: orphanFilter, data: { userId } }),
      prisma.transaction.updateMany({ where: orphanFilter, data: { userId } }),
      prisma.budget.updateMany({ where: orphanFilter, data: { userId } }),
    ]);
  }

  const [categories, transactions, budgets] = await Promise.all([
    prisma.category.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    }),
    prisma.budget.findMany({ where: { userId } }),
  ]);

  const formattedTransactions: Transaction[] = transactions.map((t) => ({
    id: t.id,
    date: t.date,
    amount: t.amount,
    categoryId: t.categoryId,
    memo: t.memo,
  }));

  const formattedCategories: Category[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
  }));

  const budgetRecord = budgets.reduce((acc: Record<string, number>, current: { month: string; amount: number }) => {
    acc[current.month] = current.amount;
    return acc;
  }, {});

  return { 
    categories: formattedCategories, 
    transactions: formattedTransactions, 
    budgets: budgetRecord 
  };
}

function formatTransaction(t: any): Transaction {
  return {
    id: t.id,
    date: t.date,
    amount: t.amount,
    categoryId: t.categoryId,
    memo: t.memo,
  };
}

export async function addCategoryAction(name: string, color?: string | null) {
  const userId = await getUserIdOrThrow();
  const newCategory = await prisma.category.create({
    data: { name, color, userId },
  });
  return newCategory;
}

export async function updateCategoryAction(id: string, name: string, color?: string | null) {
  const userId = await getUserIdOrThrow();
  const updatedCategory = await prisma.category.update({
    where: { id, userId },
    data: { name, color },
  });
  return updatedCategory;
}

export async function deleteCategoryAction(id: string) {
  const userId = await getUserIdOrThrow();
  
  // Check if there are transactions using this category
  const transactionCount = await prisma.transaction.count({
    where: { categoryId: id, userId }
  });

  if (transactionCount > 0) {
    throw new Error("このカテゴリーを使用している取引があるため削除できません。");
  }

  await prisma.category.delete({
    where: { id, userId },
  });
  return { success: true };
}

export async function addTransactionAction(data: Omit<Transaction, 'id'>) {
  const userId = await getUserIdOrThrow();
  const newTransaction = await prisma.transaction.create({
    data: {
      date: data.date,
      amount: data.amount,
      categoryId: data.categoryId,
      memo: data.memo,
      userId,
    },
  });
  return formatTransaction(newTransaction);
}

export async function updateTransactionAction(id: string, data: Omit<Transaction, 'id'>) {
  const userId = await getUserIdOrThrow();
  const updatedTransaction = await prisma.transaction.update({
    where: { id, userId }, // Ensure user owns the record
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
  const userId = await getUserIdOrThrow();
  await prisma.transaction.delete({
    where: { id, userId }, // Ensure user owns the record
  });
  return { success: true };
}

export async function updateBudgetAction(month: string, amount: number) {
  const userId = await getUserIdOrThrow();
  const upsertedBudget = await prisma.budget.upsert({
    where: { 
      month_userId: { month, userId } 
    },
    update: { amount },
    create: { month, amount, userId },
  });
  revalidatePath('/');
  return upsertedBudget;
}

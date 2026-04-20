import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), 'kakeibo_backup_20260410.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  console.log('🔄 インポートを開始します...');

  // 1. Categories
  console.log(`📁 カテゴリデータ (${data.categories.length}件) をインポート中...`);
  for (const cat of data.categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name },
      create: { id: cat.id, name: cat.name },
    });
  }

  // 2. Transactions
  console.log(`💰 取引データ (${data.transactions.length}件) をインポート中...`);
  for (const t of data.transactions) {
    await prisma.transaction.upsert({
      where: { id: t.id },
      update: {
        date: t.date,
        amount: t.amount,
        categoryId: t.categoryId,
        memo: t.memo || null,
      },
      create: {
        id: t.id,
        date: t.date,
        amount: t.amount,
        categoryId: t.categoryId,
        memo: t.memo || null,
      },
    });
  }

  // 3. Budgets
  const budgetMonths = Object.keys(data.budgets || {});
  console.log(`📊 予算データ (${budgetMonths.length}件) をインポート中...`);
  for (const month of budgetMonths) {
    const amount = data.budgets[month];
    await prisma.budget.upsert({
      where: { month_userId: { month, userId: 'anonymous' } },
      update: { amount },
      create: { month, amount, userId: 'anonymous' },
    });
  }

  console.log('✅ すべてのデータのインポートが完了しました！');
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

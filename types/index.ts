export type Category = {
  id: string;
  name: string;
  color?: string;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  categoryId: string;
  memo: string;
};

export type Theme = 'light' | 'dark';

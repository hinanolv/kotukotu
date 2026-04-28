export type Category = {
  id: string;
  name: string;
  color?: string | null;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  categoryId: string;
  memo?: string | null;
};

export type Theme = 'light' | 'dark';

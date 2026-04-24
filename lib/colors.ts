export const CATEGORY_COLORS: Record<string, string> = {
  '食費': '#ef4444',       // Red
  '日用品': '#10b981',     // Emerald
  '交際費': '#f59e0b',     // Amber
  '固定費': '#6366f1',     // Indigo
  '美容・衣服': '#ec4899',   // Pink
  '医療・保険': '#06b6d4',   // Cyan
  'その他': '#94a3b8',      // Slate
};

export const getColorForCategory = (name: string, customColor?: string): string => {
  if (customColor) return customColor;
  return CATEGORY_COLORS[name] || '#6366f1'; // Default to Indigo
};

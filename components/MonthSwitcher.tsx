'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import styles from './MonthSwitcher.module.css';

interface MonthSwitcherProps {
  currentMonth: string; // "YYYY-MM"
  onChange: (month: string) => void;
}

export default function MonthSwitcher({ currentMonth, onChange }: MonthSwitcherProps) {
  const [year, month] = currentMonth.split('-').map(Number);

  const goToPreviousMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth === 0) {
      newMonth = 12;
      newYear -= 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth === 13) {
      newMonth = 1;
      newYear += 1;
    }
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const options = [];
  const baseDate = new Date();
  for (let i = -24; i <= 24; i++) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const val = `${y}-${m}`;
    options.push({
      value: val,
      label: `${y}年 ${m}月`
    });
  }

  return (
    <div className={styles.container}>
      <button className={styles.navButton} onClick={goToPreviousMonth} aria-label="Previous month">
        <ChevronLeft size={20} />
      </button>

      <div className={styles.selectorWrapper}>
        <Calendar size={18} className={styles.calendarIcon} />
        <select 
          className={styles.select} 
          value={currentMonth}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button className={styles.navButton} onClick={goToNextMonth} aria-label="Next month">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

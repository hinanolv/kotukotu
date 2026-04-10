'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import styles from './FAB.module.css';

interface FABProps {
  onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button 
      className={styles.fab} 
      onClick={onClick}
      aria-label="Add transaction"
    >
      <Plus size={32} />
    </button>
  );
}

'use client';

import React from 'react';
import { SignInButton } from "@clerk/nextjs";
import { useTheme } from './ThemeProvider';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? '/kotukotu_dark_logo.png' : '/kotukotu_light_logo.png';

  return (
    <div className={styles.container} data-theme={theme}>
      <header className={styles.hero}>
        <div className={styles.logoWrapper}>
          <img src={logoSrc} alt="Kotukotu Logo" className={styles.logo} />
        </div>
        <h1 className={styles.title}>Kotukotu</h1>
        <p className={styles.description}>
          日々の支出を「コツコツ」記録して、<br />
          スマートにお金を管理する家計簿アプリです。
        </p>
        <SignInButton mode="modal" forceRedirectUrl="/">
          <button className={styles.cta}>はじめる</button>
        </SignInButton>
      </header>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📊</div>
          <h2 className={styles.featureTitle}>視覚的な分析</h2>
          <p className={styles.featureText}>
            円グラフや集計カードで、何にお金を使っているか一目で把握できます。
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>✍️</div>
          <h2 className={styles.featureTitle}>かんたん入力</h2>
          <p className={styles.featureText}>
            思い立った時にすぐ入力。カテゴリ分けも直感的に行えます。
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📱</div>
          <h2 className={styles.featureTitle}>PWA対応</h2>
          <p className={styles.featureText}>
            スマホのホーム画面に追加して、アプリのように快適に使えます。
          </p>
        </div>
      </div>
    </div>
  );
}

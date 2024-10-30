'use client'
import styles from "./page.module.css";
import React from 'react';
import Link from 'next/link';
import {
  Layout,
  Body,
  Header,
  Button,
  HeaderGroup,
  HeaderItem
} from "@bbollen23/brutal-paper";
import ThemeToggle from "@/app/ui/ThemeToggle";


export default function Home() {

  return (

    <div className={styles.home}>
      <div className={styles.container}>
        <div className={styles.title}>
          MuView
        </div>
        <div className={styles.subTitle}>
          A Music Review Visualization Platform.
        </div>
        <div className={styles.actionRow}>
          <Link href="/about"><Button label="About MuView" /></Link>
          <Link href="/dashboard"><Button label="Go To Dashboard" iconRight="bi bi-arrow-right" /></Link>
        </div>
        <a href='/api/auth/login'>Log In</a>
        {/* <img src='/logos/muview-logo-dark-alt.svg' width='200px' height='200px' /> */}
      </div>
    </div>
  )
}

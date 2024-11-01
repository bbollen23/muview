'use client'
import styles from "./page.module.css";
import React from 'react';
import Link from 'next/link';
import {
  Button,
} from "@bbollen23/brutal-paper";


export default function Home() {

  return (

    <div className={styles.home}>
      <div className={styles.container}>
        <div className={styles.title}>
          Mu<span style={{ color: 'hsl(var(--fuchsia-500))' }}>V</span>iew
        </div>
        <div className={styles.subTitle}>
          A Music Review Visualization Platform.
        </div>
        <div className={styles.actionRow}>
          <Link href="/about"><Button label="About MuView" /></Link>
          <Link href="/dashboard"><Button label="Go To Dashboard" iconRight="bi bi-arrow-right" /></Link>
        </div>
        {/* <a href='/api/auth/login'>Log In</a> */}
        {/* <img src='/logos/muview-logo-dark-alt.svg' width='200px' height='200px' /> */}
      </div>
    </div>
  )
}

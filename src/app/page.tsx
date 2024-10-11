'use client'

import styles from "./page.module.css";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layout,
  Body,
  Header,
  Button,
  HeaderGroup,
  Icon,
  HeaderItem
} from "@bbollen23/brutal-paper";
import ThemeToggle from "@/app/ui/ThemeToggle";


export default function Home() {

  return (
    <Layout className="smooth">
      <Header>
        <HeaderGroup alignment="right">
          <Link href="/about"><HeaderItem label="About" /></Link>
          <Link href="/contact"><HeaderItem label="Contact" /></Link>
          <Link href="/donate"><Button label="Donate" size="sm" /></Link>
          <Button label="Get Help" size="sm" />
          <ThemeToggle style={{ marginRight: '20px' }} />
        </HeaderGroup>
      </Header>
      <Body>
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
              <Link href="/dashboard"><Button label="Go To Dashboard" /></Link>
            </div>
          </div>
        </div>
      </Body>
    </Layout>
  )
}

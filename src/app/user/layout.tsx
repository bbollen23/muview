'use client'
import styles from "./layout.module.css";
import React from 'react';
import Link from 'next/link';
import {
    Layout,
    Body,
    Header,
    Button,
    HeaderGroup,
    HeaderItem,
} from "@bbollen23/brutal-paper";
import ThemeToggle from "@/app/ui/ThemeToggle";


export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <Layout className="smooth">
            <Header>
                <HeaderGroup alignment="right">
                    <Link href="/"><HeaderItem label="Home" /></Link>
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
                        <div style={{ marginBottom: '20px' }} className={styles.title}>
                            MuView
                        </div>
                        {children}
                    </div>
                </div>
            </Body>
        </Layout>
    )
}

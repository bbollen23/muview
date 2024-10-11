'use client'

import React from 'react';
import {
    Layout,
    Body,
    Header,
    Button,
    HeaderGroup,
    HeaderItem,
    HeaderTitle
} from "@bbollen23/brutal-paper";
import Link from 'next/link';
import ThemeToggle from "@/app/ui/ThemeToggle";


export default function GeneralLayout({ children }: { children: React.ReactNode }) {

    return (
        <Layout className="smooth">
            <Header>
                <HeaderTitle><Link href="/">MuView</Link></HeaderTitle>
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
                {children}
            </Body>
        </Layout>
    )
}

'use client'

import React from 'react';
import {
    Layout,
    Body,
    Header,
    HeaderTitle
} from "@bbollen23/brutal-paper";
import Link from 'next/link';
import { HeaderComponent } from '@/app/ui';


export default function GeneralLayout({ children }: { children: React.ReactNode }) {

    return (
        <Layout className="smooth">
            <Header>
                <HeaderTitle><Link href="/">MuView</Link></HeaderTitle>
                <HeaderComponent />
            </Header>
            <Body>
                {children}
            </Body>
        </Layout>
    )
}

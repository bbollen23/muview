'use client'

import React, { useState } from 'react';
import {
    Layout,
    Body,
    Header,
    HeaderTitle,
    Sidebar,
    SidebarItem,
    Divider,
    SidebarSectionTitle
} from "@bbollen23/brutal-paper";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeaderComponent } from '@/app/ui';


export default function GeneralLayout({ children }: { children: React.ReactNode }) {

    const pathname = usePathname();
    const router = useRouter();
    const name = pathname.split('/')[1] || 'home';
    const pageName = name.charAt(0).toUpperCase() + name.slice(1)

    const [highlightedPage, setHighlightedPage] = useState<string>('/howitworks')

    const handleSidebarItemClick = (page: string) => {
        setHighlightedPage(page);
        router.push(page);
    }

    return (
        <Layout className={`${pageName === 'Howitworks' ? 'sidebar container' : 'smooth'}`}>
            <Header>
                <HeaderTitle>
                    <Link href="/">
                        Mu<span style={{ color: 'hsl(var(--fuchsia-500))' }}>V</span>iew
                    </Link>
                </HeaderTitle>
                <HeaderComponent />
            </Header>
            <Body>
                {children}
            </Body>
            {
                pageName === 'Howitworks' && (
                    <Sidebar>
                        <SidebarSectionTitle>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>How It Works</div>
                        </SidebarSectionTitle>
                        <SidebarItem highlighted={highlightedPage === '/howitworks'} onClick={() => handleSidebarItemClick('/howitworks')}>
                            <div style={{ padding: '5px 0px' }}>Overview</div>
                        </SidebarItem>
                        <SidebarItem highlighted={highlightedPage === '/howitworks/publications'} onClick={() => handleSidebarItemClick('/howitworks/publications')}>
                            <div style={{ padding: '5px 0px' }}>Publications</div>
                        </SidebarItem >
                        <SidebarItem highlighted={highlightedPage === '/howitworks/thedashboard'} onClick={() => handleSidebarItemClick('/howitworks/thedashboard')}>
                            <div style={{ padding: '5px 0px' }}>The Dashboard</div>
                        </SidebarItem>
                        <SidebarItem highlighted={highlightedPage === '/howitworks/filteringalbums'} onClick={() => handleSidebarItemClick('/howitworks/filteringalbums')}>
                            <div style={{ padding: '5px 0px' }}>Filtering Albums</div>
                        </SidebarItem>
                        {/* <SidebarItem highlighted={highlightedPage === '/howitworks/downloadinglists'} onClick={() => handleSidebarItemClick('/howitworks/downloadinglists')}>
                            <div style={{ padding: '5px 0px' }}>Downloading Lists</div>
                        </SidebarItem> */}
                    </Sidebar>
                )
            }
        </Layout>
    )
}
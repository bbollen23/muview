'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from "./layout.module.css";
import {
    Layout,
    Body,
    Header,
    HeaderItem,
    Button,
    HeaderTitle,
    Icon,
    HeaderGroup,
    Drawer,
    DrawerHeader,
    DrawerItem,
    Scrollable,
} from "@bbollen23/brutal-paper";
import ThemeToggle from '@/app/ui/ThemeToggle';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const name = pathname.split('/').pop() || 'home';
    const pageName = name.charAt(0).toUpperCase() + name.slice(1)

    const [drawerOpened, setDrawerOpened] = useState<boolean>(false);

    const toggleDrawer = () => {
        setDrawerOpened((prev) => !prev);
    }

    return (
        <Layout className='no-right-margin no-left-margin no-footer'>
            <Header>
                <HeaderTitle><Icon icon='bi bi-list' onClick={toggleDrawer} style={{ marginRight: '10px' }} /><Link href="/">MuView</Link></HeaderTitle>
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
                <div className={pageName === 'Publications' ? styles.dashboardContainerFull : styles.dashboardContainer}>
                    <div className={styles.pageContainer}>
                        <h1 style={{ marginTop: 0 }}>{pageName}</h1>
                        {children}
                    </div>
                    {pageName !== 'Publications' ? <Scrollable style={{ border: '1px solid var(--theme-border-color)' }} width='100%' height='100%'>
                        <div className={styles.albumsContainer}>

                        </div>
                    </Scrollable> : null
                    }

                </div>
            </Body>
            <Drawer opened={drawerOpened} closeOnOutside onChange={setDrawerOpened} >
                <DrawerHeader title="MuView" closeButton />
                <DrawerItem icon="bi bi-bar-chart-line-fill" label="Dashboard" onClick={() => { router.push("/dashboard"); toggleDrawer(); }} />
                <DrawerItem icon="bi bi-file-richtext" label="Edit Publications" onClick={() => { router.push("/dashboard/publications"); toggleDrawer(); }} />
                <DrawerItem icon="bi bi-bar-chart-steps" label="Filters" />
                <DrawerItem icon="bi bi-database-add" label="Selections" />
            </Drawer>
        </Layout>
    )
}

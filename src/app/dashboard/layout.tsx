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
    LoadingOverlay,
    Input
} from "@bbollen23/brutal-paper";
import ThemeToggle from '@/app/ui/ThemeToggle';
import { useDataStore } from '@/providers/data-store-provider';
import type { DataStore } from '@/stores/data-store';
import AlbumList from '@/app/ui/AlbumList';


export default function InnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const name = pathname.split('/').pop() || 'home';
    const pageName = name.charAt(0).toUpperCase() + name.slice(1)

    const [drawerOpened, setDrawerOpened] = useState<boolean>(false);

    const toggleDrawer = () => {
        setDrawerOpened((prev) => !prev);
    }

    const loading = useDataStore((state: DataStore) => state.loading)


    return (
        <Layout className='no-right-margin no-left-margin no-footer'>
            <LoadingOverlay visible={loading} />
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h1 style={{ marginTop: 0 }}>{pageName}</h1>
                            {pageName !== 'publications' ? <div>Viewing reviews for 2023</div> : null}
                        </div>
                        {children}
                    </div>
                    {pageName !== 'Publications' ?
                        <div className={styles.albumListAreaContainer}>
                            <h1 style={{ marginLeft: '20px', marginTop: 0 }}>Albums Selected</h1>
                            <AlbumList />
                        </div>
                        : null
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

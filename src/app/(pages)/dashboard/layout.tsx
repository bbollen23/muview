'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from "./layout.module.css";
import {
    Layout,
    Body,
    Header,
    HeaderTitle,
    Icon,
    Drawer,
    DrawerHeader,
    DrawerItem,
    LoadingOverlay,
    Divider,
} from "@bbollen23/brutal-paper";
// import ThemeToggle from '@/app/ui/ThemeToggle';
import { HeaderComponent } from '@/app/ui';
import { useDataStore } from '@/providers/data-store-provider';
import type { DataStore } from '@/stores/data-store';
import { AlbumList } from '@/app/ui';


export default function InnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const name = pathname.split('/').pop() || 'home';
    const pageName = name.charAt(0).toUpperCase() + name.slice(1)

    const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
    const toggleDrawer = () => {
        setDrawerOpened((prev) => !prev);
    }

    const loading = useDataStore((state: DataStore) => state.loading);


    const pagesWithOutAlbumList = ['Publications', 'User']
    const albumListRendered = (page_name: string): boolean => {
        return !pagesWithOutAlbumList.includes(page_name);
    }

    return (
        <Layout className='no-right-margin no-left-margin no-footer'>
            <LoadingOverlay visible={loading} />
            <Header>
                <HeaderTitle>
                    <Icon icon='bi bi-list' onClick={toggleDrawer} style={{ marginRight: '10px' }} />
                    <Link href="/">
                        Mu<span style={{ color: 'hsl(var(--fuchsia-500))' }}>V</span>iew
                    </Link>
                </HeaderTitle>
                <HeaderComponent />
            </Header>
            <Body>
                <div className={albumListRendered(pageName) ? styles.dashboardContainer : styles.dashboardContainerFull}>
                    <div className={styles.pageContainer}>
                        {pageName !== 'Filters' ? <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h1 style={{ marginTop: 0 }}>
                                {pageName}
                            </h1>
                        </div> : null}
                        {children}
                    </div>
                    {albumListRendered(pageName) ?
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
                <DrawerItem icon="bi bi-bar-chart-line-fill" label="Dashboard" onClick={() => { toggleDrawer(); router.push("/dashboard") }} />
                <DrawerItem icon="bi bi-file-richtext" label="Edit Publications" onClick={() => { toggleDrawer(); router.push("/dashboard/publications"); }} />
                <DrawerItem icon="bi bi-bar-chart-steps" label="Filters" onClick={() => { toggleDrawer(); router.push("/dashboard/filters"); }} />
                <Divider />
                <DrawerItem icon="bi bi-person-square" label="Profile" onClick={() => { toggleDrawer(); router.push("/dashboard/user"); }} />

                <a href="/api/auth/logout"><div
                    className='link'
                    style={{ marginLeft: '20px', marginTop: '20px', cursor: 'pointer' }}
                >
                    Sign Out
                </div>
                </a>
            </Drawer>
        </Layout>
    )
}

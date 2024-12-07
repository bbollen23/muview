'use client'
import { Scrollable } from '@bbollen23/brutal-paper';
import { usePathname } from 'next/navigation';
import React from 'react';

type pages = 'howitworks' | 'publications' | 'thedashboard' | 'filteringalbums' | 'downloadinglists';

const pageNameMapping: Record<pages, string> = {
    'howitworks': 'Overview',
    'publications': 'Publications',
    'thedashboard': 'The Dashboard',
    'filteringalbums': 'Filtering Albums',
    'downloadinglists': 'Downloading Lists'
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {

    const pathname = usePathname();
    const name = pathname.split('/').pop() || 'home';
    const pageName = pageNameMapping[name as pages]

    return (
        <Scrollable height='calc(100vh - 150px)' width='100%'>
            <h1 style={{ fontSize: '3.0rem' }}>{pageName === 'Howitworks' ? 'Overview' : pageName}</h1>
            {children}
        </Scrollable>
    )
}
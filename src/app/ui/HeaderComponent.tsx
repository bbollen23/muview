'use client'

import React from 'react';
import Link from 'next/link';
import {
    HeaderItem,
    Button,
    HeaderGroup,

} from "@bbollen23/brutal-paper";
import ThemeToggle from '@/app/ui/ThemeToggle';
import { useUser, type UserContext } from '@auth0/nextjs-auth0/client';
import { usePathname } from 'next/navigation';

interface LoginComponentProps {
    authData: UserContext,
    pathName: string
}

const LoginComponent = ({ authData, pathName }: LoginComponentProps) => {
    if (authData.isLoading) return null;
    if (authData.error) return null;
    if (authData.user) {
        return (
            <>
                {pathName.includes('dashboard') ? null : <Link href="/dashboard"><Button label="Dashboard" size="sm" /></Link>}
                {pathName.includes('dashboard') ? null : <Link href="/dashboard/user"><Button label="Profile" size="sm" /></Link>}
                <a href='/api/auth/logout'><Button label="Sign Out" size="sm" /></a>
            </>
        )
    }
    return <Link href="/dashboard"><Button label="Login" size="sm" /></Link>

}

export default function HeaderComponent() {
    const authData = useUser();
    const pathname = usePathname();


    return (
        <>
            <HeaderGroup alignment="left">
                <Link href="/about"><HeaderItem label="About" /></Link>
                <Link href="/projectgoals"><HeaderItem label="Project Goals" /></Link>
                <Link href="/contact"><HeaderItem label="Contact" /></Link>
            </HeaderGroup>
            <HeaderGroup alignment="right">
                <Link href="/donate"><Button label="Donate" size="sm" /></Link>
                <LoginComponent authData={authData} pathName={pathname} />
                <ThemeToggle style={{ marginRight: '20px' }} />
            </HeaderGroup>
        </>
    )
}

// Providers.tsx
"use client"; // This directive tells Next.js this component is client-side

import React from 'react';
import { NotificationProvider } from "@bbollen23/brutal-paper";
import { ThemeProvider } from '@/providers/theme-provider';
// import { DataStoreProvider } from '@/providers/data-store-provider';

interface ProvidersProps {
    children: React.ReactNode; // Specify the type for children
}


const Providers = ({ children }: ProvidersProps): JSX.Element => {
    return (
        <NotificationProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </NotificationProvider>
    );
};

export default Providers;
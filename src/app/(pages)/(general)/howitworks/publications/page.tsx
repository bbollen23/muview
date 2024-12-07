'use client'
import { useTheme } from '@/providers/theme-provider';
import React from 'react';

export default function HowItWorksOverview() {
    const { theme } = useTheme();
    return (
        <>
            <p>Publications are the starting point for finding albums. They are meant to narrow down the search of finding an album you'd like to listen to be removing the 'noise' caused by publications that you don&apos;t care about.</p>
            <p>When you first enter the dashboard, you'll be prompted to select from a list of publications. There is no limit to the amount of publications you can select. They can also be added or removed at any time by navigating back to the "Edit Publications" page from the left-hand drawer.</p>
            <p>When you select a publication, a new chart will be added to your Dashboard page. Initially, this does not select any albums for you. Continue on to next page to learn how to start sifting through albums.</p>
        </>
    )
}
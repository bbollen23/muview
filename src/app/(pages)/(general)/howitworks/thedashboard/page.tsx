'use client'
import { useTheme } from '@/providers/theme-provider';
import React from 'react';

export default function HowItWorksOverview() {
    const { theme } = useTheme();
    return (
        <>
            <p>The Dashboard is the meat of all that is MuView. Here, you can interact with the review distribution histograms to look for albums that are within specific score ranges for the selected publications.</p>
            <p>The main view is a set of histograms which shows the number of albums for each possible rating for your selected publications. When you click on a bar in any of the histograms, you will populate the "Album List" with the albums that received a score within the selected range for that publication.</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', margin: '50px 0px' }}>
                <img width='100%' src={theme === 'dark' ? "/images/dashboard-dark.png" : "/images/dashboard-light.png"}></img>
            </div>
        </>
    )
}
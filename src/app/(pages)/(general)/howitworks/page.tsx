'use client'
import { useTheme } from '@/providers/theme-provider';
import React from 'react';

export default function HowItWorksOverview() {
    const { theme } = useTheme();
    return (
        <>
            <p>MuView is a Music Review visualization platform. Instead of using aggregate sites such as Metacritic to find albums, MuView provides you with much more detailed and nuanced information while also allowing the user to choose which publications they find important. Below is the general idea of how MuView Works.</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', margin: '50px 0px' }}>
                <img width='100%' src={theme === 'dark' ? "/images/design-dark.png" : "/images/design-light.png"}></img>
            </div>
            <div>
                <p>MuView allows you to select from a list of publications to populate your dashboard. From there, you can select specific score ranges in each publication. This will populate the Album list with all the albums that fit into those ranges. Afterwards, you can apply additional filtering by genre, or you can apply filtering by groups.</p>
                <p>Filtering by groups allows you to find albums which fall into the range of several scores from multiple publications. For example, you can find all albums that received a score of 80 or above on all of your chosen publications, or find divisive albums by doing the opposite.</p>
            </div>
        </>
    )
}
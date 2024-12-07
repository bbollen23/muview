'use client'
import { Scrollable } from '@bbollen23/brutal-paper';
import React from 'react';

export default function About() {
    return (
        <Scrollable height='calc(100vh - 200px)' width='100%'>
            <h1 style={{ fontSize: '3.0rem' }}>About</h1>
            <p style={{ fontSize: '1.2rem' }}>MuView is a Music Review visualization platform. Instead of using aggregate sites such as Metacritic to find albums, MuView provides you with much more detailed and nuanced information while also allowing the user to choose which publications they find important.</p>
            <p style={{ fontSize: '1.2rem' }}>This project was first envisioned in 2018 during a Data Visualization graduate course. In this course, I fell in love with all aspects of data visualization and found an intense interest in web applications. After years of putting this project off due to work, life, and graduate school, I&apos;ve finally found the time to create and maintain this application as a side project.</p>
        </Scrollable>
    )
}
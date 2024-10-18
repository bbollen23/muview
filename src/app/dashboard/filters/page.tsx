'use client'
import styles from "./page.module.css";
import { Icon, Tabs, Scrollable, Button } from "@bbollen23/brutal-paper";
import Link from 'next/link';
import { useDataStore } from "@/providers/data-store-provider";
import { useState } from "react";
import { UpsetPlot } from "@/app/ui";


const FiltersPage = (): JSX.Element => {

    const selectedAlbumIds = useDataStore((state) => state.selectedAlbumIds);
    const selectedAlbumIdsRankings = useDataStore((state) => state.selectedAlbumIdsRankings);

    const pillColors = [
        '#2dd4bf', //teal 400,
        '#84cc16', // lime 500,
        '#d946ef', //fuchsia 500
        '#9d174d', //pink 800,
        '#fb7185', // rose 400,
        '#7c3aed', // purple 600
    ]


    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', height: 'calc(100vh - 160px)' }}>
            <div style={{ padding: '10px', boxSizing: 'border-box', height: '100%', width: '100%', backgroundColor: 'var(--bp-theme-card-background-color)', border: '2px solid var(--bp-theme-border-color)' }}>
                {Object.keys(selectedAlbumIds).length == 0 && Object.keys(selectedAlbumIdsRankings).length === 0 ?
                    null : <UpsetPlot />
                }
            </div>
            <div style={{ border: '2px solid var(--bp-theme-border-color)', backgroundColor: 'var(--bp-theme-card-background-color)', marginLeft: '10px', }}>
                <div style={{ marginTop: '20px', marginLeft: '20px' }}>
                    <div style={{ 'backgroundColor': pillColors[0] }} className={styles.pill}>
                        Pitchfork, 2023, 75-85
                    </div>
                    <div style={{ 'backgroundColor': pillColors[1] }} className={styles.pill}>
                        Pitchfork, 2023, 75-85
                    </div>
                    <div style={{ 'backgroundColor': pillColors[2] }} className={styles.pill}>
                        Pitchfork, 2023, 75-85
                    </div>
                    <div style={{ 'backgroundColor': pillColors[3] }} className={styles.pill}>
                        Pitchfork, 2023, 75-85
                    </div>
                    <div style={{ 'backgroundColor': pillColors[4] }} className={styles.pill}>
                        Pitchfork, 2023, 75-85
                    </div>
                    <div style={{ 'backgroundColor': pillColors[5] }} className={styles.pill}>
                        Pitchfork, 2023, 75-85
                    </div>

                </div>
            </div>
        </div>
    )
}

export default FiltersPage;
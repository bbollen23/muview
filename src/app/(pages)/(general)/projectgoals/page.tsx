


'use client'
import { Card, Scrollable, Icon } from '@bbollen23/brutal-paper';
import styles from './page.module.scss'
import React from 'react';

export default function ProjectGoals() {
    return (
        <Scrollable height='calc(100vh - 200px)' width='100%'>
            <h1 style={{ fontSize: '3.0rem' }}>Project Goals</h1>
            <p>The goal of this project is to bring as much detailed information into each album as possible and make MuView accessible to anyone interested in finding new music. Because of this, we&apos;ve separated the goals of MuView into three chunks:</p>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Card title={<div style={{ paddingTop: '20px' }}>Personalized Profiles</div>}>
                    <div className={styles.bulletPoints}>
                        <div className={styles.bulletPoint}>
                            <Icon type='none' size="sm" dense icon='bi bi-check-circle-fill' style={{ color: 'green' }} />
                            <div>Basic authentication and authorization</div>
                        </div>
                        <div className={styles.bulletPoint}>
                            <Icon type='none' size="sm" dense icon='bi bi-check-circle-fill' style={{ color: 'green' }} />
                            <div>Saving albums</div>
                        </div>
                        <div className={styles.bulletPoint}>
                            <Icon type='none' size="sm" dense icon='bi bi-circle' />
                            <div>Caching state of application </div>
                        </div>
                        <div className={styles.bulletPoint}>
                            <Icon type='none' size="sm" dense icon='bi bi-circle' />
                            <div>Rating Albums </div>
                        </div>

                    </div>
                </Card>
                <Card title={<div style={{ paddingTop: '20px' }}>Spotify API</div>}>
                    <div className={styles.bulletPoints}>
                        <div className={styles.bulletPoint}>
                            <Icon type='none' size="sm" dense icon='bi bi-circle' />
                            <div>Use spotify API for additional metadata</div>
                        </div>
                        <div className={styles.bulletPoint}>
                            <Icon type='none' size="sm" dense icon='bi bi-circle' />
                            <div>Filter based on Spotify popularity rankings</div>
                        </div>
                        <div className={styles.bulletPoint}>
                            <Icon type='none' size="sm" dense icon='bi bi-circle' />
                            <div>Generating playlists from Album lists</div>
                        </div>
                    </div>
                </Card>
                <Card title={<div style={{ paddingTop: '20px' }}>Additional Integration</div>}>
                    <div className={styles.bulletPoints}>
                        <div className={styles.bulletPoint}>
                            <Icon type='none' size="sm" dense icon='bi bi-circle' />
                            <div>RYM API Integration</div>
                        </div>
                        <div className={styles.bulletPoint}>
                            <Icon type='none' size="sm" dense icon='bi bi-circle' />
                            <div>Filtering based on liked albums and proximity</div>
                        </div>
                    </div>
                </Card>

            </div>
            <p>Since this is currently a one-person project, there is no specific deadline for meeting each of these goals. </p>
        </Scrollable>
    )
}
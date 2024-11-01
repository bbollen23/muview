import React from 'react';
import { getSession } from "@auth0/nextjs-auth0";
import { fetchUserAlbums } from '@/app/lib/data';
import styles from './page.module.scss'
import AlbumsSaved from './AlbumsSaved';


export default async function UserLayout() {
    const session = await getSession();
    const userAlbums = session?.user ? await fetchUserAlbums(session.user.email) : null;


    return (
        session?.user && (
            <div className={styles.userContainer}>
                <div className={styles.body}>
                    <h1>Albums Saved</h1>
                    {userAlbums && userAlbums.length > 0 ? <AlbumsSaved userEmail={session.user.email} userAlbums={userAlbums} /> : <div>No Albums To Show</div>}
                </div>
            </div>
        )
    )
}

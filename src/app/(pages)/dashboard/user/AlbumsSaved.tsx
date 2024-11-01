'use client'

import { Icon, Tooltip } from '@bbollen23/brutal-paper'
import styles from './page.module.scss'
import type { Album } from '@/app/lib/definitions'
import { deleteAlbums } from '@/app/lib/actions'
import { useState } from 'react'

interface AlbumsSavedProps {
    userAlbums: Album[],
    userEmail: string
}

export default function AlbumsSaved({ userAlbums, userEmail }: AlbumsSavedProps) {

    const [albums, setAlbums] = useState<Album[]>(userAlbums);

    const handleOnDeleteAlbum = async (album_id: number) => {
        // Might want to set loading here
        const removedAlbumId = await deleteAlbums(userEmail, [album_id])
        setAlbums(prev => prev.filter(album => album.id !== removedAlbumId[0]))
    }

    return (
        <table className={styles.albumsSaved}>
            <thead className={styles.albumsSavedHeader}>
                <tr>
                    <th>Album Name</th>
                    <th>Artists</th>
                    <th>Release Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {albums ? (
                    albums.map((album: Album) => <tr key={`album-saved-${album.id}`} className={styles.albumsSavedRow}>
                        <td>{album.album_title}</td>
                        <td>{album.artists.join(', ')}</td>
                        <td>{new Date(album.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td><Tooltip content='Remove Album'><Icon onClick={() => handleOnDeleteAlbum(album.id)} icon='bi bi-trash' size="sm" /></Tooltip></td>
                    </tr>)
                ) : (
                    <tr><td>No Albums Found</td></tr>
                )}
            </tbody>
        </table>
    )
}
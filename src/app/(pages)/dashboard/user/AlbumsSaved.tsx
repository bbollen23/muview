'use client'

import { Icon, Tooltip } from '@bbollen23/brutal-paper'
import styles from './page.module.scss'
import type { Album } from '@/app/lib/definitions'
import { deleteAlbums } from '@/app/lib/actions'
import { useState } from 'react'
import { useTheme } from '@/providers/theme-provider'
import clsx from 'clsx'
import { AlbumDetailModal } from '@/app/ui'
import type { SelectedAlbumInfo } from '@/app/ui/AlbumList/component'
import { AlbumWithScore, Review, Ranking } from '@/app/lib/definitions'

interface AlbumsSavedProps {
    userAlbums: Album[],
    userEmail: string
}


export default function AlbumsSaved({ userAlbums, userEmail }: AlbumsSavedProps) {
    const { theme } = useTheme();
    const [albums, setAlbums] = useState<Album[]>(userAlbums);

    const [modalOpened, setModalOpened] = useState<boolean>(false);
    const [selectedAlbumInfo, setSelectedAlbumInfo] = useState<SelectedAlbumInfo | null>(null);



    const toggleModal = () => {
        setModalOpened(prev => !prev)
    }

    const handleAlbumClick = (album: AlbumWithScore, reviews: Review[], rankings: Ranking[], avgScore: number) => {
        setSelectedAlbumInfo({
            album,
            reviews,
            rankings,
            avgScore
        })
        toggleModal();
    }

    const handleCloseModal = () => {
        setSelectedAlbumInfo(null);
    }

    const handleOnDeleteAlbum = async (album_id: number) => {
        // Might want to set loading here
        const removedAlbumId = await deleteAlbums(userEmail, [album_id])
        setAlbums(prev => prev.filter(album => album.id !== removedAlbumId[0]))
    }

    return (
        <>
            <table className={theme === 'dark' ? clsx(styles.albumsSaved, styles.darkMode) : styles.albumsSaved}>
                <thead className={styles.albumsSavedHeader}>
                    <tr>
                        <th>Album Name</th>
                        <th>Artists</th>
                        <th>Release Date</th>
                        <th>Links</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {albums ? (
                        albums.map((album: Album) => {
                            const albumWithScore: AlbumWithScore = { ...album, avg_score: 3, reviews: [] }
                            return (
                                <tr key={`album-saved-${album.id}`} className={styles.albumsSavedRow}>
                                    <td>{album.album_title}</td>
                                    <td>{album.artists.join(', ')}</td>
                                    <td>{new Date(album.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            {album.spotify_url && (
                                                <Tooltip size='sm' content='Spotify'>
                                                    <a href={album.spotify_url} target="_blank"><Icon icon='bi bi-spotify' size='sm' /></a>
                                                </Tooltip>
                                            )}
                                            {album.apple_music_url && (
                                                <Tooltip size='sm' content='Apple Music'>
                                                    <a href={album.apple_music_url} target="_blank"><Icon icon='bi bi-apple' size='sm' /></a>
                                                </Tooltip>
                                            )}
                                            {album.bandcamp_url && (
                                                <Tooltip size='sm' content='Bandcamp'>
                                                    <div className={styles.imageIcon}>
                                                        <a href={album.bandcamp_url} target="_blank" style={{ width: '25px', height: '25px' }}>
                                                            {theme === 'dark' ? <img src='/images/logos/bandcamp-dark.png' width='25px' height='25px' /> : <img src='/images/logos/bandcamp-light.png' width='25px' height='25px' />}
                                                        </a>
                                                    </div>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <Tooltip content='View Album'>
                                            <Icon onClick={() => handleAlbumClick(albumWithScore, [], [], 0)} icon='bi bi-box-arrow-up-right' size="sm" />
                                        </Tooltip>
                                        <Tooltip content='Remove Album'>
                                            <Icon onClick={() => handleOnDeleteAlbum(album.id)} icon='bi bi-trash' size="sm" />
                                        </Tooltip>
                                    </td>
                                </tr>
                            )
                        })
                    ) : (
                        <tr><td>No Albums Found</td></tr>
                    )}
                </tbody>
            </table >
            <AlbumDetailModal
                modalOpened={modalOpened}
                setModalOpened={setModalOpened}
                handleCloseModal={handleCloseModal}
                selectedAlbumInfo={selectedAlbumInfo?.album}
            />
        </>

    )
}
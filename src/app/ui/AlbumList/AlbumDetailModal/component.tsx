import styles from '../component.module.scss';
import { Modal, ModalContent, ModalHeader, Button, LoadingIcon, Icon, Tooltip } from '@bbollen23/brutal-paper';
import type { Publication, Album } from '@/app/lib/definitions';
import React, { type Dispatch, type SetStateAction } from 'react';
import AlbumReviewsChart from './AlbumReviewsChart';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/fetcher';
import { useTheme } from '@/providers/theme-provider';
import { useDataStore } from '@/providers/data-store-provider';


interface AlbumDetailModalProps {
    modalOpened: boolean;
    setModalOpened: Dispatch<SetStateAction<boolean>>;
    handleCloseModal: () => void;
    selectedAlbumInfo?: Album;
    SaveAlbumButton?: React.ComponentType;
}

export interface AlbumReviewData {
    name: string,
    id: number,
    score: number,
    publication_id: number
}

interface FetchedData {
    albumReviews: AlbumReviewData[];
}

interface AlbumReviewChartWrapperProps {
    loading: boolean;
    chartColorScheme: string[];
    publications: Publication[];
    data?: FetchedData

}




const AlbumReviewChartWrapper = ({ loading, chartColorScheme, publications, data }: AlbumReviewChartWrapperProps) => {
    if (loading) return (
        <div style={{ width: '625px', height: '250px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '1.0rem' }}>Loading Reviews</div><LoadingIcon visible={true} />
        </div>
    )
    if (data && data.albumReviews) {
        return <AlbumReviewsChart chartColorScheme={chartColorScheme} reviews={data.albumReviews} publicationsSelected={publications} />
    }
}

interface AlbumLinksProps {
    selectedAlbumInfo?: Album;
    theme: string
}

const AlbumLinks = ({ selectedAlbumInfo, theme }: AlbumLinksProps) => {
    if (!selectedAlbumInfo) return <></>
    const spotify_url = selectedAlbumInfo.spotify_url;
    const apple_music_url = selectedAlbumInfo.apple_music_url;
    const bandcamp_url = selectedAlbumInfo.bandcamp_url;


    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '10px' }}>

            {spotify_url && (
                <Tooltip size='sm' content='Spotify'><a href={spotify_url} target="_blank"><Icon icon='bi bi-spotify' size='sm' /></a></Tooltip>
            )}
            {apple_music_url && (
                <Tooltip size='sm' content='Apple Music'><a href={apple_music_url} target="_blank"><Icon icon='bi bi-apple' size='sm' /></a></Tooltip>
            )}
            {bandcamp_url && (
                <Tooltip size='sm' content='Bandcamp'>
                    <div className={styles.imageIcon}>
                        <a href={bandcamp_url} target="_blank" style={{ width: '25px', height: '25px' }}>
                            {theme === 'dark' ? <img src='/images/logos/bandcamp-dark.png' width='25px' height='25px' /> : <img src='/images/logos/bandcamp-light.png' width='25px' height='25px' />}
                        </a>
                    </div>
                </Tooltip>
            )}
        </div>
    )
}


const AlbumDetailModal = (
    {
        modalOpened,
        setModalOpened,
        handleCloseModal,
        selectedAlbumInfo,
        SaveAlbumButton
    }: AlbumDetailModalProps
) => {


    const { data: reviewData, isLoading: isReviewDataLoading } = useSWR(
        selectedAlbumInfo?.id ? `/api/albumReviews?album_id=${selectedAlbumInfo?.id}` : null,
        fetcher
    )

    const publicationsSelected = useDataStore((state) => state.publicationsSelected);
    const chartColorScheme = useDataStore((state) => state.chartColorScheme);


    // selectedAlbumInfo?: Album;
    // publicationsSelected: Publication[];
    // chartColorScheme: string[];
    // SaveAlbumButton?: React.ComponentType

    const { theme } = useTheme();


    return (
        <Modal
            style={{ width: '700px' }}
            opened={modalOpened}
            setOpened={setModalOpened}
            onClose={handleCloseModal}
            closeOnOutside
            actions={
                <>
                    {SaveAlbumButton && <SaveAlbumButton />}
                    <Button flat label='Close' onClick={() => setModalOpened(false)} />
                </>
            }>
            <ModalHeader
                closeButton={true}
                title={selectedAlbumInfo?.album_title}
            />
            <ModalContent style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {selectedAlbumInfo?.album_title}
                        </div>
                        <div style={{ fontSize: '1.2rem' }}>
                            {selectedAlbumInfo?.artists.join(', ')}
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <b>Genres:</b> {selectedAlbumInfo?.genres.join(', ')}
                        </div>
                        <div>
                            <b>Subgenres:</b> {selectedAlbumInfo?.subgenres.join(', ')}
                        </div>
                        <div>
                            <b>Release Date:</b> {selectedAlbumInfo ? new Date(selectedAlbumInfo.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className={styles.img} style={{ width: '100px', minWidth: '100px', height: '100px', fontSize: '1.0rem' }}>
                            No Image Available
                        </div>
                        <AlbumLinks selectedAlbumInfo={selectedAlbumInfo} theme={theme} />
                    </div>
                </div>
                <div style={{ marginTop: "50px" }}>
                    <AlbumReviewChartWrapper data={reviewData} publications={publicationsSelected} loading={isReviewDataLoading} chartColorScheme={chartColorScheme} />
                </div>
            </ModalContent>
        </Modal>
    )
}

export default AlbumDetailModal;
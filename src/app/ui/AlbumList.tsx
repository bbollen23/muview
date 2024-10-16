'use client'
import styles from "./albumsList.module.css";
import { LoadingIcon, useNotification, Scrollable, Input, Icon, Tooltip } from "@bbollen23/brutal-paper";
import { type DataStore } from '../../stores/data-store'
import { useDataStore } from "@/providers/data-store-provider";
import type { Album, AlbumsSelected, Review, AlbumsSelectedRankings, Ranking } from "../lib/definitions";
import { useRef, useEffect, useState } from "react";
import AlbumElement from "./Album";



const getUniqueList = (albumsSelected: AlbumsSelected, albumsSelectedRankings: AlbumsSelectedRankings): Album[] => {
    const uniqueDataMap = new Map<string, Album>(); // Use a map to keep track of unique items

    Object.values(albumsSelected).forEach(binnedAlbums => {
        Object.values(binnedAlbums).flat().forEach(album => {
            uniqueDataMap.set(`${album.id}`, album); // Use property1 as a unique key
        });
    });

    Object.entries(albumsSelectedRankings).forEach(([key, albums]) => {
        albums.forEach((album: Album) => {
            uniqueDataMap.set(`${album.id}`, album); // Use album.id as a unique key
        });
    });

    return Array.from(uniqueDataMap.values()); // Return unique items as an array
};

const AlbumList = () => {
    const { notify } = useNotification();
    const loadingAlbums = useDataStore((state: DataStore) => state.loadingAlbums);
    const albumsSelected = useDataStore((state: DataStore) => state.albumsSelected);
    const albumsSelectedRankings = useDataStore((state: DataStore) => state.albumsSelectedRankings);

    const reviews = useDataStore((state: DataStore) => state.reviews);
    const rankings = useDataStore((state: DataStore) => state.rankings);

    const flatReviews = Object.values(reviews).flat();
    const flatRankings = Object.values(rankings).flat();

    const getReviews = (album: Album): Review[] => {
        let reviews: Review[] = [];
        flatReviews.forEach((review: Review) => {
            if (review.album_id === album.id) {
                reviews.push(review)
            }
        })
        return reviews;
    }

    const getRankings = (album: Album): Ranking[] => {
        let rankings: Ranking[] = [];
        flatRankings.forEach((ranking: Ranking) => {
            if (ranking.album_id === album.id) {
                rankings.push(ranking)
            }
        })
        return rankings;
    }


    const [searchTermAlbum, setSearchTermAlbum] = useState<string>('');
    const [initialized, setInitialized] = useState<boolean>(false)
    const totalAlbumList = getUniqueList(albumsSelected, albumsSelectedRankings);
    const albumList = totalAlbumList.filter((album: Album) => album.album_title.toLowerCase().includes(searchTermAlbum.toLowerCase()) || album.artists.join(',').toLowerCase().includes(searchTermAlbum.toLowerCase()));
    const previousAlbumListRef = useRef<Album[]>([]); // or whatever type albumList is

    useEffect(() => {
        const previousAlbumList = previousAlbumListRef.current;

        // Exit when data is initializing on load. No need for notifications.
        if (!initialized) {
            setInitialized(true);
            previousAlbumListRef.current = albumList;
            return;
        }

        let newAlbumsCount = totalAlbumList.filter(album =>
            !previousAlbumList.map(entry => entry.id).includes(album.id)
        ).length;

        if (newAlbumsCount > 0) {
            notify({
                message: `Added ${newAlbumsCount} albums`,
                type: "success"
            })
        } else {
            newAlbumsCount = previousAlbumList.filter(album =>
                !totalAlbumList.map(entry => entry.id).includes(album.id)
            ).length;
            if (newAlbumsCount > 0) {
                notify({
                    message: `Removed ${newAlbumsCount} albums`,
                    type: "success"
                })
            }
        }

        previousAlbumListRef.current = totalAlbumList;

    }, [totalAlbumList])

    const handleSearchTermAlbumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermAlbum(event.target.value); // Update the search term state
    };



    return (

        <div className={styles.albumsContainer}>
            <div className={styles.albumSelectorArea}>
                <Input label="Search" placeholder="Search Albums" value={searchTermAlbum} onChange={handleSearchTermAlbumChange} />
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <b>Showing {`${albumList.length}/${totalAlbumList.length}`} Albums</b>
                    <div style={{ display: 'flex' }}>
                        <Tooltip size="sm" content='Clear albums'><Icon icon='bi bi-trash' size='sm' /></Tooltip>
                        <Tooltip size="sm" content='Download as CSV'><Icon icon='bi bi-download' size='sm' /></Tooltip>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', }}>
                    <div>Album</div>
                    <div>Selected Avg Score</div>
                </div>
            </div>
            <Scrollable width='100%' height='calc(100vh - 320px)'>
                {loadingAlbums ?
                    <div className={styles.loadingAlbumsContainer}>
                        <div style={{ fontSize: '1.2rem;' }}>Loading</div><LoadingIcon visible={true} />
                    </div>
                    : albumList.length > 0 ?
                        albumList.map((album: Album) => {
                            return (
                                <AlbumElement album={album} reviews={getReviews(album)} rankings={getRankings(album)} />
                            )
                        })
                        :
                        <div>
                        </div>
                }
            </Scrollable>

        </div>
    )
}

export default AlbumList


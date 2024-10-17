'use client'
import styles from "./albumsList.module.css";
import { LoadingIcon, useNotification, Scrollable, Input, Icon, Tooltip } from "@bbollen23/brutal-paper";
import { type DataStore } from '../../stores/data-store'
import { useDataStore } from "@/providers/data-store-provider";
import type { Album, Review, Ranking, AlbumIdsSelected, AlbumIdsSelectedRanking } from "../lib/definitions";
import { useRef, useEffect, useState } from "react";
import AlbumElement from "./Album";
import useSWR from "swr";
import { fetcher } from '@/app/lib/fetcher';




const getUniqueList = (albumsSelected: AlbumIdsSelected, albumsSelectedRankings: AlbumIdsSelectedRanking): number[] => {
    const uniqueIdSet = new Set<number>(); // Use a set to keep track of unique album IDs

    // Iterate over each year in albumsSelected
    Object.entries(albumsSelected).forEach(([year, pubIdAlbums]) => {
        // Iterate over each pub id
        Object.entries(pubIdAlbums).forEach(([pubId, binnedAlbums]) => {
            // Get values of each bin (which is list of albumIds)
            Object.values(binnedAlbums).forEach((albumIds) => {
                // ids is an array of numbers (album IDs)
                albumIds.forEach(albumId => {
                    uniqueIdSet.add(albumId); // Add the album ID to the set
                });
            });
        });
    });

    Object.entries(albumsSelectedRankings).forEach(([year, pubIdAlbums]) => {
        Object.entries(pubIdAlbums).forEach(([pubId, albumIds]) => {
            albumIds.forEach((albumId => {
                uniqueIdSet.add(albumId);
            }))
        })
    })

    return Array.from(uniqueIdSet); // Return unique items as an array
};

const AlbumList = () => {
    const { notify } = useNotification();


    const selectedAlbumIds = useDataStore((state: DataStore) => state.selectedAlbumIds);
    const selectedAlbumIdsRankings = useDataStore((state: DataStore) => state.selectedAlbumIdsRankings)

    const reviews = useDataStore((state: DataStore) => state.reviews);
    const rankings = useDataStore((state: DataStore) => state.rankings);


    const flatAlbumIds = getUniqueList(selectedAlbumIds, selectedAlbumIdsRankings);
    const { data, isLoading, error } = useSWR(
        flatAlbumIds.length > 0 ? `/api/albums?album_ids=${flatAlbumIds}` : null,
        fetcher)

    const getReviews = (album: Album): Review[] => {
        let reviewsArray: Review[] = []; // Initialize an array to hold reviews for the specified album

        // Iterate through each year in the reviews object
        Object.values(reviews).forEach(pubIdByYear => {
            // Iterate through each publication ID's reviews
            Object.values(pubIdByYear).forEach(reviewList => {
                // Check each review in the current publication's review list
                reviewList.forEach((review: Review) => {
                    if (review.album_id === album.id) {
                        reviewsArray.push(review); // Add review to the array if it matches the album ID
                    }
                });
            });
        });

        return reviewsArray; // Return the array of reviews for the specified album
    };

    const getRankings = (album: Album): Ranking[] => {
        let rankingsArray: Ranking[] = [];

        Object.values(rankings).forEach(pubIdByYear => {
            // Iterate through each publication ID's reviews
            Object.values(pubIdByYear).forEach(rankingList => {
                // Check each review in the current publication's review list
                rankingList.forEach((ranking: Ranking) => {
                    if (ranking.album_id === album.id) {
                        rankingsArray.push(ranking); // Add review to the array if it matches the album ID
                    }
                });
            });
        });

        return rankingsArray;
    }

    const [searchTermAlbum, setSearchTermAlbum] = useState<string>('');
    const previousAlbumListRef = useRef<Album[]>([]); // or whatever type albumList is
    const [totalAlbums, setTotalAlbums] = useState<Album[]>([]);
    const albumList: Album[] = totalAlbums.filter((entry: Album) => entry.album_title.toLowerCase().includes(searchTermAlbum.toLowerCase()) || entry.artists.join(",").toLowerCase().includes(searchTermAlbum.toLowerCase()))

    // Can use unique list instead of list of albums. Will be easier.
    useEffect(() => {
        if (data && data.albums) {
            const previousAlbumList = previousAlbumListRef.current;

            let newAlbumsCount = data.albums.filter((album: Album) =>
                !previousAlbumList.map(entry => entry.id).includes(album.id)
            ).length;

            if (newAlbumsCount > 0) {
                notify({
                    message: `Added ${newAlbumsCount} albums`,
                    type: "success"
                })
            } else {
                newAlbumsCount = previousAlbumList.filter(album =>
                    !data.albums.map((entry: Album) => entry.id).includes(album.id)
                ).length;
                if (newAlbumsCount > 0) {
                    notify({
                        message: `Removed ${newAlbumsCount} albums`,
                        type: "success"
                    })
                }
            }

            previousAlbumListRef.current = data.albums;

            //For searching
            setTotalAlbums(data.albums);
        }


    }, [data])

    const handleSearchTermAlbumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermAlbum(event.target.value); // Update the search term state
    };




    return (

        <div className={styles.albumsContainer}>
            <div className={styles.albumSelectorArea}>
                <Input label="Search" placeholder="Search Albums" value={searchTermAlbum} onChange={handleSearchTermAlbumChange} />
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {data && data.albums.length > 0 ? <b>Showing {`${albumList.length}/${totalAlbums.length}`} Albums</b> : <div></div>}
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
                {isLoading ?
                    <div className={styles.loadingAlbumsContainer}>
                        <div style={{ fontSize: '1.2rem;' }}>Loading</div><LoadingIcon visible={true} />
                    </div>
                    : albumList.map((album: Album) => {
                        return (
                            // <div></div>
                            <AlbumElement key={album.id} album={album} reviews={getReviews(album)} rankings={getRankings(album)} />
                        )
                    })
                }
            </Scrollable>

        </div>
    )
}

export default AlbumList


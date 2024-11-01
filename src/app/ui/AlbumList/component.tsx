'use client'
import styles from "./component.module.scss";
import { LoadingIcon, useNotification, Scrollable, Input, Icon, Tooltip, IconDropdown, Modal, Button, ModalHeader, ModalContent } from "@bbollen23/brutal-paper";
import { type DataStore } from '@/stores/data-store'
import { useDataStore } from "@/providers/data-store-provider";
import type { Album, Review, Ranking, AlbumIdsSelected, AlbumIdsSelectedRanking, AlbumWithScore, Publication } from "@/app/lib/definitions";
import { useRef, useEffect, useState } from "react";
import AlbumComponent from "@/app/ui/AlbumList/Album";
import useSWR from "swr";
import { fetcher } from '@/app/lib/fetcher';
import { getAlbumIdsFromFilters } from "@/app/lib/filterAlbums";
import { downloadCsv } from "@/app/lib/downloadCsv";
import { addAlbums } from "@/app/lib/actions";
import { useUser, UserContext } from '@auth0/nextjs-auth0/client';



const getUniqueList = (albumsSelected: AlbumIdsSelected, albumsSelectedRankings: AlbumIdsSelectedRanking): number[] => {
    const uniqueIdSet = new Set<number>(); // Use a set to keep track of unique album IDs

    // Iterate over each year in albumsSelected
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(albumsSelected).forEach(([_year, pubIdAlbums]) => {
        // Iterate over each pub id
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(pubIdAlbums).forEach(([_pubId, binnedAlbums]) => {
            // Get values of each bin (which is list of albumIds)
            Object.values(binnedAlbums).forEach((albumIds) => {
                // ids is an array of numbers (album IDs)
                albumIds.forEach(albumId => {
                    uniqueIdSet.add(albumId); // Add the album ID to the set
                });
            });
        });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(albumsSelectedRankings).forEach(([_year, pubIdAlbums]) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(pubIdAlbums).forEach(([_pubId, albumIds]) => {
            albumIds.forEach((albumId => {
                uniqueIdSet.add(albumId);
            }))
        })
    })

    return Array.from(uniqueIdSet); // Return unique items as an array
};

interface SelectedAlbumInfo {
    album: AlbumWithScore,
    reviews: Review[],
    rankings: Ranking[],
    avgScore: number,
}

const AlbumList = () => {
    const { notify } = useNotification();
    const authData: UserContext = useUser();

    const selectedAlbumIds = useDataStore((state: DataStore) => state.selectedAlbumIds);
    const selectedAlbumIdsRankings = useDataStore((state: DataStore) => state.selectedAlbumIdsRankings)
    const selectedFilters = useDataStore((state: DataStore) => state.selectedFilters);
    const publicationsSelected = useDataStore((state: DataStore) => state.publicationsSelected);
    const chartColorScheme = useDataStore((state: DataStore) => state.chartColorScheme);

    const reviews = useDataStore((state: DataStore) => state.reviews);
    const rankings = useDataStore((state: DataStore) => state.rankings);


    const flatAlbumIds = selectedFilters.length === 0 ? getUniqueList(selectedAlbumIds, selectedAlbumIdsRankings) :
        getAlbumIdsFromFilters(selectedFilters);



    const { data: albumData, isLoading: isAlbumsLoading } = useSWR(
        `/api/albums?album_ids=${flatAlbumIds}`,
        fetcher)

    /**
     * For future me sake:
     * 
     * We have a local state for the userAlbumIds. Whenever we fetch the user albums, we replace this state with the state from the table.
     * 
     * When we save an album, we immediately update the local state. Thats because the useSWR will not automatically get triggered and we shouldn't be doing this in a way that's like "update database -> wait for response -> refetch". We should separately update the state.
     * 
     * So, the useSWR call is essentially re-hydrating our local userAlbumIds. But we interact with this state separately as well. This is the standard for how we should handle interacting with fetched data.
     */

    const { data: userAlbums } = useSWR(
        authData && authData.user ? `/api/userAlbums?email=${authData.user.email}` : null,
        fetcher)

    const getReviews = (album: Album): Review[] => {
        const reviewsArray: Review[] = []; // Initialize an array to hold reviews for the specified album

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
        const rankingsArray: Ranking[] = [];

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

    const [sortBy, setSortBy] = useState<string | null>(null)
    const [selectedAlbumInfo, setSelectedAlbumInfo] = useState<SelectedAlbumInfo | null>(null);
    const [localUserAlbumIds, setLocalUserAlbumIds] = useState<number[]>([]);
    const [modalOpened, setModalOpened] = useState<boolean>(false);


    // Hydrate localUserAlbumIds with data from fetching
    useEffect(() => {
        if (userAlbums) {
            const userAlbumIds = userAlbums.albums.map((album: Album) => album.id)
            setLocalUserAlbumIds(userAlbumIds)
        }
    }, [userAlbums])


    const albumList: AlbumWithScore[] = totalAlbums
        .filter((entry: Album) =>
            entry.album_title.toLowerCase().includes(searchTermAlbum.toLowerCase()) ||
            entry.artists.join(",").toLowerCase().includes(searchTermAlbum.toLowerCase())
        )
        .map(album => {
            // Calculate average score
            const reviews = getReviews(album)

            const albumWithScore = {
                ...album,
                avgScore: 0,
                reviews
            }
            let avgScore = 0;
            if (albumWithScore.reviews && albumWithScore.reviews.length > 0) {
                const totalScore = albumWithScore.reviews.reduce((sum, review) => sum + parseFloat(review.score.toString()), 0);
                avgScore = Math.round((totalScore / albumWithScore.reviews.length)) / 10; // Set average score
            }
            return {
                ...albumWithScore,
                avg_score: avgScore
            } as AlbumWithScore;
        });

    const handleOnSortByChange = (entry: string) => {
        setSortBy(entry);
    }

    // Sort the filtered album list
    const sortedAlbumList: AlbumWithScore[] = albumList.sort((a, b) => {
        if (sortBy === 'Title') {
            return a.album_title.localeCompare(b.album_title); // Sort alphabetically by title
        } else if (sortBy === 'Avg. Score') {
            return (b.avg_score || 0) - (a.avg_score || 0); // Sort by average score descending
        } else if (sortBy === 'Release Date') {
            return new Date(b.release_date).getTime() - new Date(a.release_date).getTime(); // Sort by release date descending
        } else if (sortBy === 'Artist') {
            return a.artists.join(",").localeCompare(b.artists.join(",")); // Sort by artist names
        }
        // Add other sorting options here as needed (e.g., Release Date, Avg. Score, Artist)
        return 0; // Default case
    });



    // Can use unique list instead of list of albums. Will be easier.
    useEffect(() => {
        if (albumData && albumData.albums) {
            const previousAlbumList = previousAlbumListRef.current;

            let newAlbumsCount = albumData.albums.filter((album: Album) =>
                !previousAlbumList.map(entry => entry.id).includes(album.id)
            ).length;

            if (newAlbumsCount > 0) {
                notify({
                    message: `Added ${newAlbumsCount} albums`,
                    type: "success"
                })
            } else {
                newAlbumsCount = previousAlbumList.filter(album =>
                    !albumData.albums.map((entry: Album) => entry.id).includes(album.id)
                ).length;
                if (newAlbumsCount > 0) {
                    notify({
                        message: `Removed ${newAlbumsCount} albums`,
                        type: "success"
                    })
                }
            }

            previousAlbumListRef.current = albumData.albums;

            //For searching
            setTotalAlbums(albumData.albums);
        }


    }, [albumData])

    const handleSearchTermAlbumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermAlbum(event.target.value); // Update the search term state
    };




    const toggleModal = () => {
        setModalOpened((prev) => !prev);
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

    const handleDownloadCsv = () => {
        notify({
            "message": `Downloading information for ${sortedAlbumList.length} albums`,
            "type": "info"
        })
        downloadCsv(sortedAlbumList, publicationsSelected);
    }

    const handleSaveAlbum = async () => {
        if (authData && authData.user && authData.user.email && selectedAlbumInfo) {
            setLocalUserAlbumIds(prev => [...prev, selectedAlbumInfo.album.id])
            await addAlbums(authData.user.email, [selectedAlbumInfo.album.id])
        }
    }

    const SaveAlbumButton = () => {
        if (selectedAlbumInfo && userAlbums) {

            const saved = localUserAlbumIds.includes(selectedAlbumInfo.album.id)

            const disabled = !authData.user || saved


            return (
                <Button disabled={disabled} flat label={saved ? 'Saved' : 'Save Album'} onClick={handleSaveAlbum} />
            )
        }

        return null
    }

    return (

        <div className={styles.albumsContainer}>
            <div className={styles.albumSelectorArea}>
                <Input label="Search" placeholder="Search Albums" value={searchTermAlbum} onChange={handleSearchTermAlbumChange} />
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {albumData && albumData.albums.length > 0 ? <b>Showing {`${albumList.length}/${totalAlbums.length}`} Albums</b> : <b>Showing 0/0 Albums</b>}
                    <div style={{ display: 'flex' }}>
                        <Tooltip size="sm" timeoutLength={1000} content='Sort By'>
                            <IconDropdown
                                dropDownList={['Avg. Score', 'Release Date', 'Title', 'Artist']} size="sm"
                                icon='bi bi-funnel'
                                onChange={handleOnSortByChange}
                            />
                        </Tooltip>
                        <Tooltip size="sm" content='Download as CSV'>
                            <Icon icon='bi bi-download' size='sm' onClick={handleDownloadCsv} />
                        </Tooltip>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', }}>
                    <div>Album</div>
                    <div>Selected Avg Score</div>
                </div>
            </div>
            <Scrollable width='100%' height='calc(100vh - 340px)'>
                {isAlbumsLoading ?
                    <div className={styles.loadingAlbumsContainer}>
                        <div style={{ fontSize: '1.2rem' }}>Loading</div><LoadingIcon visible={true} />
                    </div>
                    : sortedAlbumList.map((album: AlbumWithScore) => {
                        const rankings = getRankings(album)
                        return (
                            <AlbumComponent onClick={() => handleAlbumClick(album, album.reviews, rankings, album.avg_score)} avgScore={album.avg_score} key={album.id} album={album} reviews={album.reviews} rankings={rankings} />
                        )
                    })
                }
            </Scrollable>
            <Modal
                style={{ width: '700px' }}
                opened={modalOpened}
                setOpened={setModalOpened}
                onClose={handleCloseModal}
                closeOnOutside
                actions={
                    <>
                        <SaveAlbumButton />
                        <Button flat label='Close' onClick={toggleModal} />
                    </>
                }>
                <ModalHeader
                    closeButton={true}
                    title={selectedAlbumInfo?.album.album_title}
                />
                <ModalContent style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {selectedAlbumInfo?.album.album_title}
                            </div>
                            <div style={{ fontSize: '1.2rem' }}>
                                {selectedAlbumInfo?.album.artists.join(', ')}
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <b>Genres:</b> {selectedAlbumInfo?.album.genres.join(', ')}
                            </div>
                            <div>
                                <b>Subgenres:</b> {selectedAlbumInfo?.album.subgenres.join(', ')}
                            </div>
                            <div>
                                <b>Release Date:</b> {selectedAlbumInfo ? new Date(selectedAlbumInfo.album.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                            </div>
                        </div>
                        <div className={styles.img} style={{ width: '100px', minWidth: '100px', height: '100px', fontSize: '1.0rem' }}>
                            No Image Available
                        </div>
                    </div>
                    <div className={styles.reviewSection}>
                        {selectedAlbumInfo?.reviews.map((review: Review) => (
                            <div key={`${review.id}`} className={styles.review}>
                                <div className={styles.publicationName}>
                                    {<div>{publicationsSelected.filter((publication: Publication) => review.publication_id === publication.id)[0].name}</div>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: "10px" }}>
                                    <div className={styles.score} style={{ color: 'hsl(var(--gray-100))', backgroundColor: chartColorScheme[publicationsSelected.findIndex(item => item.id === review.publication_id)] }}>
                                        {review.score}
                                    </div>
                                    {selectedAlbumInfo?.rankings.find((entry: Ranking) => entry.publication_id == review.publication_id) ? <div className={styles.score} style={{ color: 'hsl(var(--gray-100))', backgroundColor: chartColorScheme[publicationsSelected.findIndex(item => item.id === review.publication_id)] }}>
                                        #{selectedAlbumInfo?.rankings.find((entry: Ranking) => entry.publication_id == review.publication_id)?.rank}
                                    </div> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default AlbumList


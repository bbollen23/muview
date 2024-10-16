import React, { useState } from 'react';
import ReactDom from 'react-dom';
import styles from "./albumsList.module.css";
import type { Album, Review, Publication, Ranking } from '../lib/definitions';
import { useDataStore } from "@/providers/data-store-provider";
import { type DataStore } from '../../stores/data-store'

interface Position {
    left: number;
    top: number;
}

interface AlbumElementProps {
    album: Album,
    reviews: Review[],
    rankings: Ranking[]
}


const AlbumElement = ({ album, reviews, rankings }: AlbumElementProps): JSX.Element => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<Position>({ left: 0, top: 0 });
    const publicationsSelected = useDataStore((state: DataStore) => state.publicationsSelected);
    const chartColorScheme = useDataStore((state: DataStore) => state.chartColorScheme)

    let avg = 0;
    reviews.forEach((review: Review) => {
        avg = avg + parseFloat(review.score.toString());
    })

    avg = Math.round((avg / reviews.length)) / 10;

    const handleMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
        const targetElement = event.currentTarget;
        const targetRect = targetElement.getBoundingClientRect(); // Get the dimensions and position of the target element

        const viewportHeight = window.innerHeight;


        let positionLeft = targetRect.left - 520;
        let positionTop = targetRect.top - 120;
        if (positionTop + 300 > viewportHeight) {
            positionTop = viewportHeight - 330;
        }

        setPosition({
            left: positionLeft, // Center the tooltip based on its width
            top: positionTop// Position it above the element, accounting for height
        });
        setVisible(true);
    }

    const handleMouseOut = () => {
        setVisible(false);
    }

    return (
        <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            {visible &&
                ReactDom.createPortal(
                    <div
                        className={styles.albumToolTip}
                        style={{ top: `${position.top}px`, left: `${position.left}px` }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '40px', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {album.album_title}
                                </div>
                                <div style={{ marginTop: '10px', fontSize: '1.2rem' }}>
                                    {album.artists.join(',')}
                                </div>
                            </div>
                            <div className={styles.img} style={{ width: '100px', minWidth: '100px', height: '100px', fontSize: '1.0rem' }}>
                                No Image Available
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                            <div>
                                <b>Genres:</b> {album.genres.join(',')}
                            </div>
                            <div>
                                <b>Subgenres:</b> {album.subgenres.join(',')}
                            </div>
                            <div>
                                <b>Release Date:</b> {new Date(album.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                        <div className={styles.reviewSection}>
                            {reviews.map((review: Review) => (
                                <div className={styles.review}>
                                    <div className={styles.publicationName}>
                                        {<div>{publicationsSelected.filter((publication: Publication) => review.publication_id === publication.id)[0].name}</div>}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: "10px" }}>
                                        <div className={styles.score} style={{ color: 'hsl(var(--gray-100))', backgroundColor: chartColorScheme[publicationsSelected.findIndex(item => item.id === review.publication_id)] }}>
                                            {review.score}
                                        </div>
                                        {rankings.find((entry: Ranking) => entry.publication_id == review.publication_id) ? <div className={styles.score} style={{ color: 'hsl(var(--gray-100))', backgroundColor: chartColorScheme[publicationsSelected.findIndex(item => item.id === review.publication_id)] }}>
                                            #{rankings.find((entry: Ranking) => entry.publication_id == review.publication_id)?.rank}
                                        </div> : null}
                                    </div>



                                </div>
                            ))}
                        </div>
                    </div>, document.body
                )}
            <div className={styles.album}>
                <div className={styles.left}>
                    <div className={styles.img}>
                        No Image Available
                    </div>
                    <div className={styles.info}>
                        <div className={styles.albumTitle}>
                            {album.album_title}
                        </div>
                        <div className={styles.artist}>
                            {album.artists.join(',')}
                        </div>
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.review}>
                        <div style={{ marginTop: 0, fontSize: '0.9rem', marginRight: '5px' }} className={styles.score}>{avg}</div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default AlbumElement;
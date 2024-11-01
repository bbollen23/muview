import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from "../component.module.scss";
import type { Album, Review, Publication, Ranking } from '@/app/lib/definitions';
import { useDataStore } from "@/providers/data-store-provider";
import { type DataStore } from '@/stores/data-store'
import clsx from 'clsx';

interface Position {
    left: number;
    top: number;
}

interface AlbumComponentProps {
    album: Album,
    reviews: Review[],
    rankings: Ranking[],
    avgScore: number,
    onClick?: () => void;
}


const AlbumComponent = ({ onClick, avgScore, album, reviews, rankings }: AlbumComponentProps): JSX.Element => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<Position>({ left: 0, top: 0 });
    const publicationsSelected = useDataStore((state: DataStore) => state.publicationsSelected);
    const chartColorScheme = useDataStore((state: DataStore) => state.chartColorScheme)

    const handleMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
        const targetElement = event.currentTarget;
        const targetRect = targetElement.getBoundingClientRect(); // Get the dimensions and position of the target element


        //Height: reviews.length * 40 + 20

        // x = 2, y = 88px x = 3 132px means y = 44x

        const viewportHeight = window.innerHeight;

        const val = ((reviews.length * 44) - 52) / 2
        const positionLeft = targetRect.width + 40;
        let positionTop = targetRect.top - val;
        // let positionTop = targetRect.top
        if (positionTop + (reviews.length * 44) > viewportHeight) {
            positionTop = targetRect.top - 2 * val - 5; //5 for adding some 'padding'
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

    const AlbumToolTip = () => {
        return (
            <div
                style={{
                    top: `${position.top}px`,
                    right: `${position.left}px`,
                }}
                className={clsx(styles.albumToolTipSmall, visible ? styles.visible : null)}
            >

                {reviews.map((review: Review) => {
                    const currPublication = publicationsSelected.find((publication: Publication) => review.publication_id === publication.id);
                    const pubIndex = publicationsSelected.findIndex(item => item.id === currPublication?.id);
                    return (
                        <div key={`tooltip-${review.id}`} style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', justifyContent: 'flex-start', margin: '5px 0px' }}>
                            <img
                                className='pub-icon'
                                src={`/images/${currPublication?.unique_name}.webp`}
                                width="30px"
                                height="30px"
                            />
                            <div className={styles.score} style={{ color: 'hsl(var(--gray-100))', backgroundColor: chartColorScheme[pubIndex], width: '30px', height: '30px', marginTop: 0, border: '2px solid black' }}>
                                {review.score}
                            </div>
                            {rankings.find((entry: Ranking) => entry.publication_id == review.publication_id) ? <div className={styles.score} style={{ color: 'hsl(var(--gray-100))', backgroundColor: chartColorScheme[pubIndex], width: '30px', height: '30px', marginTop: 0, border: '2px solid black' }}>
                                #{rankings.find((entry: Ranking) => entry.publication_id == review.publication_id)?.rank}
                            </div> : null}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} onClick={onClick}>
            {visible && ReactDOM.createPortal(
                <AlbumToolTip />, document.body
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
                        <div className={styles.artist} style={{ marginTop: '5px' }}>
                            {new Date(album.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.review}>
                        <div style={{ marginTop: 0, fontSize: '0.9rem', marginRight: '5px' }} className={styles.score}>{avgScore}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AlbumComponent;
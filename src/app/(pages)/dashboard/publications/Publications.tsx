'use client'
import styles from "./page.module.css";
import { Button, Card, Input, Scrollable, Tooltip, Icon } from "@bbollen23/brutal-paper";
import { useDataStore } from "@/providers/data-store-provider";
import type { Publication } from "@/app/lib/definitions";
import { useState } from "react";

interface PublicationProps {
    publications: Publication[]
}

export default function Publications({ publications }: PublicationProps) {

    const publicationsSelected = useDataStore((state) => state.publicationsSelected);
    const addPublication = useDataStore((state) => state.addPublication);
    const removePublication = useDataStore((state) => state.removePublication);

    const [searchTermAll, setSearchTermAll] = useState<string>('');
    const [searchTermSelected, setSearchTermSelected] = useState<string>('');

    const handleAddPublication = (publication: Publication) => {
        if (addPublication) {
            addPublication(publication);
        }
    }

    const handleRemovePublication = (publication: Publication) => {
        removePublication(publication);
    }

    const publicationSelected = (currPublication: Publication): boolean => {
        return publicationsSelected.some((publication: Publication) => publication.id === currPublication.id)
    }

    const handleSearchTermAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermAll(event.target.value); // Update the search term state
    };

    const handleSearchTermSelectedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermSelected(event.target.value); // Update the search term state
    };

    interface PublicationCardProps {
        publication: Publication,
        add: boolean
    }
    const PublicationCard = ({ publication, add }: PublicationCardProps) => {
        return (
            <Card
                title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><img className='pub-icon' src={`/images/publications/${publication.unique_name}.webp`} width="30px" height="30px" />
                    {publication.name}</div>}
                style={{ opacity: publicationSelected(publication) && add ? 0.4 : 1 }}
                actionPosition='right'
                size="sm"
                actions={
                    <Button
                        disabled={add && publicationSelected(publication)}
                        flat
                        label={add ? 'Add Publication' : 'Remove Publication'}
                        onClick={add ? () => handleAddPublication(publication) : () => handleRemovePublication(publication)}
                    />
                }
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', marginTop: '20px', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Tooltip size="sm" content="Num of Reviews">
                            <Icon size="sm" type="none" icon='bi bi-file-earmark' dense />
                        </Tooltip>
                        <div style={{ marginLeft: '10px', fontSize: '1.1rem' }}>{publication.number_of_reviews}</div>
                    </div>
                    <div style={{ display: 'flex', marginTop: '20px', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Tooltip size="sm" content="Avg Score">
                            <Icon size="sm" type="none" icon='bi bi-graph-up' dense />
                        </Tooltip>
                        <div style={{ marginLeft: '10px', fontSize: '1.1rem' }}>{publication.avg_score}</div>
                    </div>
                </div>

            </Card>
        )
    }

    return (
        <div className={styles.publicationsContainer}>
            <div className={styles.innerPublicationsContainer}>
                <div style={{ borderBottom: "1px solid var(--bp-theme-border-color)" }}>
                    <h2>Current Chosen Publications</h2>
                    <div style={{ margin: '20px 10px 0px 20px' }}>
                        <Input label="Search" placeholder="Search selected publications" value={searchTermSelected} onChange={handleSearchTermSelectedChange} />
                    </div>
                </div>
                <Scrollable width="100%" height="calc(100vh - 330px)">
                    {publicationsSelected.filter((publication: Publication) => publication.name.toLowerCase().includes(searchTermSelected.toLowerCase())).map((publication: Publication) => (
                        <PublicationCard
                            key={publication.id}
                            publication={publication}
                            add={false} />
                    ))}
                </Scrollable>
            </div>
            <div className={styles.innerPublicationsContainer}>
                <div style={{ borderBottom: "1px solid var(--bp-theme-border-color)" }}>
                    <h2>All Publications</h2>
                    <div style={{ margin: '20px 10px 0px 20px' }}>
                        <Input label="Search" placeholder="Search all publications" value={searchTermAll} onChange={handleSearchTermAllChange} />
                    </div>
                </div>
                <Scrollable width="100%" height="calc(100vh - 330px)">
                    {publications.filter((publication: Publication) => publication.name.toLowerCase().includes(searchTermAll.toLowerCase())).map((publication: Publication) => (
                        <PublicationCard
                            publication={publication}
                            key={publication.id}
                            add={true}
                        />
                    ))}
                </Scrollable>
            </div>
        </div>
    );
}

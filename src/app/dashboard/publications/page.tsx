'use client'
import styles from "./page.module.css";
import { Button, Card, Input, Scrollable } from "@bbollen23/brutal-paper";
import { useDataStore } from "@/providers/data-store-provider";
import { type Publication } from "@/app/lib/definitions";
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
                        <Card
                            title={publication.name}
                            key={publication.id}
                            size="sm"
                            actions={
                                <Button
                                    flat
                                    label="Remove"
                                    onClick={() => handleRemovePublication(publication)}
                                />
                            }
                        >
                            {/* {publication.description} */}
                            Here is a generic description about a particular publication. We might want to search for these and get things for all of them.
                        </Card>
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

                        <Card
                            title={publication.name}
                            key={publication.id}
                            size="sm"
                            style={{ opacity: publicationSelected(publication) ? 0.4 : 1 }}
                            actions={
                                <Button
                                    flat
                                    label="Add"
                                    disabled={publicationSelected(publication)}
                                    onClick={() => handleAddPublication(publication)}
                                />
                            }
                        >
                            {/* {publication.description} */}
                            Here is a generic description about a particular publication. We might want to search for these and get things for all of them.
                        </Card>
                    ))}
                </Scrollable>
            </div>
        </div>
    );
}

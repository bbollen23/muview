'use client'
import styles from "./page.module.css";
import { Button, Card, Icon, Input, Scrollable } from "@bbollen23/brutal-paper";
import { type Publication, type DataStore } from '../../../stores/data-store'
import { useDataStore } from "@/providers/data-store-provider";

export default function Publications({ }) {

    const {
        publications,
        publicationsSelected,
        addPublication,
        removePublication
    } = useDataStore((state: DataStore) => state,)

    const handleAddPublication = (publication: Publication) => {
        if (addPublication) {
            addPublication(publication);
        }
    }

    const handleRemovePublication = (publication: Publication) => {
        if (removePublication) {
            removePublication(publication);
        }
    }

    const publicationSelected = (currPublication: Publication): boolean => {
        return publicationsSelected.some((publication: Publication) => publication.id === currPublication.id)
    }


    return (
        <div className={styles.publicationsContainer}>
            <div className={styles.innerPublicationsContainer}>
                <div style={{ borderBottom: "1px solid var(--theme-border-color)" }}>
                    <h2>Current Chosen Publications</h2>
                    <div style={{ margin: '20px 10px 0px 20px' }}>
                        <Input label="Search" />
                    </div>
                </div>
                <Scrollable width="100%" height="calc(100vh - 330px)">
                    {publicationsSelected.map((publication: Publication) => (
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
                            {publication.description}
                        </Card>
                    ))}
                </Scrollable>
            </div>
            <div className={styles.innerPublicationsContainer}>
                <div style={{ borderBottom: "1px solid var(--theme-border-color)" }}>
                    <h2>All Publications</h2>
                    <div style={{ margin: '20px 10px 0px 20px' }}>
                        <Input label="Search" />
                    </div>
                </div>
                <Scrollable width="100%" height="calc(100vh - 330px)">
                    {publications.map((publication: Publication) => (
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
                            {publication.description}
                        </Card>
                    ))}
                    test
                </Scrollable>
            </div>
        </div>
    );
}

'use client'
import { useDataStore } from "@/providers/data-store-provider";
import FilterPageComponent from "@/app/ui/FilterPageComponent/component";
import { Button } from "@bbollen23/brutal-paper";
import Link from "next/link";


const FiltersPage = (): JSX.Element => {

    const selectedAlbumIds = useDataStore((state) => state.selectedAlbumIds);
    const selectedAlbumIdsRankings = useDataStore((state) => state.selectedAlbumIdsRankings);

    if (Object.keys(selectedAlbumIds).length == 0 && Object.keys(selectedAlbumIdsRankings).length === 0) return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            You currently have no data chosen in your main dashboard.
            <Link href="/dashboard"><Button style={{ marginTop: '20px' }} label="Go To Dashboard" /></Link>
        </div>
    )


    return <FilterPageComponent />
}

export default FiltersPage;
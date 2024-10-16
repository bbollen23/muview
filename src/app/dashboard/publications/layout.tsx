import React from "react";
import { fetchPublications } from '@/app/lib/data'; // Adjust the path to your fetch function
import Publications from './page'; // Make sure the path is correct

export default async function PublicationsLayout() {
    // Fetch publications data on the server
    const publications = await fetchPublications();

    return (
        <div>
            {/* Pass the fetched data as props to the Publications component */}
            <Publications publications={publications} />
        </div>
    );
};
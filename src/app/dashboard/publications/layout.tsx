import React from "react";

export default async function PublicationsLayout({ children }: { children: React.ReactNode }) {
    // Fetch publications data on the server
    return (
        <div>
            {children}
        </div>
    );
};
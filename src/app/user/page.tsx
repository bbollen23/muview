import React from 'react';
import { getSession } from "@auth0/nextjs-auth0";


export default async function UserLayout() {
    const session = await getSession();

    return (
        session?.user && (
            <div>
                <h2>{session.user.name}</h2>
            </div>
        )
    )
}

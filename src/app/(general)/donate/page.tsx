"use client"

import { Button } from '@bbollen23/brutal-paper';
import Link from 'next/link';
import React from 'react';


export default function Donate() {
    return (
        <>
            <h1>Donate</h1>
            <p>MuView is completely supported and maintained by myself. If you have the will and money to do so, consider donating using the button below.</p>
            <Button style={{ width: '200px', marginTop: '30px' }} label="Donate" />
        </>
    )
}
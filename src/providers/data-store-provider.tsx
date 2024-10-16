'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { useStore } from 'zustand'


import { type DataStore, createDataStore, initDataStore } from '@/stores/data-store'

export type DataStoreApi = ReturnType<typeof createDataStore>

export const DataStoreContext = createContext<DataStoreApi | undefined>(
    undefined,
)

export interface DataStoreProviderProps {
    children: ReactNode
}

export const DataStoreProvider = ({
    children,
}: DataStoreProviderProps) => {
    const storeRef = useRef<DataStoreApi>()
    if (!storeRef.current) {
        storeRef.current = createDataStore(initDataStore())
    }

    const getState = () => storeRef.current!.getState();

    return (
        <DataStoreContext.Provider value={{ ...storeRef.current, getState }}>
            {children}
        </DataStoreContext.Provider>
    )
}

export const useDataStore = <T,>(
    selector: (store: DataStore) => T,
): T => {
    const dataStoreContext = useContext(DataStoreContext)

    if (!dataStoreContext) {
        throw new Error(`useDataStore must be used within DataStoreProvider`)
    }

    return useStore(dataStoreContext, selector)
}

export const useDataStoreGetState = (): (() => DataStore) => {
    const dataStoreContext = useContext(DataStoreContext);

    if (!dataStoreContext) {
        throw new Error(`useDataStore must be used within DataStoreProvider`);
    }

    return dataStoreContext.getState; // Return the getState method directly
}
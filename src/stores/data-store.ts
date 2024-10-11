import { createStore } from 'zustand/vanilla'

export type DataStoreState = {
    year: number;
    publicationsSelected: Publication[],
    publications: Publication[]
}

export type DataStoreActions = {
    addPublication?: (publication: Publication) => void;
    removePublication?: (publication: Publication) => void;
}

export type DataStore = DataStoreState & DataStoreActions;


export interface Publication {
    id: number,
    name: string,
    description?: string
}

export const defaultInitialState: DataStoreState = {
    year: 0,
    publicationsSelected: [],
    publications: []
}

export const initDataStore = (): DataStoreState => {
    return {
        year: new Date().getFullYear(),
        publicationsSelected: [],
        publications: [
            {
                id: 0,
                name: 'Publication 1',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            },
            {
                id: 1,
                name: 'Publication 2',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            }, {
                id: 2,
                name: 'Publication 3',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            },
            {
                id: 3,
                name: 'Publication 4',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            },
            {
                id: 4,
                name: 'Publication 5',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            },
            {
                id: 5,
                name: 'Publication 6',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            },
            {
                id: 6,
                name: 'Publication 7',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            },
            {
                id: 7,
                name: 'Publication 8',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            },
            {
                id: 8,
                name: 'Publication 9',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            },
            {
                id: 9,
                name: 'Publication 10',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            },
            {
                id: 10,
                name: 'Publication 11',
                description: 'Here is a ton of information about pitchfork and how much is sucks ass. Like a lot of information about it, for real.'
            }
        ],
    }
}

export const createDataStore = (
    initState: DataStoreState = defaultInitialState
) => {
    return createStore<DataStore>()((set) => ({
        ...initState,
        addPublication: (publication: Publication) => {
            set((state) => ({
                publicationsSelected: [...state.publicationsSelected, publication],
            }));
        },
        removePublication: (publication: Publication) => {
            set((state) => ({
                publicationsSelected: state.publicationsSelected.filter((currPublication) => publication.id !== currPublication.id),
            }));
        },
    }))
}


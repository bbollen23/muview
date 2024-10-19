import { Filter } from "@/app/lib/definitions";

export const getAlbumIdsFromFilters = (selectedFilters: Filter[]) => {
    const filteredUnionAlbumIds: number[] = [];

    //Separate into two lists (non-genre and genre which handle filters differently)
    const [unionFilters, intersectionFilters] = selectedFilters.reduce(
        ([union, intersection], item) => {
            if (item.type !== 'genre-filter') {
                union.push(item);
            } else {
                intersection.push(item);
            }
            return [union, intersection];
        },
        [[], []] as [Filter[], Filter[]]
    );


    unionFilters.forEach((filter: Filter) => {
        filteredUnionAlbumIds.push(...filter.albumIds);
    })

    let filteredAlbumIds: number[] = []

    if (filteredUnionAlbumIds.length > 0) {
        filteredAlbumIds = [...filteredUnionAlbumIds];

        if (intersectionFilters.length > 0) {
            filteredAlbumIds = intersectionFilters.reduce((acc, currFilter) => {
                // Keep only the elements in acc that are also in obj.ids
                return acc.filter(id => currFilter.albumIds.includes(id));
            }, filteredAlbumIds);  // Start with list1
        }
    } else {
        if (intersectionFilters.length > 0) {
            filteredAlbumIds = intersectionFilters.reduce((acc, currFilter) => {
                // Keep only the elements in acc that are also in obj.ids
                return acc.filter(id => currFilter.albumIds.includes(id));
            }, [...intersectionFilters[0].albumIds]);  // Start with list1
        }
    }


    return filteredAlbumIds;
}
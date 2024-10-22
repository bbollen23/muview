import type { Publication } from "@/app/lib/definitions";

interface Label {
    pub_id: string
    pub_name: string,
    pub_unique_name: string,
    type?: string,
    bin?: string,
    suffix?: string
}

// Want to figure out how to get the endpoints of the bin??
export function parseLabel(groupLabel: string, publicationsSelected: Publication[], consolidated: boolean): Label {
    const split_label = groupLabel.split('-');
    const pub_id = split_label[0];
    const pub_name = publicationsSelected.find((pub: Publication) => pub.id === parseInt(pub_id))!.name;
    const pub_unique_name = publicationsSelected.find((pub: Publication) => pub.id === parseInt(pub_id))!.unique_name;
    if (!consolidated && split_label[1]) {
        const type = split_label[1] === 'brush' ? 'ranking' : 'review';
        const bin = type === 'review' ? split_label[1].replace(',', '-') : ''
        return {
            pub_id,
            pub_name,
            pub_unique_name,
            type,
            bin,
            suffix: type === 'review' ? split_label[1].replace('-', ' to ') : 'Rankings'
        }
    }
    return {
        pub_id,
        pub_name,
        pub_unique_name,
    }
}
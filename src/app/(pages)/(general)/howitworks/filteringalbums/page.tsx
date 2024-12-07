'use client'
import { useTheme } from '@/providers/theme-provider';
import React from 'react';

export default function HowItWorksOverview() {
    const { theme } = useTheme();
    return (
        <>
            <p>Filtering albums is how you can go from a large set of albums with general restrictions to a small set of albums which satisfy any criteria that you&apos;d like. Filtering can be done on a &quot;selector&quot; basis and a &quot;genre&quot; basis.</p>
            <h2>What is an UpSet Plot?</h2>
            <p>An UpSet plot is a way to visualize the intersection of many sets. The idea is similar to a Venn Diagram, but it is much more intuitive for cases where we have more than 3 intersecting sets. Instead of using intersecting circles to show the intersecting sets of two grups, and UpSet plot uses a matrix representation. The diagram below shows the general idea of an upset plot.</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', margin: '50px 0px' }}>
                <img width='100%' src={theme === 'dark' ? "/images/upset-dark.png" : "/images/upset-light.png"}></img>
            </div>
            <h2>Selector Filtering Using UpSet Plot</h2>
            <p> Every time you click on a bar in the one of the histograms in the dashboard, it creates a new group in the upset plot. The UpSet plot then shows all the possible intersections between all the groups that you&apos;ve selected. From here, you can hover over any of the bars in the UpSet plot to see more information about that set of groups. </p>
            <p>Once you have hovered over the data, you can add that particular intersection as a &quot;filter&quot;. This will reduce the albums in your album list to only the albums that belong to that intersection. You can &quot;stack&quot; the filters to show more than just one intersection.</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', margin: '50px 0px' }}>
                <img width='100%' src={theme === 'dark' ? "/images/upset-filtering-dark.png" : "/images/upset-filtering-light.png"}></img>
            </div>
            <h2>Filtering Using Genres</h2>
            <p>In the &quot;Genre Filtering&quot; tab, you&apos;ll see a much simpler plot. This is simple a bar chart which indicates how many albums belong to each genre. When you hover over one of the bars, you&apos;ll see that you can apply a filter to only include that genre. When you stack Genre Filters, you will be continually shrinking the album list. For example, adding &quot;Singer Songwriter&quot; as a genre filter, then adding &quot;Indie Rock&quot; as a genre filter will filter the selected ablums down to albums which have both &quot;Singer Songwriter&quot; <span style={{ fontStyle: 'italic' }}>and</span> &quot;Indie Rock&quot;. </p>
        </>
    )
}
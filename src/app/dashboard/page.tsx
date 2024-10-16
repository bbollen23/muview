'use client'
import BarChart from "@/app/ui/BarChart";
import ScatterPlot from "@/app/ui/ScatterPlot";
import styles from "./page.module.css";
import { Icon, Tabs, Scrollable, Button } from "@bbollen23/brutal-paper";
import Link from 'next/link';
import { useDataStore } from "@/providers/data-store-provider";
import type { Publication } from "../lib/definitions";
import { useEffect } from "react";
import useSWR from "swr";

interface TabData {
  label: string,
  content: React.ReactNode
}

export default function Dashboard({ }) {

  const reviews = useDataStore((state) => state.reviews);
  const rankings = useDataStore((state) => state.rankings);
  const publicationsSelected = useDataStore((state) => state.publicationsSelected);
  const addReviews = useDataStore((state) => state.addReviews);
  const removeReviews = useDataStore((state) => state.removeReviews);
  const addRankings = useDataStore((state) => state.addRankings);
  const removeRankings = useDataStore((state) => state.removeRankings);
  const loading = useDataStore((state) => state.loading);
  const setLoading = useDataStore((state) => state.setLoading)

  const fetcher = (url: string) => fetch(url).then(res => res.json());

  // Determines the set of pub ids that have already been fetched
  const current_fetched_pub_ids = Object.keys(reviews).map(Number);

  // Gets the pub ids that have been added and not fetched
  const new_pub_ids = publicationsSelected.filter((pub: Publication) => !(current_fetched_pub_ids.includes(pub.id))).map((new_pub: Publication) => new_pub.id)

  // Gets the pub ids that are not longer needed.
  const removed_pub_ids = current_fetched_pub_ids.filter((pub_id: number) => !(publicationsSelected.map((pub: Publication) => pub.id).includes(pub_id)))

  const { data, error } = useSWR(
    new_pub_ids.length > 0 ? `/api/reviews?publication_ids=${new_pub_ids.join(',')}` : null,
    fetcher
  );


  useEffect(() => {
    if (new_pub_ids.length > 0 && !data && !loading) {
      setLoading(true);
    }

    if (removed_pub_ids.length > 0) {
      removed_pub_ids.forEach((pub_id: number) => {
        removeReviews(pub_id);
        removeRankings(pub_id);
      })
    }

    if (data) {
      addReviews(data.newReviews);
      addRankings(data.newRankings);
      if (loading) {
        setLoading(false);
      }
    }

    if (error) {
      console.error('Error fetching reviews and or rankings: ', error)
    }

  }, [data, new_pub_ids, error, removed_pub_ids]);

  const ReviewDistributionComponent = () => {
    return (
      <Scrollable width="100%" height="calc(100vh - 220px)">
        <div className={styles.dataContainer}>
          {publicationsSelected.map((publication: Publication, idx: number) => {
            return (
              <div key={publication.id} className={styles.chartContainer}>
                <div>
                  <div className={styles.header}>
                    <Icon icon="bi bi-house" />
                    <div className={styles.publicationName}>
                      {publication.name}
                    </div>
                  </div>
                  <BarChart reviewData={reviews[publication.id]} publication_id={publication.id} />
                </div>
              </div>
            )
          })}
        </div>
      </Scrollable>
    )
  }


  const YearEndComponent = () => {
    return (
      <Scrollable width="100%" height="calc(100vh - 220px)">
        <div className={styles.dataContainer}>
          {publicationsSelected.map((publication: Publication, idx: number) => {
            return (
              <div key={publication.id} className={styles.chartContainer}>
                <div>
                  <div className={styles.header}>
                    <Icon icon="bi bi-house" />
                    <div className={styles.publicationName}>
                      {publication.name}
                    </div>
                  </div>
                  {rankings[publication.id] && rankings[publication.id].length > 0 ? <ScatterPlot publication_id={publication.id} rankingData={rankings[publication.id]} /> : <div style={{ width: '450px', height: '275px', display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}><div style={{ marginTop: '-80px' }}>There is no year-end ranking data for {publication.name}.</div></div>}
                </div>
              </div>
            )
          })}
        </div>
      </Scrollable>
    )
  }

  const EmptyPublicationsComponent = () => {
    return (
      <div className={styles.emptyPublicationsContainer}>
        <div>There are no publications selected.</div>
        <Link href='dashboard/publications'><Button label="Go To Publications"></Button></Link>
      </div>
    )
  }

  let tabsData: TabData[] = [];
  if (publicationsSelected.length > 0) {
    tabsData = [
      { label: 'Album Distributions', 'content': <ReviewDistributionComponent /> },
      { label: 'Year End Lists', 'content': <YearEndComponent /> }
    ]
  } else {
    tabsData = [
      { label: 'Album Distributions', 'content': <EmptyPublicationsComponent /> },
      { label: 'Year End Lists', 'content': <EmptyPublicationsComponent /> }
    ]
  }


  return (
    <Tabs tabData={tabsData}>
    </Tabs>
  );
}

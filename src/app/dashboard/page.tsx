'use client'
import BarChart from "@/app/ui/BarChart";
import ScatterPlot from "@/app/ui/ScatterPlot";
import styles from "./page.module.css";
import { Icon, Tabs, Scrollable, Button } from "@bbollen23/brutal-paper";
import Link from 'next/link';
import { useDataStore } from "@/providers/data-store-provider";
import type { Publication } from "../lib/definitions";

interface TabData {
  label: string,
  content: React.ReactNode
}

export default function Dashboard({ }) {



  // const reviews = useDataStore((state) => state.reviews);
  const publicationsSelected = useDataStore((state) => state.publicationsSelected);
  const selectedYears = useDataStore((state) => state.selectedYears);



  const ReviewDistributionComponent = () => {
    return (
      <Scrollable width="100%" height="calc(100vh - 240px)">
        {selectedYears.map((year: number) =>
          <div className={styles.yearSectionContainer}>
            <div style={{ borderBottom: '1px solid var(--bp-theme-border-color)', marginBottom: '10px' }}><h1>{year}</h1></div>
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
                      <BarChart year={year} publication_id={publication.id} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}


      </Scrollable>
    )
  }


  const YearEndComponent = () => {
    return (
      <Scrollable width="100%" height="calc(100vh - 240px)">
        {selectedYears.map((year: number) =>
          <div className={styles.yearSectionContainer}>
            <div style={{ borderBottom: '1px solid var(--bp-theme-border-color)', marginBottom: '10px' }}><h1>{year}</h1></div>
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
                      <ScatterPlot year={year} publication_id={publication.id} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>)}
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

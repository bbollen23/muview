'use client'
import TestBarChart from "@/app/ui/TestBarChart";
import TestScatterPlot from "@/app/ui/TestScatterPlot";
import styles from "./page.module.css";
import { Icon, Tabs, Scrollable, Button } from "@bbollen23/brutal-paper";
import Link from 'next/link';
import { type Publication, type DataStore } from '../../stores/data-store'
import { useDataStore } from "@/providers/data-store-provider";

interface TabData {
  label: string,
  content: React.ReactNode
}

export default function Dashboard({ }) {


  const publicationsSelected = useDataStore((state: DataStore) => state.publicationsSelected)

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
                  <TestBarChart chartIndex={idx} />
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
                  <TestScatterPlot chartIndex={idx} />
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

'use client'
import BarChart from "@/app/ui/BarChart";
import ScatterPlot from "@/app/ui/ScatterPlot";
import styles from "./page.module.css";
import { Icon, Tabs, Scrollable, Button } from "@bbollen23/brutal-paper";
import Link from 'next/link';
import { useDataStore } from "@/providers/data-store-provider";
import type { Publication } from "../lib/definitions";
import { useState } from "react";

interface TabData {
  label: string,
  content: React.ReactNode
}

type ChartType = 'bar' | 'scatter';

function Dashboard({ }) {



  // const reviews = useDataStore((state) => state.reviews);
  const publicationsSelected = useDataStore((state) => state.publicationsSelected);
  const selectedYears = useDataStore((state) => state.selectedYears);

  const [barsCollapsed, setBarsCollapsed] = useState<boolean[]>(new Array(selectedYears.length).fill(false));
  const [scattersCollapsed, setScattersCollapsed] = useState<boolean[]>(new Array(selectedYears.length).fill(false));

  const handleCollapseClick = (idx: number, type: ChartType) => {
    if (type === 'bar') {
      setBarsCollapsed((prev) => {
        const updatedState = [...prev];
        updatedState[idx] = !prev[idx];
        return updatedState
      })
    } else {
      setScattersCollapsed((prev) => {
        const updatedState = [...prev];
        updatedState[idx] = !prev[idx];
        return updatedState
      })
    }

  }

  const ReviewDistributionComponent = () => {
    return (
      <Scrollable width="100%" height="calc(100vh - 240px)">
        {selectedYears.map((year: number, barIdx: number) =>
          <div key={`${year}-${barIdx}-bar`} className={styles.yearSectionContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bp-theme-border-color)', margin: '10px 0px', paddingBottom: '5px' }}>
              <div><h1 style={{ margin: 0, padding: 0 }}>{year}</h1></div>
              <Icon size="sm" icon={barsCollapsed[barIdx] ? `bi bi-chevron-up` : `bi bi-chevron-down`} onClick={() => handleCollapseClick(barIdx, 'bar')} />
            </div>
            {barsCollapsed[barIdx] ? null : <div className={styles.dataContainer}>
              {publicationsSelected.map((publication: Publication) => {
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
            </div>}
          </div>
        )}


      </Scrollable>
    )
  }


  const YearEndComponent = () => {
    return (
      <Scrollable width="100%" height="calc(100vh - 240px)">
        {selectedYears.map((year: number, scatterIdx: number) =>
          <div key={`${year}-${scatterIdx}-scatter`} className={styles.yearSectionContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bp-theme-border-color)', margin: '10px 0px', paddingBottom: '5px' }}>
              <div><h1 style={{ margin: 0, padding: 0 }}>{year}</h1></div>
              <Icon size="sm" icon={scattersCollapsed[scatterIdx] ? `bi bi-chevron-up` : `bi bi-chevron-down`} onClick={() => handleCollapseClick(scatterIdx, 'scatter')} />
            </div>
            {scattersCollapsed[scatterIdx] ? null : <div className={styles.dataContainer}>
              {publicationsSelected.map((publication: Publication) => {
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
            </div>}
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


export default Dashboard;
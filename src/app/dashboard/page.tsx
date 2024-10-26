'use client'
import styles from "./page.module.css";
import { Tabs, Button, SwitchGroup, Icon, Tooltip } from "@bbollen23/brutal-paper";
import Link from 'next/link';
import { useDataStore } from "@/providers/data-store-provider";
import { useState } from "react";
import { DashboardComponent } from "@/app/ui";

interface TabData {
  label: string,
  content: React.ReactNode
}


function Dashboard({ }) {

  const setSelectedYears = useDataStore((state) => state.setSelectedYears)
  const selectedYears = useDataStore((state) => state.selectedYears);
  const publicationsSelected = useDataStore((state) => state.publicationsSelected);
  const combineYearsDashboard = useDataStore((state) => state.combineYearsDashboard);
  const toggleCombineYears = useDataStore((state) => state.toggleCombineYears);

  const yearsList: string[] = ['2024', '2023', '2022', '2021', '2020'];

  const [yearClickState, setYearClickState] = useState<boolean[]>(yearsList.map((year: string) => selectedYears.includes(parseInt(year))));


  const handleSelectYear = (switchGroupState: boolean[]) => {
    const tempYearList = yearsList.filter((entry: string, index: number) => switchGroupState[index]);
    setSelectedYears(tempYearList);
  }



  const EmptyPublicationsComponent = () => {
    return (
      <div className={styles.emptyPublicationsContainer}>
        <div>There are no publications selected.</div>
        <Link href='dashboard/publications'><Button label="Go To Publications" iconRight='bi bi-arrow-right'></Button></Link>
      </div>
    )
  }

  const EmptyYearsComponent = () => {
    return (
      <div className={styles.emptyPublicationsContainer}>
        <div>There are no years selected. Try adding a &apos;Review Year&apos; in the upper left.</div>
      </div>
    )
  }


  let tabsData: TabData[] = [];
  if (publicationsSelected.length > 0 && selectedYears.length > 0) {
    tabsData = [
      { label: 'Album Distributions', 'content': <DashboardComponent key={'barChartTab'} type={'barChart'} combineYears={combineYearsDashboard} /> },
      { label: 'Year End Lists', 'content': <DashboardComponent key={'scatterPlotTab'} type={'scatterPlot'} combineYears={combineYearsDashboard} /> }
    ]
  } else if (selectedYears.length > 0) {
    tabsData = [
      { label: 'Album Distributions', 'content': <EmptyPublicationsComponent /> },
      { label: 'Year End Lists', 'content': <EmptyPublicationsComponent /> }
    ]
  } else {
    tabsData = [
      { label: 'Album Distributions', 'content': <EmptyYearsComponent /> },
      { label: 'Year End Lists', 'content': <EmptyYearsComponent /> }
    ]
  }

  const CombineYearsComponent = () => {
    if (combineYearsDashboard) return (
      <Tooltip size="sm" content='Separate Years'>
        <Icon onClick={() => toggleCombineYears()} size="sm" icon='bi bi-bar-chart-line-fill' />
      </Tooltip>
    )
    return (
      <Tooltip size="sm" content='Combine Years'>
        <Icon onClick={() => toggleCombineYears()} size="sm" icon='bi bi-bar-chart-line' />
      </Tooltip>
    )

  }

  return (
    <div>
      <div style={{ display: 'flex', margin: '20px 0px 40px 0px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>Review Years</div>
          <SwitchGroup
            labelList={yearsList}
            clickState={yearClickState}
            setClickState={setYearClickState}
            onChange={handleSelectYear}
          />
        </div>
        <div>
          <CombineYearsComponent />
          {/* <Tooltip size="sm" content="Settings"><Icon size="sm" icon='bi bi-gear' /></Tooltip> */}
        </div>
      </div>
      <Tabs tabData={tabsData}>
      </Tabs>
    </div>
  );
}


export default Dashboard;
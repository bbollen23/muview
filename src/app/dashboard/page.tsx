'use client'
import styles from "./page.module.css";
import { Tabs, Button } from "@bbollen23/brutal-paper";
import Link from 'next/link';
import { useDataStore } from "@/providers/data-store-provider";
import { useState } from "react";
import { ReviewDistributionComponent, YearEndComponent } from "@/app/ui";

interface TabData {
  label: string,
  content: React.ReactNode
}


function Dashboard({ }) {

  // const reviews = useDataStore((state) => state.reviews);
  const publicationsSelected = useDataStore((state) => state.publicationsSelected);

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
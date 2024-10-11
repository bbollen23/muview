import React from 'react';
import { Icon } from '@bbollen23/brutal-paper';
import { useTheme } from '../../providers/theme-provider';


export interface ThemeToggleProps {
  style?: React.CSSProperties;
}

const ThemeToggle = ({ style }: ThemeToggleProps) => {


  const { theme, toggleTheme } = useTheme(); // Access theme and toggleTheme from context

  return (
    <Icon style={style} icon={theme === 'dark' ? "bi bi-moon" : "bi bi-sun"} size="sm" onClick={toggleTheme} />
  )
}

export default ThemeToggle;
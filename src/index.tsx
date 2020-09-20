import React from 'react';
import ReactDOM from 'react-dom';
import { LayoutContainer } from './components/layout/LayoutContainer';
import { AppDataProvider } from './appdata/AppDataProvider';
import { DataInterfaceProvider } from './datasource/DataInterfaceContext';
import { defaultTheme, ThemeContext } from './common/theming';
import { MainContentContextProvider } from './components/mainContent/context';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

(window as any).ELECTRON_DISABLE_SECURITY_WARNINGS = true;

console.log('process.env.NODE_ENV=', process.env.NODE_ENV);

ReactDOM.render(
  <ThemeContext.Provider value={defaultTheme}>
    <AppDataProvider>
      <DataInterfaceProvider>
        <MainContentContextProvider>
          <LayoutContainer>abc</LayoutContainer>
        </MainContentContextProvider>
      </DataInterfaceProvider>
    </AppDataProvider>
  </ThemeContext.Provider>,
  document.getElementById('root')
);

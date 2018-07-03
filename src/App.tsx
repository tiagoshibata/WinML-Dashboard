import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

import EditTab from './view/Edit/View';

import './App.css';

class App extends React.Component<any, any> {
  render() {
    return (
      <div className="App">
        <Pivot>
          <PivotItem headerText="Edit">
            <EditTab />
          </PivotItem>
          <PivotItem headerText="Convert">
            <Label>TODO</Label>
          </PivotItem>
          <PivotItem headerText="Debug">
            <Label>TODO</Label>
          </PivotItem>
          <PivotItem headerText="Profile">
            <Label>TODO</Label>
          </PivotItem>
        </Pivot>
      </div>
    );
  }
}

export default App;

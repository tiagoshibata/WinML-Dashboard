import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import Resizable from '../components/Resizable';

import './EditTab.css';

export default class EditTab extends React.Component {
  private tab: React.RefObject<HTMLDivElement>;

  constructor(props: {}) {
    super(props);
    this.tab = React.createRef();
  }

  render() {
    return (
      <div id='EditTab' ref={this.tab}>
        <Resizable>
            <Label>Left panel</Label>
        </Resizable>
        <object className='Netron' type='text/html' data='static/Netron/'>
            Netron visualization
        </object>
        <Resizable>
          <Label>Right panel</Label>
        </Resizable>
      </div>
    );
  }

  componentDidMount() {
    this.tab.current && this.tab.current.scrollIntoView({
      behavior: 'smooth',
    });
  }
}

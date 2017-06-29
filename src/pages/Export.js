import React, { Component } from 'react'
import { Toolbar } from 'material-ui/Toolbar';

import * as d3 from 'd3-dsv'

class Export extends Component {
	createExport = (locale = 'us') => {
    const date = new Date()
    const name = 'export_' + date + '.csv'
    const rows = this.props.data.dimensions._all.top(Infinity)

    if (locale === 'eu') {
      var dsv = d3.dsvFormat(";")
      dsv.format(rows.map((row) => {
        return row
      }))
    }

		const data = d3.csvFormat(rows)
    const blob = new Blob([data], {type: 'text/csv'});

    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, name);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.text = " nothing"
        elem.download = name
        document.body.appendChild(elem);
        elem.click()
        document.body.removeChild(elem)
    }
  }

    render() {
        return (
        <div className={"export"}>
           <Toolbar style={{backgroundColor : 'none'}}>
           </Toolbar>
           <div className="link">
           <a onClick={this.createExport}>
            <img alt="download" src="/download.png" />
            </a>
           DOWNLOAD (US)
           </div><br/>

        </div>
        )
    }
}


export default Export

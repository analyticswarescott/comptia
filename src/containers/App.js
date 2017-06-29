import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

//import CircularProgress from 'material-ui/CircularProgress/CircularProgress'

import Content from './Content'
import Data    from './Data'
import Sidebar from './Sidebar'
import Topbar  from './TopbarOld'

import dataset from '../config.js'



import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

darkBaseTheme.palette = {
    ...darkBaseTheme.palette,
    primary1Color: '#ccc',
    primary2Color: '#ccc',
    // primary3Color: '#ccc',
    // accent1Color: pinkA200,
    // accent2Color: pinkA400,
    // accent3Color: pinkA100,
    // textColor: fullWhite,
    // secondaryTextColor: fade(fullWhite, 0.7),
    alternateTextColor: '#303030',
    canvasColor: '#1c1f28',
    // borderColor: fade(fullWhite, 0.3),
    // disabledColor: fade(fullWhite, 0.3),
    // pickerHeaderColor: fade(fullWhite, 0.12),
    // clockCircleColor: fade(fullWhite, 0.12),
  }

const theme = getMuiTheme(darkBaseTheme)

class App extends Component {

    showSidebar   = () => window.innerWidth > 0/*1400*/
    toggleSidebar = () => this.setState({ showSidebar: !this.state.showSidebar})


    componentWillReceiveProps(props) {

        const {
            params
        } = props

        if (! props.params.dsname) {
            this.props.params.dsname = 'calendar';
        }

    }

    componentWillMount() {
        this.state = { showSidebar: this.showSidebar() }
    }


    onDatasetChange(value) {
        // parent class change handler is always called with field name and value
        this.setState({dsname: value, loaded: false});
    }



    onValue1MeasureChange = (e, i, v) => this.update({ ...this.state, value1: { ...this.state.value1, measure: v } })
    onValue1GroupChange   = (e, i, v) => this.update({ ...this.state, value1: { ...this.state.value1, group:   v } })
    onValue1FilterChange  = (e, i, v) => this.update({ ...this.state, value1: { ...this.state.value1, filter:  v } })
    onValue2MeasureChange = (e, i, v) => this.update({ ...this.state, value2: { ...this.state.value2, measure: v } })
    onValue2GroupChange   = (e, i, v) => this.update({ ...this.state, value2: { ...this.state.value2, group:   v } })
    onValue2FilterChange  = (e, i, v) => this.update({ ...this.state, value2: { ...this.state.value2, filter:  v } })






    render() {

        var dsname = (this.state.dsname==null ? 'calendar' : this.state.dsname);

        var ds2 = require('../../public/config.json');

        var datasetie;
       for (var i = 0; i<ds2.datasets.length; i++) {
           if (ds2.datasets[i].dsname === dsname) {
               datasetie = ds2.datasets[i];
               break;
           }
       }

        console.log(this.state.showSidebar)
        return (
        <MuiThemeProvider muiTheme={theme}>
            <Data
                url={datasetie.url}
                dimensions={datasetie.dimensions}
                measures={datasetie.measures}
                default_filters={datasetie.default_filters}
               // aggregations={dataset.aggregations}
                order={datasetie.order}
                preprocessor={dataset.preprocessor}
            >
                <Sidebar dsname={this.state.dsname} isOpen={this.state.showSidebar} toggleSidebarHandler={this.toggleSidebar}
                         onDatasetChange={this.onDatasetChange.bind(this)}
                />
                <Content indent={this.state.showSidebar} >
                    {React.cloneElement(this.props.children)}
                </Content>
            </Data>
        </MuiThemeProvider>
        )
    }
}

export default App

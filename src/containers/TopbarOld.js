import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import {withRouter, Link} from 'react-router'
import {Tabs, Tab} from 'material-ui/Tabs'

const style = {
  backgroundColor: '#1c1f28',
    height: 50
}
class Topbar extends Component {
    render() {
        const query = this.props.location.query
        return (
            <AppBar
            title=""
            iconClassNameRight="muidocs-icon-navigation-expand-more"
            style={style}
            onLeftIconButtonTouchTap={this.props.toggleSidebarHandler}
            >
                <Tabs style={style}>
                   <Tab
                   style={{height: 50, backgroundColor:"#1c1f28", paddingRight:20}}
                       value={0}
                       label="overview"
                       containerElement={(
                           <Link to={{pathname: "/overview", query: query}}/>
                       )} />
                   <Tab
                   style={{height: 50, backgroundColor:"#1c1f28", paddingRight:20}}
                       value={1}
                       label="comparison"
                       containerElement={(
                           <Link to={{pathname: "/comparison", query: query}}/>
                       )} />
                   <Tab
                   style={{height: 50, backgroundColor:"#1c1f28", paddingRight:20}}
                       value={2}
                       label="export"
                       containerElement={(
                           <Link to={{pathname: "/export", query: query}}/>
                       )} />
               </Tabs>
           </AppBar>
        );
    }
}

export default withRouter(Topbar)

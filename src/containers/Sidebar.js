import React, { Component, PropTypes } from 'react'

import Drawer from 'material-ui/Drawer';
//import AppBar from 'material-ui/AppBar';
import {withRouter, Link} from 'react-router'
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Subheader from 'material-ui/Subheader';
import Checkbox from 'material-ui/Checkbox'
import DatePicker from 'material-ui/DatePicker'
import Chip from 'material-ui/Chip'
//import IconButton from 'material-ui/IconButton';
//import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Dashboard from 'material-ui/svg-icons/action/dashboard';
import InsertChart from 'material-ui/svg-icons/editor/insert-chart';
import MoveToInbox from 'material-ui/svg-icons/content/move-to-inbox';

import Attachment from 'material-ui/svg-icons/file/attachment';


//import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';


//import Select from '../components/Select'


class Sidebar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: props.isOpen,
            isDocked: props.isOpen,
            fromDate: null,
            toDate: null,
            isYtd: false,
            dimension: 'Month'
        }
    }

    componentWillMount() {
        this.componentWillReceiveProps(this.props)
    }

    componentWillReceiveProps(props) {
        const { min, max } = props.data.dimensions._date
        const filter = props.filter.filters._date || null


        let fromDate = min
        let toDate   = max
        let isYtd    = true

        if (Array.isArray(filter)) {
            fromDate =  new Date(filter[0])
            toDate   =  new Date(filter[1])
            isYtd    = filter[2]
        }

        this.setState({
            ...this.state,
            fromDate,
            toDate,
            isYtd,
            isOpen: props.isOpen
        })
    }



    onDatasetChange = (dsname) => {

        console.log(" data set change requested to " + dsname)

        this.props.onDatasetChange(dsname)


    }

    getColor = (dsname) => {


       if (!this.props.dsname) {
          if (dsname === 'calendar')  {
              return 'darkblue';
          }
          else {return null;}
       }
       else {
           if (this.props.dsname === dsname)  {
               return 'darkblue';
           }
           else {return null;}
       }


    }



    onSidebarToggle = () => {
        this.setState({
            ...this.state,
            isOpen: !this.state.isOpen
        })
    }

    onFromChange = (event, date) => {
        this.props.filter.filterHandler(
            '_date',
            [ date, this.state.toDate, this.state.isYtd ]
        )
    }

    onToChange = (event, date) => {
        this.props.filter.filterHandler(
            '_date',
            [ this.state.fromDate, date, this.state.isYtd ]
        )
    }

    onYtdChange = (event, value) => {
        this.props.filter.filterHandler(
            '_date',
            [ this.state.fromDate, this.state.toDate, value ]
        )
    }

    onClearFilters = () => {
        const { pathname, query } = this.props.location
        this.props.router.push({
            pathname: pathname
        })
    }

    onRemoveFilter = (dimension, filter) => (event) => {
        const filters = this.props.filter.filters
        const index = filters[dimension][0].indexOf(filter)

        if (index !== -1) {
            filters[dimension][0].splice(index, 1)
        }

        this.props.filter.filterHandler(dimension, filters[dimension])
    }
    createDatePicker = (label, value, handler) => (
        <DatePicker
            style={{width:100}}
            textFieldStyle={{width: 100}}
            autoOk={true}
            floatingLabelText={label}
            defaultDate={value}
            minDate={this.props.data.dimensions._date.min}
            maxDate={this.props.data.dimensions._date.max}
            container="inline"
hideCalendarDate={true}
            onChange={handler} />
    )

    render() {
         const query = this.props.location.query
        const { filters } = this.props.filter
        const { fromDate, toDate, isYtd, isOpen, isDocked, loaded } = this.state

        const params = this.props.params;

        const closeStyle = {
            visibility: isDocked ? 'hidden' : 'visible'
        }
        return (
        <Drawer
            className={'sidebar'}
            containerClassName={'sidebar-container'}
            docked={!loaded}
            width={260}
            open={isOpen}
        > <div className="sidebar-header" style={{paddingBottom: 55}}> <img height={62} width={62}  alt="download" src="/comptia.png" /> Sales Analysis</div>

          {/*  <Subheader className="subheader">datasets</Subheader>*/}
     {/*       <div className="views">
                <Menu>
                    <Link   ><MenuItem  onTouchTap={ () => this.onDatasetChange('calendar')}
                        primaryText="Calendar" leftIcon={<Attachment className="icon"/>}
                    style={{backgroundColor: this.getColor('calendar') }}
                    /></Link>
                    <Link > <MenuItem onTouchTap={ () => this.onDatasetChange('fiscal')}
                                      primaryText="Fiscal" leftIcon={<Attachment className="icon"/>}
                   style={{backgroundColor: this.getColor('fiscal') }}

                    /></Link>
                </Menu>
            </div>*/}

            <Subheader className="subheader">views</Subheader>
            <div className="views" >
                <Menu>
                    <Link to={{pathname: "/overview", query: query}}><MenuItem primaryText="Map" leftIcon={<Dashboard className="icon"/>} /></Link>
                    <Link to={{pathname: "/comparison", query: query}}><MenuItem primaryText="Comparison" leftIcon={<InsertChart className="icon"/>}


                    /></Link>
                    <Link to={{pathname: "/export", query: query}}><MenuItem primaryText="Export" leftIcon={<MoveToInbox className="icon"/>} /></Link>
                </Menu>
            </div>
            <Subheader className="subheader">filters</Subheader><br/>
                <div className="filters" style={{marginTop: -15}}>
                    <RaisedButton style={{width: 220, marginLeft: 20}}  label='clear all filters' onClick={this.onClearFilters}/>
                </div><br/>

            <div className="timeline" style={{marginTop: -15}}>
                <div style={{paddingLeft:20, paddingRight:20, display: 'flex', flexWrap: 'wrap'}}>
                    {this.createDatePicker('from', fromDate, this.onFromChange)}
                    {this.createDatePicker('to',   toDate,   this.onToChange)}
                    <Checkbox
                        label="year to date"
                        checked={isYtd}
                        onCheck={this.onYtdChange}/>
                </div>
            </div><br/>

            <div className="terms">
                {Object.keys(filters)
                    .filter(f => f.substring(0,1) !== '_')
                    .map(k => filters[k][0].map((filter, i) => (
                        <Chip style={{ margin: 2}} key={i} onRequestDelete={this.onRemoveFilter(k, filter)}>  {
                            !(filter === 'WAL-MART') ?
                            filter.substring(filter.lastIndexOf("-") + 1) :
                                filter
                        }   </Chip>
                    )))
                }
            </div>
        </Drawer>
        )
    }
}


Sidebar.propTypes = {
    data: PropTypes.shape({
        dimensions: PropTypes.shape({
            _date: PropTypes.shape({
                min: PropTypes.object.isRequired,
                max: PropTypes.object.isRequired,
                object: PropTypes.object.isRequired
            }).isRequired
        }).isRequired,
    }).isRequired,
    filter: PropTypes.shape({
        filters      : PropTypes.object.isRequired,
        filterHandler: PropTypes.func.isRequired
    }).isRequired
}

export default withRouter(Sidebar)

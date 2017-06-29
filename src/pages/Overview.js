import React, { Component, PropTypes } from 'react'

import { cyan500, cyan50, lightBlueA200, deepOrangeA400, lightGreenA400,
purple50, purple100, purple200, purple300, purple400, purple500, purple600, purple700, purple800,purple900,
lightBlue900, lightBlue800, lightBlue700, lightBlue600, lightBlue500, lightBlue400, lightBlue300, lightBlue200, lightBlue100,lightBlue50
} from 'material-ui/styles/colors'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Select from '../components/Select'
import {getIndex} from '../helpers/comparison'
import {
    VictoryBar,
    VictoryChart,
    VictoryAxis,
    VictoryTheme,
    VictoryGroup,
    VictoryContainer,
    VictoryVoronoiContainer,
    VictoryLabel,
    VictoryTooltip
} from 'victory'

const months= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const purple = [purple900, purple800, purple700, purple600, purple500, purple400, purple300, purple200, purple100,purple50]
const lightBlue = [lightBlue900, lightBlue800, lightBlue700, lightBlue600, lightBlue500, lightBlue400, lightBlue300, lightBlue200, lightBlue100,lightBlue50]
const axisStyle = {
  axis: {stroke: "#ccc"},
  axisLabel: {fontSize: 16, padding: 20, fill: 'red'},
  grid: {stroke: "#fff"},
  ticks: {stroke: "#fff"},
  tickLabels: {fontSize: 11, padding: 5, color: '#666'}
}
class Overview extends Component {





    constructor(props) {
        super(props)

        this.state = {
            measure    : null,
            aggregation: null,
            datasets: [],
            datasets2: []
        }
    }





// i.  Tijd
// ii. Manager
// iii.    Category
// iv. Brand
// v.  Customer

    componentWillMount() {

        this.groups = {
            'Date' : this.props.data.dimensions['_date'].object.group(d=> {
                const year  = d.getFullYear()
                const month = d.getMonth()+1

                return year + '\n' + ((month <= 9) ? '0' : '') + month
            }),
            'Manager'  : this.props.data.dimensions['Manager'].group(),
            'Category' : this.props.data.dimensions['Category'].group(),
            'Brand'    : this.props.data.dimensions['Brand'].group(),
            'Customer' : this.props.data.dimensions['Customer'].group(),
            'Year'     : this.props.data.dimensions['Year'].group()
        }

        this.componentWillReceiveProps(this.props)
    }

    componentWillReceiveProps(props) {
        const { filters } = props.filter
        const measure = props.params.measure || props.data.measures[0]
        const measure2 = props.params.measure || props.data.measures[1]

        let datasets = Object.keys(this.groups)
            .map(g => this.groups[g]
                .reduceSum(d => d[measure]).all()
                    .map(s => {
                        const f    = filters.hasOwnProperty(g) ? filters[g][0] || []: []
                        const fill = (f.length && f.indexOf(s.key) < 0) ? '#ccc' : lightBlueA200
                        return {
                            key   : s.key,
                            value : +s.value,
                            label :  (Math.round(s.value * 100) / 100),
                            fill  : fill
                        }
        }))

        let datasets2 = Object.keys(this.groups)
            .map(g => this.groups[g]
                .reduceSum(d => d[measure2]).all()
                .map(s => {
                    const f    = filters.hasOwnProperty(g) ? filters[g][0] || []: []
                    const fill = (f.length && f.indexOf(s.key) < 0) ? '#ccc' : lightBlueA200
                    return {
                        key   : s.key,
                        value : +s.value,
                        label :  (Math.round(s.value * 100) / 100),
                        fill  : fill
                    }
                }))




        datasets[1].sort((a,b) => b.value - a.value).length = 10
        datasets2[1].sort((a,b) => b.value - a.value).length = 10

        datasets[2].sort((a,b) => b.value - a.value)

        datasets[3].sort((a,b) => b.value - a.value).length = 10


        datasets[4].sort((a,b) => b.value - a.value)

 datasets[1] = datasets[1].map((d, i) => ({...d, fill: lightBlue[i]}))
          datasets[3] = datasets[3].map((d, i) => ({...d, fill: lightBlue[i]}))
        datasets[5][1].fill = (datasets[5][1].value > datasets[5][0].value) ? lightGreenA400 : (datasets[5][1].value < datasets[5][0].value) ? deepOrangeA400 : lightBlueA200

        this.setState({
            ...this.state,
            measure : measure,
            datasets: datasets,
            datasets2: datasets2
        })
    }

    update = (items) =>{
        const { location, router } = this.props
        const { measure, aggregation } = items

        router.push({
            pathname: '/overview/' + [ measure, aggregation ].join('/'),
            query: location.query
        })
    }

    onClickHandler = (dimension) => (e, i, v) => {
        let filter = i.data[v].key
        const { filters, filterHandler } = this.props.filter

        if (dimension == 'Date') {
            filter = months[(+i.data[v].key.split('\n')[1])-1];
            dimension = 'Month'
        }
        if (!filters.hasOwnProperty(dimension)) {
            filters[dimension] = []
        }

        if (!Array.isArray(filters[dimension][0])) {
            filters[dimension][0] = []
        }

        const index = filters[dimension][0].indexOf(filter)

        if (index > -1) {
            filters[dimension][0].splice(index, 1)
        } else {
            filters[dimension][0].push(filter)
        }

        filterHandler(dimension,filters[dimension])
    }

    onMeasureChange = (e, i, v) => {
        this.update({ ...this.state, measure: v })
    }



    render() {
        const { data } = this.props;
        const grs = this.groups;
        const { datasets, datasets2, measure,  } = this.state


        return (
        <div className={"overview"}>
            <Toolbar className="toolbar">
                <ToolbarGroup >
                    <Select
                        value={measure}
                        label={"measure"}
                        handler={this.onMeasureChange}
                        options={data.measures} />
                </ToolbarGroup>
            </Toolbar>
            {(this.state.measure &&
            <div className="container-fluid">
               <div className=" row">
               <div className="chart col-md-2">

                    </div>
                    <div className="chart col-md-9">


            </div>








            </div>
                <div className=" row">
            <div className="chart col-md-3">

                    </div>
<div className="chart  " >
                   <VictoryChart
                       padding={60}
                    animate={{duration: 250}}

                            width={400}
                            height={400}
                            containerComponent={<VictoryContainer responsive={false}/>}

                            theme={VictoryTheme.material}
                        >
                        <VictoryAxis
                        style={axisStyle}
                        dependentAxis
                        tickCount={10}
                       //tickFormat = {(x) => grs.Manager.top(Infinity)[x].key}
                            padding={0}
                            offsetX={60}
                          // tickValues={datasets[1].keys}
                            tickLabelComponent={<VictoryLabel  text={

                             function(d) {
                                 return datasets[1][d - 1].key;
                             }

                            } angle={0} /> }
                        />
                        <VictoryAxis
                        style={axisStyle}
                            offsetY={40}

                            tickFormat={(y) => (y >= 1000000) ? (`${y / 1000000}m`): (`${y / 1000}k`)} />

                        <VictoryGroup
                            horizontal
                            animate={{duration: 100}}

                            colorScale={"warm"} offset={12}
                            style={{ data: {width: 12} }} >


                            <VictoryBar
                                events={[{
                                    target: "data",
                                    eventHandlers: {
                                        onClick: this.onClickHandler('Brand')
                                    }}]}
                                style={{ data: {width: 12} }}
                                theme={VictoryTheme.material}
                                labelComponent={<VictoryTooltip text={
                                    function(d) {

                                        return d.x + " Growth : " + getIndex(datasets2[1][d.eventKey].value, datasets[1][d.eventKey].value, 1);

                                    }
                                } style={{color: '#fff'}} flyoutStyle={{fill: '#f1f1f1', stroke: '#f1f1f1'}}x={50} dy={0}/>}



                                data={datasets[1]}
                                x={(d) => d.key}
                                y={(d) => d.value}
                            />
                            <VictoryBar

                                events={[{
                                    target: "data",
                                    eventHandlers: {
                                        onClick: this.onClickHandler('Brand')
                                    }}]}
                                style={{ data: {width: 12} }}
                                theme={VictoryTheme.material}
                                labelComponent={<VictoryTooltip style={{color: '#fff'}} flyoutStyle={{fill: '#f1f1f1', stroke: '#f1f1f1'}}x={50} dy={0}/>}
                                data={datasets2[1]}
                                x={(d) => d.key}
                                y={(d) => d.value}
                            />
                        </VictoryGroup>



                        </VictoryChart>
    <VictoryChart
        animate={{duration: 150}}
        width={270}
        height={300}
        containerComponent={<VictoryContainer responsive={false}/>}
        theme={VictoryTheme.material}
    >
        <VictoryAxis
            style={axisStyle}
            dependentAxis
            tickLabelComponent={<VictoryLabel angle={0}/>}
        />
        <VictoryAxis
            style={axisStyle}
            offsetY={40}

            tickFormat={(y) => (y >= 1000000) ? (`${y / 1000000}m`): (`${y / 1000}k`)} />



        <VictoryBar
            horizontal={true}
            events={[{
                target: "data",
                eventHandlers: {
                    onClick: this.onClickHandler('Brand')
                }}]}
            style={{ data: {width: 20} }}
            theme={VictoryTheme.material}
            labelComponent={<VictoryTooltip style={{color: '#fff'}} flyoutStyle={{fill: '#f1f1f1', stroke: '#f1f1f1'}}x={50} dy={0}/>}
            data={datasets[3]}
            x={(d) => d.key}
            y={(d) => d.value}
        />




    </VictoryChart>
                    </div>


                </div>

                </div>

            )}
        </div>
        )
    }
}

Overview.propTypes = {
    data : PropTypes.shape({
        dimensions: PropTypes.object.isRequired,
        measures  : PropTypes.array.isRequired,
        aggregations: PropTypes.array.isRequired,
    })/*.isRequired (breaks because of react-router)*/,
    filter: PropTypes.shape({
        filters: PropTypes.object.isRequired,
        filterHandler: PropTypes.func.isRequired
    })/*.isRequired*/,
    params: PropTypes.object.isRequired,
    location: PropTypes.shape({
        query: PropTypes.object.isRequired
    }).isRequired,
    router: PropTypes.object.isRequired
}

export default Overview


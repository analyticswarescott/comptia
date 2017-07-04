import React, { Component, PropTypes } from 'react'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Select from '../components/Select'
import ChartWidget from '../components/ChartWidget'
import {groupReducer, chartReducer} from '../helpers/comparison'
import { withRouter } from 'react-router'
import {lightBlueA400, lightGreenA400, deepOrangeA400} from 'material-ui/styles/colors'

import Datamaps from 'datamaps';
import Datamap from '../components/datamap'

const groupAll = 'All'
const defaultDimension = 'Month'
const defaultValue1 = { measure: 'Gross_Sales', group : 'Year', options: [], filter: '2016' }
const defaultValue2 = { measure: 'Gross_Sales', group : 'Year', options: [], filter: '2017' }

const getOptions = (dimension) => {
    const group = dimension.group()
    const value = group.all().map(r => r.key)

    group.dispose()

    return value
}

const hasValues =() => {
    return true
}

const axisStyle = {
  axis: {stroke: "#242632"},
  axisLabel: {fontSize: 16, padding: 20, fill: 'red'},
  grid: {stroke: "#242632"},
  ticks: {stroke: "grey"},
  tickLabels: {fontSize: 11, padding: 5, color: '#fff'}
}
class Overview2 extends Component {
    constructor(props) {
        super(props)

        this.dimGroup = null
        this.allGroup = null

        this.state = {
            dimension : null,
            value1    : { measure: null, group: null, options: [], filter: null },
            value2    : { measure: null, group: null, options: [], filter: null },
        }
    }

    componentWillMount() {
        this.allGroup = this.props.data.dimensions._all.group()
        this.componentWillReceiveProps(this.props)
    }

    componentWillUnmount() {
        this.allGroup.dispose()
    }

    componentWillReceiveProps(props) {
        const { data, params, location } = props

        const dimension = (params.dimension) ? params.dimension : defaultDimension

        if (dimension !== this.state.dimension) {
            if (this.dimGroup) {
                this.dimGroup.dispose()
            }
            this.dimGroup = data.dimensions[dimension].group()
        }

        let { value1, value2 } = location.query

        value1 = (value1) ? JSON.parse(value1) : defaultValue1
        value2 = (value2) ? JSON.parse(value2) : defaultValue2

        if (value1.group && value1.group === groupAll) {
            value1.group = null
            value1.filter = null
        }

        if (value2.group && value2.group === groupAll) {
            value2.group = null
            value2.filter = null
        }
        value1.options = (value1.group)
            ? (value1.group !== this.state.value1.group)
                ? getOptions(data.dimensions[value1.group])
                : this.state.value1.options
            : []


        value2.options = (value2.group)
            ? (value2.group !== this.state.value2.group)
                ? getOptions(data.dimensions[value2.group])
                : this.state.value2.options
            : []

        this.setState({
            ...this.state,
            value1,
            value2
        }

        )
    }

    onDimensionChange     = (e, i, v) => this.update({ ...this.state, dimension: v })
    onValue1MeasureChange = (e, i, v) => this.update({ ...this.state, value1: { ...this.state.value1, measure: v } })
    onValue1GroupChange   = (e, i, v) => this.update({ ...this.state, value1: { ...this.state.value1, group:   v } })
    onValue1FilterChange  = (e, i, v) => this.update({ ...this.state, value1: { ...this.state.value1, filter:  v } })
    onValue2MeasureChange = (e, i, v) => this.update({ ...this.state, value2: { ...this.state.value2, measure: v } })
    onValue2GroupChange   = (e, i, v) => this.update({ ...this.state, value2: { ...this.state.value2, group:   v } })
    onValue2FilterChange  = (e, i, v) => this.update({ ...this.state, value2: { ...this.state.value2, filter:  v } })

    update = (items) => {
        const { location, router } = this.props
        const { dimension, value1, value2 } = items

   //     if (dimension) {
            router.push({
                pathname: '/overview/',
                query: {
                    ...location.query,
                    value1: JSON.stringify({
                        measure: value1.measure,
                        group  : value1.group,
                        filter : value1.filter
                    }),
                    value2: JSON.stringify({
                        measure: value2.measure,
                        group  : value2.group,
                        filter : value2.filter
                    })

                }
            })
        //}
    }

    onClickHandler = (e, i, v) => {
        const filter = i.data[v].key
        const { filters, filterHandler } = this.props.filter
        const { dimension }  = this.state

        if (!Array.isArray(filters[dimension] || null)) {
            filters[dimension] = []
        }

        if (!Array.isArray(filters[dimension][0] || null)) {
            filters[dimension][0] = []
        }

        const index = filters[dimension][0].indexOf(filter)

        if (index > -1) {
            filters[dimension][0].splice(index, 1)
        } else {
            filters[dimension][0].push(filter)
        }

        filterHandler(dimension, filters[dimension])
    }

    render() {
        const { data, params, filter } = this.props
        const { dimension, value1, value2 } = this.state
 const value = (v) => v.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
        let chartSet1 = []
        let chartSet2 = []
        let tableSet = []
        let totalSet = []

        let dimGroup1 = {}
        let dimGroup2 = {}
        let dimOrder  = data.order.hasOwnProperty(dimension) ? data.order[dimension] : null

        if (dimension && value1.measure && value2.measure) {
            const g1Reducer = groupReducer(dimension, value1, value2)
            const g2Reducer = groupReducer(null, value1, value2)


            dimGroup1 = this.dimGroup.reduce(g1Reducer.add, g1Reducer.remove, g1Reducer.init).order(d => d.value1)
            dimGroup2 = this.allGroup.reduce(g2Reducer.add, g2Reducer.remove, g2Reducer.init).order(d => d.value1)

            const cReducer = chartReducer(value1.filter, value2.filter)

            chartSet1 = cReducer(dimGroup1.top(16))
            chartSet2 = dimGroup2.all().reduce((k, v) => {
                k[0].value += +v.value.value1 || 0
                k[1].value += +v.value.value2 || 0
                return k
            }, [
                {key: (value1.filter && value1.filter !== value2.filter ? value1.filter : value1.measure), value: 0},
                {key: (value2.filter && value2.filter !== value1.filter ? value2.filter : value2.measure), value: 0}
            ])

            chartSet2[0]['label'] = value(chartSet2[0].value)
            chartSet2[0]['fill']  =  lightBlueA400
            chartSet2[1]['label'] = value(chartSet2[1].value)
            chartSet2[1]['fill']  = chartSet2[0].value < chartSet2[1].value ? lightGreenA400 : (chartSet2[0].value > chartSet2[1].value) ? deepOrangeA400 : lightBlueA400
            chartSet1.sets = chartSet1.sets.map(s => s.map(d => {
                if (filter.filters.hasOwnProperty(dimension)) {
                    const filters = filter.filters[dimension][0] || []

                    if (filters.length && filters.indexOf(d.key) < 0) {
                        d.fill = '#2a2c3a'
                    }}

                return d
            }))


            tableSet = dimGroup1.top(Infinity).map(i => ({
                key: i.key,
                value: {
                    ...i.value,
                    sum: i.value.value2 - i.value.value1,
                    percentage:  Math.round((((i.value.value1 - i.value.value2) / i.value.value1) * 100) * -1)
                }
            }))

            if (filter.filters.hasOwnProperty(dimension)
                && Array.isArray(filter.filters[dimension])
                && Array.isArray(filter.filters[dimension][0])
            ) {
                tableSet = tableSet.filter((row) => filter.filters[dimension][0].indexOf(row.key) > -1)
            }


            totalSet = tableSet.reduce((k, v) => {
                return {
                    value1: k.value1 + +v.value.value1 || 0,
                    value2: k.value2 + +v.value.value2 || 0,
                    sum: k.sum + (v.value.value2 - v.value.value1)
                }
            }, { value1: 0, value2: 0, sum: 0})

            const order = data.order.hasOwnProperty(dimension)
                ? data.order[dimension]
                : null

            if (order) {
                chartSet1.keys = order
                chartSet1.sets = chartSet1.sets.map(s => s.sort((a, b) => {
                    return order.indexOf(a.key) - order.indexOf(b.key)
                }))
            }


        }

        const groupOptions = [
            groupAll,
            ...Object.keys(data.dimensions).filter(k => k.substring(0, 1) !== '_')
        ]



        var data2 = {
                USA: { fillKey: 'authorHasTraveledTo' },
                JPN: { fillKey: 'authorHasTraveledTo' },
                ITA: { fillKey: 'authorHasTraveledTo' },
                CRI: { fillKey: 'authorHasTraveledTo' },
                KOR: { fillKey: 'authorHasTraveledTo' },
                DEU: { fillKey: 'authorHasTraveledTo' },
                CAN: { fillKey: 'test' },
            }

        var data3 = {
            USA: { fillKey: 'authorHasTraveledTo' },
            JPN: { fillKey: 'authorHasTraveledTo' },
            ITA: { fillKey: 'authorHasTraveledTo' },
            CRI: { fillKey: 'authorHasTraveledTo' },
            KOR: { fillKey: 'authorHasTraveledTo' },
            DEU: { fillKey: 'authorHasTraveledTo' },
            CAN: { fillKey: 'test' },
        }


        return (



        <div className={"comparison"}>
            <Toolbar className="toolbar">
                <ToolbarGroup >
                    <Select
                        value={value1.measure}
                        label={"measure"}
                        handler={this.onValue1MeasureChange}
                        options={data.measures} />
                    <Select
                        value={value1.group}
                        label={"group"}
                        handler={this.onValue1GroupChange}
                        options={groupOptions} />
                    <Select
                        value={value1.filter}
                        label={"value"}
                        handler={this.onValue1FilterChange}
                        options={value1.options} />
                </ToolbarGroup>
                <ToolbarGroup >
                    <Select
                        value={value2.measure}
                        label={"measure"}
                        handler={this.onValue2MeasureChange}
                        options={data.measures} />
                    <Select
                        value={value2.group}
                        label={"group"}
                        handler={this.onValue2GroupChange}
                        options={groupOptions} />
                    <Select
                        value={value2.filter}
                        label={"value"}
                        handler={this.onValue2FilterChange}
                        options={value2.options} />
                </ToolbarGroup>
            </Toolbar>
                <div className="charts row" >
                    <div className="col-sm-1 " ></div>
                    <div className="col-sm-8 ">
                    <Datamap
                        responsive
                       scope="usa"
                        data={data2}
                        fills={{
                            defaultFill: '#abdda4',
                            authorHasTraveledTo: '#fa0fa0',
                            test: 'blue'
                        }}
                        projection="mercator"
                        updateChoroplethOptions={{ reset: false }}
                    />
                    </div>


                </div>
            <div className="charts row">
                <div className="col-sm-4 " >

                    <ChartWidget
                        barWidth={12}
                        data={this.props.data}
                        filter={this.props.filter}
                        dimension="Month"
                        h={200}
                        w={340}
                    />
                </div>

                <div className="col-sm-4 ">

                    <ChartWidget
                        barWidth={8}
                        top={12}
                        data={this.props.data}
                        filter={this.props.filter}
                        dimension="Region"
                        h={200}
                        w={340}
                    />
                </div>

                <div className="col-sm-4 ">

                    <ChartWidget
                        barWidth={10}
                        top={12}
                        data={this.props.data}
                        filter={this.props.filter}
                        dimension="Region"
                        h={200}
                        w={340}
                    />
                </div>
            </div>



            </div>
        )
    }
}

Overview2.propTypes = {
    data : PropTypes.shape({
        dimensions: PropTypes.object.isRequired,
        measures  : PropTypes.array.isRequired
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

export default withRouter(Overview2)



/*
<div className="visual">
    <div className="charts row">
    <div className="col-sm-6 ">
    <ChartWidget
barWidth={15}
data={this.props.data}
filter={this.props.filter}
dimension="Month"
h={200}
w={440}
    />
    </div>
    <div className="col-sm-6 ">
    <ChartWidget
barWidth={15}
data={this.props.data}
filter={this.props.filter}
dimension="Manager"
top={10}
h={200}
w={420}
    />
    </div>
    </div>


    {/!*row 2*!/}
<div className="charts row">

    <div className="col-sm-6 ">

        <ChartWidget
            barWidth={15}
            data={this.props.data}
            filter={this.props.filter}
            dimension="Customer"
            top={10}
            h={180}
            w={560}
        />
    </div>
    <div className="col-sm-6 ">
        <ChartWidget
            barWidth={15}
            data={this.props.data}
            filter={this.props.filter}
            dimension="Division"
            top={8}
            h={180}
            w={560}
        />
    </div>
</div>

<div className="charts row">
    <div className="col-sm-6 ">
    <ChartWidget
barWidth={15}
data={this.props.data}
filter={this.props.filter}
dimension="Category"
top={12}
h={160}
w={420}
    />
    </div>
    <div className="col-sm-6 ">
    <ChartWidget
barWidth={15}
data={this.props.data}
filter={this.props.filter}
dimension="Brand"
top={10}
h={160}
w={420}
    />
    </div>
    </div>
    {/!*Item Level*!/}
<div className="charts row">
    <div className="col-sm-12 ">
        <ChartWidget
            barWidth={14}
            data={this.props.data}
            filter={this.props.filter}
            dimension="Item"
            top={18}
            horizontal={true}
            h={554}
            w={650}
        />
    </div>
</div>




</div>*/

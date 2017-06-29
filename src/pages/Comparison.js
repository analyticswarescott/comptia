import React, { Component, PropTypes } from 'react'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Select from '../components/Select'
import {groupReducer, chartReducer} from '../helpers/comparison'
import Table from '../components/Table';
import Totals from '../components/Totals';
import { withRouter } from 'react-router'
import {lightBlueA400, lightGreenA400, deepOrangeA400} from 'material-ui/styles/colors'

import ChartWidget from '../components/ChartWidget'

import {
    VictoryBar,
    VictoryChart,
    VictoryAxis,
    VictoryTheme,
    VictoryGroup,
    VictoryContainer,
    VictoryLabel,
    VictoryTooltip
} from 'victory'

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

class Comparison extends Component {
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
            dimension,
            value1,
            value2
        })
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

        if (dimension) {
            router.push({
                pathname: '/comparison/' + dimension,
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
        }
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

        let mainChart = null;

        if (dimension === "Item") {
            mainChart =       <div className="col-sm-10" style={{paddingTop: 10}}>
                <ChartWidget
                    horizontal={true}
                    data={this.props.data}
                    filter={this.props.filter}
                    dimension={dimension}
                    barWidth={15}
                    top={14}
                    h={550}
                    w={880}
                />
            </div>;
        }
        else {
            mainChart =       <div className="col-sm-10" style={{paddingTop: 10}}>
                <ChartWidget
                    //horizontal={true}
                    data={this.props.data}
                    filter={this.props.filter}
                    dimension={dimension}
                    barWidth={20}
                    h={300}
                    w={880}
                />
            </div>;
        }


        return (
        <div className={"comparison"}>
            <Toolbar className="toolbar">
                <ToolbarGroup >
                    <Select
                        value={dimension}
                        label={"dimension"}
                        handler={this.onDimensionChange}
                        options={data.dimensions} />
                </ToolbarGroup>
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

            <div className="visual">
            <div className="charts row">


                {mainChart}


                <div className="col-sm-2" style={{paddingTop: 10}}>
                    <ChartWidget
                        data={this.props.data}
                        filter={this.props.filter}
                        dimension={dimension}
                        totalOnly={true}
                        barWidth={20}
                        h={320}
                        w={120}
                    />
                </div>


            </div>

                <div className="numbers">
                    <Totals

                        value1={chartSet2[0].value}
                        value2={chartSet2[1].value}
/>
                    <Table
                        set={tableSet}
                        order={dimOrder}
                        dimensionName={params.dimension}
                        measure={params.measure}
                        value1={value1.measure + (value1.filter ? ' ' + value1.filter : '')}
                        value2={value2.measure + (value2.filter ? ' ' + value2.filter : '')}
                        />
                </div>
            </div>
        </div>)
    }
}

Comparison.propTypes = {
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

export default withRouter(Comparison)

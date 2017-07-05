import React, { Component, PropTypes } from 'react'
import {groupReducer, chartReducer} from '../helpers/comparison'
import { withRouter } from 'react-router'

import {getIndex} from '../helpers/comparison'
import {addCommas, intToString} from '../helpers/comparison'
import Chip from 'material-ui/Chip'

import Datamaps from 'datamaps';
import Datamap from '../components/datamap'
import * as d3 from 'd3';

const groupAll = 'All'
const defaultValue1 = { measure: 'Gross_Sales', group : 'Year', options: [], filter: '2016' }
const defaultValue2 = { measure: 'Gross_Sales', group : 'Year', options: [], filter: '2017' }

const getOptions = (dimension) => {
    const group = dimension.group()
    const value = group.all().map(r => r.key)

    group.dispose()

    return value
}


const axisStyle = {
    axis: {stroke: "#242632"},
    axisLabel: {fontSize: 16, padding: 20, fill: 'red'},
    grid: {stroke: "#242632"},
    ticks: {stroke: "#fff"},
    tickLabels: {fontSize: 10, padding: 5, color: '#fff', zIndex: 999}
}
class MapWidget extends Component {
    constructor(props) {
        super(props)

        this.dimGroup = null
        this.allGroup = null

        this.state = {
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
        const { data, params, location, dimension, filter } = props


        if (this.dimGroup) {
            this.dimGroup.dispose()
        }
        this.dimGroup = data.dimensions[this.props.dimension].group()

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

    onGeoClick = (geography) => {

        //const filter = i.data[v].key
        const filter = geography.id

        const { filters, filterHandler } = this.props.filter
        const { dimension }  = this.props

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
        const { data, params, filter, dimension, top, horizontal, h, w, barWidth, totalOnly } = this.props

        //console.log(dimension);

        const {  value1, value2 } = this.state;

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


            dimGroup1 = this.dimGroup.reduce(g1Reducer.add, g1Reducer.remove, g1Reducer.init).order(d => d.value2)
            dimGroup2 = this.allGroup.reduce(g2Reducer.add, g2Reducer.remove, g2Reducer.init).order(d => d.value2)

            const cReducer = chartReducer(value1.filter, value2.filter)

            var takeTop;
            if (top) {takeTop = top} else {takeTop = 50;}

            chartSet1 = cReducer(dimGroup1.top(takeTop))

            chartSet2 = cReducer(dimGroup2.all())
            chartSet2.sets[0][0].key = value1.filter && value1.filter !== value2.filter ? value1.filter : value1.measure;
            chartSet2.sets[1][0].key = value2.filter && value2.filter !== value1.filter ? value2.filter : value2.measure;

            chartSet2.keys.pop();

            chartSet2.keys.push(value1.filter && value1.filter !== value2.filter ? value1.filter : value1.measure);
            chartSet2.keys.push(value2.filter && value2.filter !== value1.filter ? value2.filter : value2.measure);


            chartSet1.sets = chartSet1.sets.map(s => s.map(d => {
                if (filter.filters.hasOwnProperty(dimension)) {
                    const filters = filter.filters[dimension][0] || []

                    if (filters.length && filters.indexOf(d.key) < 0) {
                        //d.fill = '#2a2c3a'
                        d.fo = '#2a2c3a';
                     /*   console.log("===== fill key for " + d.key + " TEST")
                        d.fillKey = "test";*/
                    }
                    else {
                        d.fh = 'boo'
                    }
                }
                    else {

                /*    console.log("===== fill key for " + d.key + " TEST2")
                    d.fillKey = "test2"*/
                }

               // d.fillKey = "test"
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

        var tickVals = chartSet1.keys;
        if (totalOnly) {
            chartSet1 = chartSet2;
            tickVals = ['Total'];


        }


        var numItems = chartSet1.sets[0].length


  /*      var data3 = {
            IL: { fillKey: 'authorHasTraveledTo' },
            OR: { fillKey: 'authorHasTraveledTo' },
            NY: { fillKey: 'test' },
        }*/


        var c= d3.rgb("blue")

        //format data

        var dataset = {};
   /*     chartSet1.sets[0].forEach(function(data){

            var fk;
            if (data.value === 0) {
                fk = "defaultFill"
            }
            else {
                fk = data.fillKey
            }

            data4[data.key] = {fillColor: fk}
        });
*/





        // We need to colorize every country based on "numberOfWhatever"
        // colors should be uniq for every value.
        // For this purpose we create palette(using min/max series-value)
        var onlyValues = chartSet1.sets[0].map(function(obj){ return obj.value; });
        var minValue = Math.min.apply(null, onlyValues),
            maxValue = Math.max.apply(null, onlyValues);



        // create color palette function


        // fill dataset in appropriate format
        chartSet1.sets[1].forEach(function(item){ //
            // item example value ["USA", 70]

            var paletteScale = d3.scale.log()
                .domain([minValue + 100 ,maxValue + 100])
                // .range(["#EFEFFF","#02386F"]); // blue color
                .range(["#ffffff",item.fill])
                .base(2)

               var value = item.value;



               if (item.fo) {
                   dataset[item.key] = { numberOfThings: value, fillColor: d3.rgb(paletteScale(value)).darker(1).toString(), borderColor: '#000000',
                       highlightBorderWidth: 5};
               }
               else {
                 if (item.fh) {
                     dataset[item.key] = { numberOfThings: value, fillColor: item.fill, borderColor: '#DEDEDE',
                         highlightBorderWidth: 2};
                 }
                 else {
                     dataset[item.key] = {
                         numberOfThings: value, fillColor: paletteScale(value), borderColor: '#DEDEDE',
                         highlightBorderWidth: 2
                     };
                 }

               }

        });




            return (

                <div>

                    <Datamap
                        onGeoClick={this.onGeoClick.bind(this)}
                        responsive
                        scope="usa"
                        data={dataset}
                        fills={{
                           /* defaultFill: '#abdda4',*/
                            defaultFill: '#ffffff',
                            authorHasTraveledTo: '#fa0fa0',
                            test: c.brighter(2).toString(),
                            test2: '#fa0fa0',
                        }}
                        projection="mercator"
                        updateChoroplethOptions={{ reset: true }}





                    />


                </div>

            )


    }


}



MapWidget.propTypes = {
    dimension : PropTypes.string.isRequired,
    top : PropTypes.number,
    h : PropTypes.number,
    w: PropTypes.number,
    barWidth: PropTypes.number,
    totalOnly: PropTypes.bool,
    horizontal: PropTypes.bool,
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

export default  withRouter( MapWidget)

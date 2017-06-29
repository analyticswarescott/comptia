import React, { Component, PropTypes } from 'react';
import crossfilter from 'crossfilter'
import * as request from 'd3-request';
import LinearProgress from 'material-ui/LinearProgress'
import Filter from './Filter'




class Data extends Component {
    constructor(props) {
        super(props)

        this.state = {
            url       : null,
            dimensions: null,
            default_filters: null,
            measures  : null,
            aggregations: null,
            order     : null,
            loaded    : false,
            update    : false
        }
    }

    componentDidMount() {
        this.componentWillReceiveProps(this.props)
    }

    componentWillReceiveProps(props) {
        const {
            url, dimensions, measures,
            aggregations, order, preprocessor, default_filters
        } = props

        if (url !== this.state.url) {

            this.setState({
                loaded      : false
            })


            request.csv(url, (error, data) => {

                if(error) {
                    console.log(error);
                }

                if (typeof preprocessor === 'function') {
                    data = preprocessor(data)
                }

                const dataset = crossfilter(data)
                const objects = dimensions.reduce((v, i) => {
                    v[i] = dataset.dimension(d => d[i])
                    return v
                }, {
                    _all: dataset.dimension(d => 1),
                })

                const date = dataset.dimension(d => d._date)
                objects._date = {
                    min   : date.bottom(1)[0]._date,
                    max   : date.top(1)[0]._date,
                    object: date
                }

                this.setState({
                    url         : url,
                    dimensions  : objects,
                    default_filters: default_filters,
                    measures    : measures,
                    aggregations: aggregations,
                    order       : order,
                    loaded      : true
                })
            })
        }
    }


    forceUpdate = () => {
        this.setState({
            ...this.state,
            update: new Date()
        })
    }

    render() {
        const { loaded } = this.state

        if (!loaded) {
            return (

                <div className="loader">
              <LinearProgress mode="indeterminate" />
                <div className="text " >Loading data, please wait...</div>
                </div>



            )
        }

        const data = { ...this.state, forceUpdate: this.forceUpdate }

        return (
            <div className="data ">
                <Filter data={data}>
                    {React.Children.map(
                        this.props.children,
                        child => React.cloneElement(child, { ...child.props, data })
                    )}
                </Filter>
            </div>
        )
    }
}

Data.propTypes = {
    url         : PropTypes.string.isRequired,
    dimensions  : PropTypes.array.isRequired,
    measures    : PropTypes.array.isRequired,
    aggregations: PropTypes.array.isRequired,
    preprocessor: PropTypes.func
}

export default Data

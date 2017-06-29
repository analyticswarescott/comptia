import React, { Component, PropTypes } from 'react'
import Chip from 'material-ui/Chip';


class Filter extends Component {


    render() {
        return (
            <div className="filters">
            {this.props.values.map((v, i) => (

                <Chip key={i}> foo </Chip>
            ))}
            </div>
        )
    }
}

Filter.propTypes = {
    dimension : PropTypes.string.isRequired,
    values    : PropTypes.array.isRequired,
}

export default Filter

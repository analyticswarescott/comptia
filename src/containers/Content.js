import React, { Component } from 'react'

class Content extends Component {
    render() {
        return (
            <div className="container-fluid content indent">
                {React.Children.map(
                    this.props.children,
                    (child) => React.cloneElement(child, this.props)
                )}
            </div>
        )
    }
}

export default Content

import React from 'react';
import Datamaps from 'datamaps';
import {withRouter, Link} from 'react-router'

import * as d3 from 'd3'

const MAP_CLEARING_PROPS = [
	'height', 'scope', 'setProjection', 'width'
];

const propChangeRequiresMapClear = (oldProps, newProps) => {
	return MAP_CLEARING_PROPS.some((key) =>
		oldProps[key] !== newProps[key]
	);
};







class Datamap extends React.Component {


	doneDM(datamap, ref) {
        datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
            console.log(geography);

            ref.onGeoClicky(geography);

        });
    }




onGeoClicky(geography)  {

    console.log(" geo click =======>>> " + geography.properties.id)

    this.props.onGeoClick(geography)

}

	static propTypes = {
		arc: React.PropTypes.array,
		arcOptions: React.PropTypes.object,
		bubbleOptions: React.PropTypes.object,
		bubbles: React.PropTypes.array,
		data: React.PropTypes.object,
		graticule: React.PropTypes.bool,
		height: React.PropTypes.any,
		labels: React.PropTypes.bool,
		responsive: React.PropTypes.bool,
		style: React.PropTypes.object,
		updateChoroplethOptions: React.PropTypes.object,
		width: React.PropTypes.any
	};

	constructor(props) {
		super(props);
		this.resizeMap = this.resizeMap.bind(this);

	}

	componentDidMount() {
		if (this.props.responsive) {
			window.addEventListener('resize', this.resizeMap);
		}
		this.drawMap();
	}

	componentWillReceiveProps(newProps) {
		if (propChangeRequiresMapClear(this.props, newProps)) {
			this.clear();
		}
	}

	componentDidUpdate() {
		this.drawMap();


	}

	componentWillUnmount() {
		this.clear();
		if (this.props.responsive) {
			window.removeEventListener('resize', this.resizeMap);
		}
	}

	clear() {
		const { container } = this.refs;

		for (const child of Array.from(container.childNodes)) {
			container.removeChild(child);
		}

		delete this.map;
	}

	drawMap() {
		const {
			arc,
			arcOptions,
			bubbles,
			bubbleOptions,
			data,
			graticule,
			labels,
			updateChoroplethOptions,
			popupTemplate,
			...props
		} = this.props;

		let map = this.map;

		if (!map) {
			map = this.map = new Datamaps({
				...props,
				data,
				element: this.refs.container,

                geographyConfig: {
                    borderColor: '#DEDEDE',
                    highlightBorderWidth: 2,
                    // don't change color on mouse hover
                    highlightFillColor: function(geo) {
                        return geo['fillColor'] || '#F5F5F5';
                    },
                    // only change border
                    highlightBorderColor: '#B7B7B7',
                    // show desired information in tooltip
                    popupTemplate: function(geo, data) {
                        // don't show tooltip if country don't present in dataset
                        if (!data) { return ; }
                        // tooltip content
                        return ['<div class="hoverinfo">',
                            '<strong>', geo.properties.name, '</strong>',
                            '<br>Current Year: <strong>', data.numberOfThings, '</strong>',
                            '</div>'].join('');
                    }
                }


            });


            this.map.done = this.doneDM(map, this);



		} else {
			map.updateChoropleth(data, updateChoroplethOptions);
		}

		if (arc) {
			map.arc(arc, arcOptions);
		}

		if (bubbles) {
			map.bubbles(bubbles, bubbleOptions);
		}

		if (graticule) {
			map.graticule();
		}

		if (labels) {
			map.labels();
		}


	}

	resizeMap() {
		this.map.resize();
	}

	render() {
		const style = {
			height: '100%',
			position: 'relative',
			width: '100%',
			...this.props.style
		};

		return <div ref="container" style={style} />;
	}

}

export default withRouter(Datamap)

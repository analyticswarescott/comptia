import React, { Component } from 'react'

import {Table as MuiTable, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

class Table extends Component {
    constructor(props) {
        super(props)

        this.state = {
            type: 'ASC',
            column: 1,
            key: (d) => d.key,
        }
    }



    order(set, column, key, type, order) {
        if (column === 1 && order) {
            return (type === 'ASC')
                ? set.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
                : set.sort((a, b) => order.indexOf(b.key) - order.indexOf(a.key))
        }

        return (type === 'ASC')
            ? set.sort((a, b) => {
                a = key(a)
                b = key(b)

                return (a > b) ? 1 : (b > a) ? -1 : 0
            })
            : set.sort((a, b) => {
                a = key(a)
                b = key(b)

               return (a < b) ? 1 : (b < a) ? -1 : 0
            })

    }

    onClickHandler = (event, o, i) => {
       let type = (this.state.column === i && this.state.type === 'ASC') ? 'DESC' : 'ASC'
       let key  = null

       switch (i) {
            case 1: key = (o) => o.key; break;
            case 2: key = (o) => o.value.value1; break
            case 3: key = (o) => o.value.value2; break
            case 4: key = (o) => o.value.sum; break
            case 5: key = (o) => o.value.percentage; break
            default: key = (o) => o.key;
       }

       this.setState({
            ...this.state,
            column: i,
            key: key,
            type: type
       })
    }

    render() {
        const { key, column, type } = this.state

        const data  = this.order(this.props.set, column, key, type, this.props.order || null)
        const value = (v) => v.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')

        return (
        <MuiTable className='table'  >
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                <TableRow style={{height: '26px', color: '#333', backgroundColor: '#ccc'}} onCellClick={this.onClickHandler}>
                    <TableHeaderColumn style={{height: '26px'}} >{this.props.dimensionName}</TableHeaderColumn>
                    <TableHeaderColumn style={{height: '26px'}}>{this.props.value1}</TableHeaderColumn>
                    <TableHeaderColumn style={{height: '26px'}}>{this.props.value2}</TableHeaderColumn>
                    <TableHeaderColumn style={{height: '26px'}}>sum</TableHeaderColumn>
                    <TableHeaderColumn style={{height: '26px'}}>percentage</TableHeaderColumn>
                </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false} >
            {data.filter(d => !(d.value.value1 ===0 && d.value.value2 === 0)).map((s, i) => (
                <TableRow key={i} style={{ height: '26px', color: '#333', backgroundColor: i % 2 == 0 ? '#f7f7f7' : '#fff'}}>
                <TableRowColumn style={{ height: '26px', color: '#333', backgroundColor: i % 2 == 0 ? '#f7f7f7' : '#fff'}} >{s.key}</TableRowColumn>
                <TableRowColumn style={{ height: '26px', color: '#333', backgroundColor: i % 2 == 0 ? '#f7f7f7' : '#fff'}} >{value(s.value.value1)}</TableRowColumn>
                <TableRowColumn style={{ height: '26px', color: '#333', backgroundColor: i % 2 == 0 ? '#f7f7f7' : '#fff'}} >{value(s.value.value2)}</TableRowColumn>
                <TableRowColumn style={{ height: '26px', color: '#333', backgroundColor: i % 2 == 0 ? '#f7f7f7' : '#fff'}} >{value(s.value.sum)}</TableRowColumn>
                <TableRowColumn style={{ height: '26px', color: '#333', backgroundColor: i % 2 == 0 ? '#f7f7f7' : '#fff'}} >{s.value.percentage + ' %'}</TableRowColumn>
                </TableRow>
            ))}
            </TableBody>
        </MuiTable>
        )
    }
}

export default Table

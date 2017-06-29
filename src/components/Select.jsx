import React from 'react'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem';

const style = {
    width : 150,
    borderBottom: 'none'
}

const Select = ({
    value,
    label,
    handler,
    options
}) => {
    if (!Array.isArray(options)) {
        options = Object.keys(options).filter(k => k.substring(0, 1) !== '_')
    }

    return (
        <SelectField
            className="select-field"
            style={style}
            value={value}
            floatingLabelText={label}
            onChange={handler}
            //style={{color: '#fff'}}
            underlineStyle={{visibility: 'hidden'}}>
            {options && options.map((k, i) =>
                <MenuItem className="menu-item" key={i} value={k} primaryText={k}/>
            )}
        </SelectField>
    )
}


export default Select

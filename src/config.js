

const dataset = {
    preprocessor: (data) => data.map(d => {
        const date = new Date(Date.parse(d.Month + ' ' + d.Day + ' ' + d.Year))

        return {...d, _date: date }
    })

}


export default dataset

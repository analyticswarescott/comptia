const DATE_DIMENSION = '_date'

/**
 * Create terms filter
 *
 * @param  {Array}    terms
 * @return {Function}
 */
export const createTermsFilter = (terms) => {
    return (d) => terms.indexOf(d) !== -1
}

/**
 * Create date filter
 *
 * @param  {Date}     toDate
 * @return {Function}
 */
export const createDateFilter = (fromDate, toDate, isYtd) => {
    if (isYtd) {
        toDate = new Date()
    }

    const toMonth = toDate.getMonth()

    return (!isYtd) ?
        [ fromDate, toDate ]
        : (d) => {

            if (d.getFullYear() > toDate.getFullYear()) {
                return false
            }

            const month = d.getMonth()

            if (month <= toMonth) {
                return (month < toMonth
                    || d.getDate() <= toDate.getDate()
                )
            }

            return false
        }
}

export const applyFilters = (dimensions, oldFilters, newFilters) => {
    Object.keys(dimensions).forEach(d => {
        const oldFilter = JSON.stringify(oldFilters[d] || {})
        const newFilter = JSON.stringify(newFilters[d] || {})

        if (oldFilter === newFilter) {
            return
        }

        const dimension = (d === DATE_DIMENSION) ? dimensions[d].object : dimensions[d]
        dimension.filterAll()

        if (oldFilters.hasOwnProperty(d) && !newFilters.hasOwnProperty(d)) {

            return
        }

        let filter = newFilters[d]

        if (Array.isArray(filter)) {
            if (d === DATE_DIMENSION) {

                filter = createDateFilter(...filter)
            } else if (Array.isArray(filter[0])) {
                filter = createTermsFilter(filter[0])
            }


        }

        dimension.filter(filter)
    })

    return newFilters
}

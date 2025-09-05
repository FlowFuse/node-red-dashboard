export function getRadius (chartType, sIndex, seriesLength) {
    const isDoughnut = chartType === 'doughnut'
    const min = isDoughnut ? 40 : 0
    const max = isDoughnut ? 100 : 100

    const bandWidth = (max - min) / seriesLength

    // given the number of series, calculate the min and max radius for the series
    const minRadius = min + (bandWidth * sIndex)
    const maxRadius = min + (bandWidth * (sIndex + 1))

    return [`${minRadius}%`, `${maxRadius}%`]
}

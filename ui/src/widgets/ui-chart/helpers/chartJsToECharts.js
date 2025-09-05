// helpers that convert the legacy chartJS options to the new echarts options
const interpolation = (type) => {
    switch (type) {
    case 'cubic':
    case 'cubicMono':
    case 'bezier':
        return true
    case 'linear':
        return false
    case 'step':
        return false // eCharts uses step: true for stepped lines
    default:
        return false
    }
}

export default {
    interpolation (type) {
        return interpolation(type)
    },
    setSmooth (series, interpolationValue) {
        if (series.type === 'line') {
            series.smooth = interpolation(interpolationValue)
            if (interpolationValue === 'step') {
                series.step = 'end'
            } else {
                delete series.step
            }
        }
    },
    seriesType (chartType) {
        switch (chartType) {
        case 'line':
            return 'line'
        case 'bar':
        case 'histogram':
            return 'bar'
        case 'scatter':
            return 'scatter'
        default:
            return 'line'
        }
    },
    axisType (axisType) {
        switch (axisType) {
        case 'linear':
            return 'value'
        case 'time':
            return 'time'
        case 'category':
        case 'bins':
            return 'category'
        default:
            return 'category'
        }
    },
    symbol (pointShape) {
        if (pointShape === 'false') {
            return 'none'
        }
        switch (pointShape) {
        case 'circle':
            return 'circle'
        case 'rect':
        case 'rectangle':
            return 'rect'
        case 'triangle':
            return 'triangle'
        case 'diamond':
            return 'diamond'
        default:
            return 'circle'
        }
    }
}

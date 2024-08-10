function valueToColor (segments, value) {
    // loop over ordered segments and find the segment this value lives inside
    segments.sort((a, b) => a.from - b.from)

    let color = segments[0].color
    segments.forEach((s) => {
        if (value >= s.from) {
            color = s.color
        }
    })
    return color
}

function getTextColor (segments, value) {
    const hex2rgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)

        return [r, g, b]
    }
    const rgb = hex2rgb(valueToColor(segments, value))
    if ((rgb[0] * 0.299) + (rgb[1] * 0.587) + (rgb[2] * 0.114) > 186) {
        return 'black'
    } else {
        return 'white'
    }
}

export default {
    valueToColor,
    getTextColor
}

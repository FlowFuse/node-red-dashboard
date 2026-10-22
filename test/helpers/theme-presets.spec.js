const fs = require('fs')
const path = require('path')

const should = require('should') // eslint-disable-line no-unused-vars

// Extract THEME_PRESETS from the editor HTML — the values we actually ship.
function loadPresets () {
    const src = fs.readFileSync(path.join(__dirname, '../../nodes/config/ui_base.html'), 'utf8')
    const marker = src.indexOf('const THEME_PRESETS =')
    if (marker === -1) { throw new Error('THEME_PRESETS not found in ui_base.html') }
    const objStart = src.indexOf('{', marker)
    let depth = 0
    let end = objStart
    for (; end < src.length; end++) {
        if (src[end] === '{') { depth++ } else if (src[end] === '}') { depth--; if (depth === 0) { end++; break } }
    }
    // eslint-disable-next-line no-eval
    return eval('(' + src.slice(objStart, end) + ')')
}

// The ui-theme node defaults; asserted below to stay in sync with the light preset.
function loadThemeNodeDefaults () {
    const src = fs.readFileSync(path.join(__dirname, '../../nodes/config/ui_theme.html'), 'utf8')
    const grab = (key) => {
        const keyAt = src.indexOf(key + ': {')
        if (keyAt === -1) { throw new Error(key + ' default not found in ui_theme.html') }
        const valAt = src.indexOf('value: {', keyAt)
        const objStart = src.indexOf('{', valAt)
        let depth = 0
        let end = objStart
        for (; end < src.length; end++) {
            if (src[end] === '{') { depth++ } else if (src[end] === '}') { depth--; if (depth === 0) { end++; break } }
        }
        // eslint-disable-next-line no-eval
        return eval('(' + src.slice(objStart, end) + ')')
    }
    return { colors: grab('colors'), sizes: grab('sizes') }
}

function hexToRgb (h) {
    h = h.replace('#', '')
    if (h.length === 3) { h = h.split('').map(c => c + c).join('') }
    return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16))
}

// what Baseline.vue's getContrast() renders as the on-colour (AERT brightness)
function getContrast (bg) {
    const [r, g, b] = hexToRgb(bg)
    const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000)
    return brightness > 125 ? '#000000' : '#ffffff'
}

// WCAG 2.1 relative-luminance contrast ratio
function relLum (hex) {
    const c = hexToRgb(hex).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) })
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
function contrast (a, b) {
    const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
}

const AA = 4.5

describe('theme presets accessibility', function () {
    const presets = loadPresets().presets

    it('ships light and dark presets', function () {
        presets.should.have.property('light')
        presets.should.have.property('dark')
    })

    describe('ui-theme node defaults', function () {
        const defaults = loadThemeNodeDefaults()
        it('default colors match the light preset', function () {
            defaults.colors.should.eql(presets.light.colors)
        })
        it('default sizes match the light preset', function () {
            defaults.sizes.should.eql(presets.light.sizes)
        })
    })

    Object.keys(presets).forEach((name) => {
        describe(name + ' preset', function () {
            const colors = presets[name].colors
            const surfaces = { page: colors.bgPage, group: colors.groupBg, header: colors.surface, primary: colors.primary }
            Object.keys(surfaces).forEach((surface) => {
                it('rendered text on the ' + surface + ' surface meets WCAG AA', function () {
                    const bg = surfaces[surface]
                    contrast(getContrast(bg), bg).should.be.aboveOrEqual(AA)
                })
            })
        })
    })
})

// HTML elements that never have content and so may legitimately be written without a closing tag
const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
])

// Elements whose content is raw text and must be copied verbatim
const RAW_TEXT_ELEMENTS = new Set(['script', 'style', 'textarea', 'title'])

/**
 * Vue templates allow any component to be self-closed (`<v-btn ... />`), but the browser's
 * HTML parser ignores the trailing slash on non-void elements, so the following siblings end
 * up nested inside the element. Expand `<tag ... />` into `<tag ...></tag>` before the markup
 * is handed to DOMParser. Comments, raw text elements and quoted attribute values are left untouched.
 * @param {string} html
 * @returns {string}
 */
function expandSelfClosingTags (html) {
    if (typeof html !== 'string' || !html.includes('/>')) {
        return html
    }
    let out = ''
    let i = 0
    const len = html.length
    while (i < len) {
        const lt = html.indexOf('<', i)
        if (lt === -1) {
            out += html.slice(i)
            break
        }
        out += html.slice(i, lt)
        if (html.startsWith('<!--', lt)) {
            const end = html.indexOf('-->', lt + 4)
            const stop = end === -1 ? len : end + 3
            out += html.slice(lt, stop)
            i = stop
            continue
        }
        const nameMatch = /^<([a-zA-Z][^\s/>]*)/.exec(html.slice(lt, lt + 200))
        if (!nameMatch) {
            out += '<'
            i = lt + 1
            continue
        }
        const name = nameMatch[1]
        // scan to the end of the start tag, skipping quoted attribute values
        let j = lt + nameMatch[0].length
        let quote = null
        while (j < len) {
            const c = html[j]
            if (quote) {
                if (c === quote) quote = null
            } else if (c === '"' || c === "'") {
                quote = c
            } else if (c === '>') {
                break
            }
            j++
        }
        if (j >= len) {
            // unterminated tag: leave the rest alone
            out += html.slice(lt)
            break
        }
        const tag = html.slice(lt, j + 1)
        const lower = name.toLowerCase()
        const selfClosed = html[j - 1] === '/' && !VOID_ELEMENTS.has(lower)
        if (selfClosed) {
            out += tag.slice(0, -2) + '></' + name + '>'
            i = j + 1
            continue
        }
        out += tag
        i = j + 1
        if (RAW_TEXT_ELEMENTS.has(lower) && html[j - 1] !== '/') {
            const close = new RegExp('</' + lower + '[\\s/>]', 'i')
            const m = close.exec(html.slice(i))
            const stop = m ? i + m.index : len
            out += html.slice(i, stop)
            i = stop
        }
    }
    return out
}

export { expandSelfClosingTags }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { expandSelfClosingTags }
    module.exports.default = module.exports
}

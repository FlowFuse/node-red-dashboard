import { defineAsyncComponent } from 'vue'

/**
 * @description: Get a nested property value from an object by path
 * @param {object} obj - The object to retrieve the value from
 * @param {string} path - The path to the property
 * @param {any} defaultValue - The default value to return if the property is not found
 * @return {any} The value of the property
 * @example
 * const obj = { a: { b: { c: 'hello' } } }
 * getDeepValue(obj, 'a.b.c') // returns 'hello'
 * getDeepValue(obj, 'a.b.d') // returns undefined
 * getDeepValue(obj, 'a.b.d', 'default') // returns 'default'
 * getDeepValue(obj, 'a.b.d', null) // returns null
 *
 * @example
 * const obj = { 'a.b.c': 'hello' }
 * getDeepValue(obj, '[\"a.b.c\"]') // returns 'hello'
 */
export function getDeepValue (obj, path, defaultValue) {
    if (typeof obj === 'undefined' || obj === null) return defaultValue

    // scan chars - drop each new var into an array
    let inBracket = false
    let inQuote = false
    const inBracketCharStart = '['
    const inBracketCharEnd = ']'
    const quoteChars = ['"', "'"]
    let newPath = []
    let index = 0
    let current = []
    let prevChar = ''
    let endQuoteChar = ''
    const newVar = () => {
        if (current.length > 0) {
            newPath[index] = [current.join('')]
        }
        index++
        current.length = 0
    }
    for (let i = 0, l = path.length; i < l; i++) {
        const char = path.charAt(i)
        newPath[index] = newPath[index] || []
        current = newPath[index]
        if (inBracket) {
            if (char === inBracketCharEnd) {
                inBracket = false
                newVar()
            } else {
                current.push(char)
            }
        } else if (inQuote) {
            if (char === endQuoteChar && prevChar !== '\\') {
                inQuote = false
                newVar()
            } else {
                current.push(char)
            }
        } else if (quoteChars.includes(char)) {
            endQuoteChar = char
            inQuote = true
            newVar()
        } else if (char === inBracketCharStart) {
            inBracket = true
            newVar()
        } else if (char === '.') {
            newVar()
        } else {
            current.push(char)
        }
        prevChar = char
    }
    // squash the remaining chars into the last var
    if (current.length > 0) {
        newPath[index] = [current.join('')]
    }

    newPath = newPath.flat()

    // scan path for surrounding " or ' and remove them
    for (let i = 0, l = newPath.length; i < l; i++) {
        if (!newPath[i]) continue
        const firstChar = newPath[i].charAt(0)
        const lastChar = newPath[i].charAt(newPath[i].length - 1)
        if ((firstChar === '"' || firstChar === "'") && (lastChar === '"' || lastChar === "'") && firstChar === lastChar) {
            newPath[i] = newPath[i].slice(1, -1)
        }
    }

    for (let i = 0, l = newPath.length; i < l; i++) {
        if (newPath[i] === '') continue
        obj = obj[newPath[i]]
        if (typeof obj === 'undefined') return defaultValue
        if (obj === null) return null
    }
    return obj || defaultValue
}

/**
 * @description: Check if an object has a property
 * @param {Object} obj - The object to check for the property
 * @param {String} prop - The property to check for
 * @returns {Boolean} True if the object has the property, false otherwise
 */
export function hasProperty (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
}

// copied from marked helpers
const escapeTest = /[&<>"']/
const escapeReplace = new RegExp(escapeTest.source, 'g')
const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g')
const escapeReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}
const getEscapeReplacement = (ch) => escapeReplacements[ch]

/**
 * @description: Escape html
 * @param {String} html - The html to escape
 * @param {Boolean} encode - A flag to indicate if the html should be encoded
 * @returns {String} The escaped html
 */
export function escapeHTML (html, encode) {
    if (encode) {
        if (escapeTest.test(html)) {
            return html.replace(escapeReplace, getEscapeReplacement)
        }
    } else {
        if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement)
        }
    }

    return html
}

/**
 * Load a UMD module asynchronously into the page
 * @param {*} url           - <string> The full URL of the .umd.js module to load
 * @param {*} packageName   - <string> The node name/type
 * @param {*} widgetName    - <string> The name of the Vue Component to load
 * @returns
 */
export function importExternalComponent (url, packageName, widgetName = null) {
    return defineAsyncComponent(async () => {
        // Already loaded
        if (window[packageName]?.[widgetName]) {
            return window[packageName][widgetName]
        }

        // Mark component as loading by returning a promise that resolves with the module
        window[packageName] = window[packageName] || {}
        return (async () => {
            // Load the component library - umd assigns this to window[packageName]
            await import(url)

            if (!window[packageName]) {
                throw new Error(`Loaded ${url} but library ${packageName} not found, is that the correct name?`)
            }

            if (!window[packageName][widgetName]) {
                console.warn(`Failed to find ${widgetName} in ${packageName}`, window[packageName])
                throw new Error(`Loaded ${url} and library ${packageName}, but component ${widgetName} didn't appear to be exported, is that the correct name?`)
            }

            // Library will register itself on window[packageName]
            return window[packageName][widgetName]
        })()
    })
}

export default {
    getDeepValue,
    hasProperty,
    escapeHTML
}

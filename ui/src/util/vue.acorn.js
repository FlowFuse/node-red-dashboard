/* eslint-disable no-eval */

/**
 * Wrapper function for Acorn parser that helps circumnavigate a Vue SFC
 * Acorn Docs: https://github.com/acornjs/acorn/tree/master/acorn/
 */

import { parse } from 'acorn'
import escodegen from 'escodegen'

function processProperty (key, block) {
    const type = block.type
    switch (type) {
    case 'Literal':
        return block.value
    case 'FunctionExpression':
        if (!block.id) {
            // can't process anon functions with escodegen
            block.id = {
                type: 'Identifier',
                name: key
            }
        }
        return escodegen.generate(block)
    case 'ArrayExpression':
        return escodegen.generate(block)
    case 'ObjectExpression':
        return escodegen.generate(block)
    default:
        return escodegen.generate(block)
    }
}

/**
 *
 * @param {*} js - stringified Vue SFC
 * @returns Vue Component Object
 */
function parseSFC (js) {
    const options = {
        ecmaVersion: 'latest',
        sourceType: 'module',
        locations: false
    }
    const tree = parse(js, options)
    if (tree.type === 'Program' && tree.body.length === 1 && tree.body[0].type === 'ExportDefaultDeclaration') {
        const declaration = tree.body[0].declaration
        if (declaration.type === 'ObjectExpression') {
            const component = {}
            declaration.properties.forEach((block) => {
                if (block.type === 'Property') {
                    const key = block.key.name
                    if (key === 'name') {
                        // component.name
                        component.name = processProperty(key, block.value)
                    } else if (key === 'props') {
                        // component.props
                        // can't extend props because we have no way of passing in more
                        // - this is all handled by the LayoutMgrs
                        console.warn('"props" not supported in a ui-template Vue Component')
                    } else if (key === 'data') {
                        // component.data
                        eval('component.data = ' + processProperty(key, block.value))
                    } else if (key === 'computed') {
                        // component.computed
                        const c = block.value
                        if (c.type === 'ObjectExpression') {
                            const computed = {}
                            c.properties.forEach((computedVar) => {
                                eval('computed[computedVar.key.name] = ' + processProperty(computedVar.key.name, computedVar.value))
                            })
                            component.computed = computed
                        } else {
                            console.warn('"methods" must be an object expression')
                        }
                    } else if (key === 'methods') {
                        // component.methods
                        const m = block.value
                        if (m.type === 'ObjectExpression') {
                            const methods = {}
                            m.properties.forEach((method) => {
                                eval('methods[method.key.name] = ' + processProperty(method.key.name, method.value))
                            })
                            component.methods = methods
                        } else {
                            console.warn('"methods" must be an object expression')
                        }
                    } else if (key === 'watch') {
                        // component.watch
                        const w = block.value
                        if (w.type === 'ObjectExpression') {
                            const watch = {}
                            w.properties.forEach((watchVar) => {
                                eval('watch[watchVar.key.name] = ' + processProperty(watchVar.key.name, watchVar.value))
                            })
                            component.watch = watch
                        } else {
                            console.warn('"methods" must be an object expression')
                        }
                    } else if (key === 'mounted') {
                        // component.mounted
                        eval('component.mounted = ' + processProperty(key, block.value))
                    } else if (key === 'unmounted') {
                        // component.unmounted
                        eval('component.unmounted = ' + processProperty(key, block.value))
                    } else {
                        console.warn(`"${key}" not supported in a ui-template Vue Component`)
                    }
                }
            })
            return component
        } else {
            throw Error('Vue SFC must default export an object expression')
        }
    } if (tree.type === 'Program' && tree.body.length > 0) {
        // we have raw JavaScript.
        // - this is fine, but we need to wrap it in a Vue Component to render in Dashboard
        // assuming this runs straight away, let's document this in a "beforeCreate" lifecycle hook
        const component = {}
        component.beforeCreate = ''
        tree.body.forEach((block) => {
            component.beforeCreate += processProperty('', block)
        })
        return component
    } else {
        throw Error('Vue SFC must default export an object expression')
    }
}

export default {
    parse: parseSFC
}

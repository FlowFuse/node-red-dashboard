import { shallowReactive } from "vue"

export default function (app) {
    const palette = {
        widgets: shallowReactive({}),    // explicit Vue components used as widgets in the Dashboard
        components: shallowReactive({}), // smaller elemental components that can be used inside the Dashbaord, or as part of a widget
        layouts: shallowReactive({}),    // layout components that are used in Vue to control how widgets are displayed in a given view
        loaded: false,
        errors: [],
    }

    function module_list(mm) {
        return Object.keys(mm)
        .map(m => m.replace(/^.*\/(.*)\.vue$/, "$1"))
        .join(" ")
    }

    /**
     * Given a module object, add it to the 'what' map using its proper name, and register
     * with Vue as a component in the app.
     * 
     * @param { string } what - 'widgets' | 'layouts'
     * @param module 
     */ 
    function load_into(what, module) {
        const names = []
        for (const m in module) {
        const name = module[m].default?.name
        if (name) {
            // add the components to our Vue application
            app.component(name, module[m].default)

            palette[what][name] = module[m].default

            names.push(name)
            //console.log(`Loaded ${name} from ${m}`)
        } else if (module[m].default && typeof module[m].default === "object") {
            throw Error(
            `Loading ${m}: default export has no name field, it has:`, Object.keys(module[m].default).join(" "))
        } else {
            throw Error(`Loading ${m}: default export is missing or not an object, exports:`, Object.keys(module[m]).join(" "))
        }
        }
        return names
    }

    /**
     * Load Dashboard's base widgets and layouts found in the source tree.
     */
    async function load_base() {
        // get all widget files into our /widgets folder
        const widgets = import.meta.globEager("/widgets/*.vue")
        load_into('widgets', widgets)
        console.log("Loaded std Widgets:", Object.keys(palette.widgets).join(" "))

        const grids = import.meta.globEager("/src/layouts/*.vue")
        load_into('layouts', grids)
        console.log("Loaded std Layouts:", Object.keys(palette.grids).join(" "))
    }

    // load components so they can be used by custom widgets
    async function load_components() {
        const components = import.meta.globEager("/src/components/*.vue")
        load_into('components', components)
        console.log("Loaded std Components:", Object.keys(palette.components).join(" "))
    }

    load_base()
        .then(() => {
            // import.meta.env.PROD ? load_extra_prod() : load_extra_dev()
            load_components()
        })
        .then(() => {
            palette.loaded = true
        })
        .catch(err => {
            console.log("Error loading standard palette components:", err)
        })

    return palette
}
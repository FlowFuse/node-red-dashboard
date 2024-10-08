// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

function loadFlows () {
    cy.intercept('GET', '/flows?_=*').as('getFlows')
    cy.visit('/')
    return cy.wait('@getFlows')
        .then((interception) => {
            return interception.response.body.rev
        })
}

function deployFlow (rev, flows) {
    // Call Node-RED API to load the flow
    return cy.request({
        method: 'POST',
        url: 'http://localhost:1881/flows',
        headers: {
            'Content-type': 'application/json',
            'Node-RED-API-Version': 'v2',
            'Node-RED-Deployment-Type': 'full'
        },
        body: {
            rev,
            flows
        }
    })
}

Cypress.Commands.add('loadFlows', loadFlows)

Cypress.Commands.add('deployFlow', deployFlow)

Cypress.Commands.add('deployFixture', (fixture, overrides) => {
    // disables service worker in testing due to ongoing issue with cypress - https://github.com/cypress-io/cypress/issues/27501
    // NOTES on deployFixture():
    // * The `fixture` is expected to be in the cypress/fixtures/flows folder. The name of the fixture should be the name of the file without the extension.
    // * The `overrides` is an array of objects that will override the properties of the specified nodes in the fixture. The `mode` can be 'merge' or 'replace'
    //   * The point of this is to have a base flow that can be used across multiple tests, and then override specific properties for each test
    //     this saves writing lots of similar fixtures for each test
    //   * mode 'merge': will merge the the overrides `data` with the existing properties of the node
    //   * mode 'replace': will replace the entire node with the `data`
    //   * mode 'append': will add nodes to the flow i.e. the `data` should be a well formed node JSON
    //   example overrides:
    //     [
    //       { id: 'node-id-1', type: 'node-type', mode: 'merge', data: { name: 'new name', method: 'GET' } },
    //       { id: 'node-id-2', type: 'node-type', mode: 'replace', data: { id: 'new-id', type: 'new-type', ... } }
    //     ]

    cy.intercept('/dashboard/sw.js', {
        body: undefined
    })
    let helperApi = null
    let rev = null
    // eslint-disable-next-line promise/catch-or-return
    loadFlows()
        .then((_rev) => {
            rev = _rev
            return cy.fixture('flows/context-api')
        })
        .then((flow) => {
            helperApi = flow
            return cy.fixture('flows/' + fixture)
        })
        .then((flow) => {
            const flows = [...flow, ...helperApi]
            if (overrides) {
                overrides.forEach((override) => {
                    const index = flows.findIndex((node) => node.id === override.id)
                    if (index >= 0) {
                        const node = flows[index]
                        switch (override.mode) {
                        case 'merge':
                            Object.assign(node, override.data)
                            break
                        case 'replace':
                            flows[index] = override.data
                            break
                        case 'append':
                            flows.push(override.data)
                            break
                        }
                    }
                })
            }
            console.log(flows)
            return deployFlow(rev, flows)
        })
})

Cypress.Commands.add('resetContext', () => {
    cy.request('POST', '/context/reset')
})

Cypress.Commands.add('checkOutput', (key, value, comparator = 'eq') => {
    const parentKey = key.split('.')[0]
    cy.request('GET', '/context/flow?key=' + parentKey).its(`body.${key}`).should(comparator, value)
})

Cypress.Commands.add('setGlobalVar', (key, value) => {
    const body = { key, value }
    cy.request('POST', '/context/global', body)
})

Cypress.Commands.add('clickAndWait', (element, wait) => {
    wait = wait || 100
    element.click()
    cy.wait(wait)
})

Cypress.Commands.add('reloadDashboard', () => {
    cy.intercept('GET', '/dashboard/_setup').as('setup')
    cy.reload(true)
    cy.wait('@setup')
})

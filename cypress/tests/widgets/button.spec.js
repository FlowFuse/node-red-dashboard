/// <reference types="cypress" />
describe('Node-RED Dashboard 2.0 - Buttons', () => {
    beforeEach(() => {
        //   example overrides:
        //     [
        //       { mode: 'merge', id: 'node-id-1', data: { name: 'new name', method: 'GET' } },
        //       { mode: 'replace', id: 'node-id-2', data: { id: 'new-id', type: 'new-type', ... } }
        //       { mode: 'append', data: [{node1}, {node2}, ...] }
        //     ]
        // const overrides = [
        //     {
        //         mode: 'append',
        //         data: [
        //             // eslint-disable-next-line
        //             {"id":"03831223eea492b2","type":"inject","z":"node-red-tab-buttons","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":true,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":260,"y":460,"wires":[["fb61b81a39cf56f6"]]},
        //             // eslint-disable-next-line
        //             {"id":"fb61b81a39cf56f6","type":"function","z":"node-red-tab-buttons","name":"setup flow and global","func":"flow.set('f1', 'f1-value')\nflow.set('f2', 'f2-value')\nflow.set('f3', 'f3-value')\nglobal.set('g1', 'g1-value')\nglobal.set('g2', 'g2-value')\nglobal.set('g3', 'g3-value')\nreturn msg;","outputs":1,"timeout":0,"noerr":0,"initialize":"","finalize":"","libs":[],"x":510,"y":460,"wires":[[]]}
        //         ]
        //     }
        // ]
        cy.deployFixture('dashboard-buttons')
        cy.visit('/dashboard/page1')
    })

    it('Button 1 (str) outputs the string payload & string topic', () => {
        // Emitting strings
        cy.clickAndWait(cy.get('button').contains('Button 1 (str)'))
        cy.checkOutput('msg.payload', 'button 1 clicked')
        cy.checkOutput('msg.topic', 'button-str-topic') // fixed string topic value
    })

    it('Button 1 (bool) outputs a bool payload & topic from msg.topic', () => {
        // Emitting Bool
        cy.clickAndWait(cy.get('button').contains('Button 1 (bool)'))
        cy.checkOutput('msg.payload', true)
        cy.checkOutput('msg.topic', 'msg.topic from inject-1') // this tests topic comes from the injected msg.topic
    })

    it('Button 1 (json) outputs an object string payload & topic from flow.f1', () => {
        // Emitting JSON
        cy.clickAndWait(cy.get('button').contains('Button 1 (json)'))
        cy.checkOutput('msg.payload.hello', 'world')
        cy.checkOutput('msg.topic', 'f1-value') // this tests topic gets evaluated from flow.f1 variable injected at start of flows.
    })

    it('Button 2 (global) retrieves global.test and topic from global.g1', () => {
        // set global. var via helper API
        cy.setGlobalVar('button_global_payload', 'test-payload')
        cy.setGlobalVar('button_global_topic', 'test-topic')
        cy.checkOutput('button_global_payload', 'test-payload')
        cy.checkOutput('button_global_topic', 'test-topic')

        // Emitting global var
        cy.clickAndWait(cy.get('button').contains('Button 2 (global)'))
        cy.checkOutput('msg.payload', 'test-payload') // updated to reflect the new global variable
        cy.checkOutput('msg.topic', 'test-topic') // updated to reflect the new global topic
    })

    it('will prevent emulation of a click when receiving a message, if configured that way', () => {
        // Emitting global var
        cy.clickAndWait(cy.get('button').contains('Button 3 (trigger)'))
        cy.checkOutput('msg.payload', 'no-emulate', 'not.eq')
    })

    it('will allow emulation of a click when receiving a message, if configured that way', () => {
        // Emitting global var
        cy.clickAndWait(cy.get('button').contains('Button 4 (trigger)'))
        cy.checkOutput('msg.payload', 'emulate')
    })
})

describe('Node-RED Dashboard 2.0 - Buttons (Dynamic Properties)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-buttons')
        cy.visit('/dashboard/page1')
    })

    it('includes "label"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic').contains('Button Config Label')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic-label'))
        cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic').contains('Dynamic Button Label')
    })

    it('includes "icon"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic').find('i.v-icon').should('not.exist')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic-icon'))
        cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic').find('i.v-icon').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic').find('i.v-icon').should('have.class', 'mdi-earth')
    })
})

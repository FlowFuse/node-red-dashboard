/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node-RED Dashboard 2.0 - Notification', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-notifications')
        cy.visit('/dashboard/page1')
        // notifications are not rendered until shown, so there is no element to wait on for the widget to subscribe
        cy.wait(1000)
    })

    it('shows a focused input with the configured type and label', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-notify').find('button'))
        cy.get('.nrdb-ui-notification-input input').should('have.attr', 'type', 'password')
        cy.get('.nrdb-ui-notification-input input').should('have.focus')
        cy.get('.nrdb-ui-notification-input label').should('contain', 'Password')
    })

    it('updates the input type and label via msg.ui_update', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-notify-number').find('button'))
        cy.get('.nrdb-ui-notification-input input').should('have.attr', 'type', 'number')
        cy.get('.nrdb-ui-notification-input label').should('contain', 'Amount')
        cy.get('.nrdb-ui-notification-input input').type('42{enter}')
        cy.checkOutput('msg.payload', 42)
    })

    it('sends the entered value as msg.payload on confirm', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-notify').find('button'))
        cy.get('.nrdb-ui-notification-input input').type('s3cret')
        cy.get('.nrdb-ui-notification').contains('button', 'Confirm').click()
        cy.checkOutput('msg.payload', 's3cret')
    })

    it('sends the entered value as msg.payload on enter', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-notify').find('button'))
        cy.get('.nrdb-ui-notification-input input').type('hunter2{enter}')
        cy.checkOutput('msg.payload', 'hunter2')
    })

    it('sends dismiss_clicked on dismiss', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-notify').find('button'))
        cy.get('.nrdb-ui-notification-input input').type('ignored')
        cy.get('.nrdb-ui-notification').contains('button', 'Close').click()
        cy.checkOutput('msg.payload', 'dismiss_clicked')
    })

    it('clears the input when reopened', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-notify').find('button'))
        cy.get('.nrdb-ui-notification-input input').type('s3cret')
        cy.get('.nrdb-ui-notification').contains('button', 'Close').click()
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-notify').find('button'))
        cy.get('.nrdb-ui-notification-input input').should('have.value', '')
    })
})

describe('Node-RED Dashboard 2.0 - Notification without input', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-notifications', [
            { mode: 'merge', id: 'dashboard-ui-notification', data: { showInput: false } }
        ])
        cy.visit('/dashboard/page1')
        cy.wait(1000)
    })

    it('does not show an input and sends confirm_clicked on confirm', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-notify').find('button'))
        cy.get('.nrdb-ui-notification-input').should('not.exist')
        cy.get('.nrdb-ui-notification').contains('button', 'Confirm').click()
        cy.checkOutput('msg.payload', 'confirm_clicked')
    })
})

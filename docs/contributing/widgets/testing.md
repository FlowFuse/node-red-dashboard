# E2E Testing

E2E Testing consists of runnig a local environment, and automating interaction with the browser to test the widgets behaviour.

With Dashboard 2.0, we have the following commands which are used for testing:

- `npm run cy:server` - Runs an instance of Node-RED with Dashboard 2.0 installed.
- `npm run cy:run` - Runs all of the Cypress tests in headless mode.
- `npm run cy:open` - Opens the Cypress test runner, whereby you can explicitly choose which tests to run locally.


## Cypress Test Helper

In order to make it easier to write tests, we have created a helper function which can be used to test the output from particular widgets.

<iframe width="100%" height="250px" src="https://flows.nodered.org/flow/51259d06082d56dd79725d7675f6c4bc/share" allow="clipboard-read; clipboard-write" style="border: none;"></iframe>]

The "Store Latest Msg" function node here contains:

```js
global.set('msg', msg)
return msg;
```

When a button is clicked in the Dashboard, the value emitted by that button is then stored in a global `msg` variable. We can then use this in conjuction with:

<iframe width="100%" height="250px;" src="https://flows.nodered.org/flow/85116e5ecfdb9da778bbbbfe34c0063b/share" allow="clipboard-read; clipboard-write" style="border: none;"></iframe>

In order to make an API call from Cypress after we've clicked the button and checked the stored value against that which we expect the button to have emitted.

For example, from our button tests:

```js
describe('Node-RED Dashboard 2.0 - Buttons', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-buttons') // reads in a flow.json and deploys it to the local Node-RED instance
        cy.visit('/dashboard/page1')
    })

    it('can be clicked and outputs the correct payload & topic are emitted', () => {
        // Emitting strings
        cy.get('button').contains('Button 1 (str)').click()
        // checkOutput calls our helper endpoints to checks the values against the stored msg
        cy.checkOutput('msg.payload', 'button 1 clicked')
        cy.checkOutput('msg.topic', 'button-str-topic')

        // Emitting JSON
        cy.get('button').contains('Button 1 (json)').click()
        cy.checkOutput('msg.payload.hello', 'world')
        cy.checkOutput('msg.topic', 'button-json-topic')
    })
})
```
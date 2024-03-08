# E2E Testing

E2E Testing consists of runnig a local environment, and automating interaction with the browser to test the widgets behaviour.

With Dashboard 2.0, we have the following commands which are used for testing:

- `npm run cy:server` - Runs an instance of Node-RED with Dashboard 2.0 installed.
- `npm run cy:run` - Runs all of the Cypress tests in headless mode.
- `npm run cy:open` - Opens the Cypress test runner, whereby you can explicitly choose which tests to run locally.

## Cypress

For our E2E testing we use [Cypress](https://www.cypress.io/). This provides a framework by which we can define automated tests that will click on and interact with relevant elements in our Dashboard, and check against expected behaviours.

## Writing Tests

With Node-RED and Dashboard 2.0, we want to be able to provide a complete `flow.json`, and then test the behaviour of the Dashboard that is deployed as a result of that flow. As such, each set of tests contains two key parts:

1. `<widget>.json` - the `flows.json` that details the test flows to deploy, stored in `/cypress/fixtures/flows`
2. `<widget>.spec.js` - the test suite that defines what elements to interact with and the states to test, stored in `/cypress/tests/`

### Example `spec.js` file

```js
describe('Node-RED Dashboard 2.0 - Button Groups', () => {
    // anything here will run before all of the indivudal tests below
    beforeEach(() => {
        // here we can use our helper command to load a flow.json
        cy.deployFixture('dashboard-button-groups')
        // then make sure we're starting on the correct page for each test
        cy.visit('/dashboard/page1')
    })

    // it('') specifies a new test
    it('can be clicked and emit a string value representing the option', () => {
        // clickAndWait is a helper command that clicks on an element and waits for a set time
        cy.clickAndWait(cy.get('button').contains('Option 3'))
        
        // checkOutput then utilises the Helper APIs we have in place tho check what output came from the button
        cy.checkOutput('msg.topic', 'first-row')
        cy.checkOutput('msg.payload', 'option_3')
    })

    it('allows for definition of custom colouring for options', () => {
        // Click the last button in the button group
        cy.clickAndWait(cy.get('#nrdb-ui-widget-ui-button-group-colors button').last())

        // check the CSS is applied correctly
        cy.get('#nrdb-ui-widget-ui-button-group-colors button').last()
            .should('have.css', 'background-color', 'rgb(217, 255, 209)')
    })
})
```

## Cypress Test Helpers

### Click & Wait

`cy.clickAndWait(<element>)`

Cypress will automatically wait for elements to appear in the DOM before interacting with them, and wait for HTTP requests when instructed, however, it cannot perform the same for Websocket traffic.

Given that most tests will involve checking for the conasequences of SocketIO traffic, we've created a Cypress "command", `clickAndWait()` which ensures a set time period after clicking before moving onto the next phase of a test.

### Store Output (Function Node)

In order to make it easier to write tests, we have created a helper function which can be used to test the output from particular widgets. This function node can be included in your Node-RED flow, and it will store the `msg` object in a `global`

<iframe width="100%" height="250px" src="https://flows.nodered.org/flow/51259d06082d56dd79725d7675f6c4bc/share" allow="clipboard-read; clipboard-write" style="border: none;"></iframe>

The "Store Latest Msg" function node here contains:

```js
global.set('msg', msg)
return msg;
```

When a button is clicked in the Dashboard, the value emitted by that button is then stored in a global `msg` variable. We can then use this in conjuction with checking that output.

### Check Output

`cy.checkOutput(<key>, <value>)`

If using the above [Store Output](#store-output-function-node) function node, we can then use the `checkOutput` command to check the value of the `msg` object against what we expect it to be.

This helper flow is automatically deployed to the Node-RED instance when using the `deployFixture(<fixture>)` command.

<iframe width="100%" height="250px;" src="https://flows.nodered.org/flow/85116e5ecfdb9da778bbbbfe34c0063b/share" allow="clipboard-read; clipboard-write" style="border: none;"></iframe>

For example, from our button tests:

```js
describe('Node-RED Dashboard 2.0 - Buttons', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-buttons') // reads in a flow.json and deploys it to the local Node-RED instance
        cy.visit('/dashboard/page1')
    })

    it('can be clicked and outputs the correct payload & topic are emitted', () => {
        // Emitting strings
        cy.clickAndWait(cy.get('button').contains('Button 1 (str)'))
        // checkOutput calls our helper endpoints to checks the values against the stored msg
        cy.checkOutput('msg.payload', 'button 1 clicked')
        cy.checkOutput('msg.topic', 'button-str-topic')

        // Emitting JSON
        cy.clickAndWait(cy.get('button').contains('Button 1 (json)'))
        cy.checkOutput('msg.payload.hello', 'world')
        cy.checkOutput('msg.topic', 'button-json-topic')
    })
})
```

### Rest Context

`cy.resetContext()`

The above functions to assist with setting and checking output rely on Node-RED's "context" stores. If at any point you want to be sure they're reset and cleared, this function will clear the context stores, before proceeding to any further steps in your tests.

### Reload Dashboard

`cy.reloadDashboard()`

If at any point you want to reload the page, then utilising this command will refresh the page, but also ensure that the `/_setup` API call has finished, before proceeding with any more steps in your test.
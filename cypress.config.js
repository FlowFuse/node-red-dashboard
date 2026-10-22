const { defineConfig } = require('cypress')

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:1881',
        specPattern: 'cypress/tests/**/*.spec.{js,jsx,ts,tsx}',
        retries: { runMode: 2, openMode: 0 },
        setupNodeEvents (on, config) {
            // implement node event listeners here
        }
    }
})

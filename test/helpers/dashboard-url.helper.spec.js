const should = require('should') // eslint-disable-line no-unused-vars

describe('dashboard API URL helper', function () {
    let getDashboardApiUrl

    before(async function () {
        const module = await import('../../ui/src/api/dashboard-url.mjs')
        getDashboardApiUrl = module.getDashboardApiUrl
    })

    it('builds the default dashboard API URL', function () {
        const url = getDashboardApiUrl(
            'http://localhost:1880/dashboard/page?edit-key=key',
            '',
            '/dashboard',
            'dashboard-id',
            'flows'
        )

        url.href.should.equal('http://localhost:1880/dashboard/api/v1/dashboard-id/flows')
    })

    it('does not duplicate a shared admin and node root', function () {
        const url = getDashboardApiUrl(
            'http://localhost:1880/node-red/dashboard/page?edit-key=key',
            '/node-red/',
            '/dashboard/',
            'dashboard-id',
            'flows'
        )

        url.href.should.equal('http://localhost:1880/node-red/dashboard/api/v1/dashboard-id/flows')
    })

    it('uses the admin root when the node root is different', function () {
        const url = getDashboardApiUrl(
            'http://localhost:1880/node-red/dashboard/page?edit-key=key',
            '/admin',
            '/dashboard',
            'dashboard-id',
            'flows'
        )

        url.href.should.equal('http://localhost:1880/admin/dashboard/api/v1/dashboard-id/flows')
    })
})

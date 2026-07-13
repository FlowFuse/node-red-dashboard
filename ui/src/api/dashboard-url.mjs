function trimPathPart (part) {
    return String(part || '').replace(/^\/+|\/+$/g, '')
}

function getDashboardApiUrl (locationHref, editorPath, dashboardPath, dashboardId, ...path) {
    const result = new URL(locationHref)
    const pathParts = [
        editorPath,
        dashboardPath,
        'api',
        'v1',
        dashboardId,
        ...path
    ].map(trimPathPart).filter(Boolean)

    result.pathname = pathParts.join('/')
    result.search = ''
    result.hash = ''
    return result
}

export { getDashboardApiUrl }

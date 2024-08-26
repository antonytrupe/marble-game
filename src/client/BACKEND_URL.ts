export let BACKEND_URL: string
if (window.location.href.indexOf("localhost") !== -1) {
    BACKEND_URL = "ws://localhost:2567"
}
else {
    BACKEND_URL = `${window.location.protocol.replace("http", "ws")}//${window.location.hostname.replace('client', 'server')}${(window.location.port && `:${window.location.port}`)}`
}
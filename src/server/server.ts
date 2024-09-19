import { LobbyRoom, matchMaker, Server } from "colyseus"
import config, { listen } from "@colyseus/tools"
import { auth, JWT } from "@colyseus/auth"
import { monitor } from "@colyseus/monitor"
import { MarbleGameRoom } from "@/server/rooms/MarbleGameRoom"
import "@/console.js"

let gameServerRef: Server

auth.oauth.addProvider('google', {
    key: process.env.GOOGLE_KEY || 'TODO', // Client ID
    secret: process.env.GOOGLE_SECRET || 'TODO', // Client Secret
    scope: ['email', 'openid'],//'identify',
})

auth.oauth.onCallback(async (data, provider) => {
    // console.log('onCallback', data.profile)
    // console.log('data.upgradingToken',data.upgradingToken)
    //TODO persistance
    return data.profile.email
})

auth.settings.onGenerateToken = function (userdata) {
    // console.log('onGenerateToken', userdata)
    // JWT.settings.secret = process.env.JWT_SECRET!
    const jwt = JWT.sign(userdata)
    // console.log(jwt.then((jwt) => {
    //     console.log(jwt)
    // }))
    return jwt
    // return 'a'
}

auth.settings.onParseToken = function (jwt) {
    // console.log('onParseToken', jwt)
    return jwt;
}

// const one=Math.floor(Math.random()*100) 
// const two=Math.floor(Math.random()*100) 
const one = 1
const two = 2

const appConfig = config({
    options: {
        //  devMode: true, 
    },

    initializeGameServer: (gameServer) => {
        // console.log('initializeGameServer')
        /**
         * Define your room handlers:
         */
        gameServer.define('marbleGame' + one, MarbleGameRoom)//.enableRealtimeListing()
        gameServer.define('marbleGame' + two, MarbleGameRoom)//.enableRealtimeListing()
        gameServer
            .define("lobby", LobbyRoom)
        //
        // keep gameServer reference, so we can
        // call `.simulateLatency()` later through an http route
        //
        gameServerRef = gameServer
    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!")
        })

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor())

        app.use(auth.prefix, auth.routes())
    },

    beforeListen: async () => {
        /**
         * Before before gameServer.listen() is called.
         */
        await matchMaker.createRoom("marbleGame" + one, { /* options */ })
        await matchMaker.createRoom("marbleGame" + two, { /* options */ })
        // const rooms=await matchMaker.query()
        // console.log(rooms)
    }
})

// Create and listen on 2567 (or PORT environment variable.)
listen(appConfig).then((server) => {

})
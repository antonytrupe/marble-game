import { LobbyRoom, matchMaker, Server } from "colyseus"
import config, { listen } from "@colyseus/tools"
import { MarbleGameRoom } from "./rooms/MarbleGameRoom"
import { auth } from "@colyseus/auth"
import { monitor } from "@colyseus/monitor"

let gameServerRef: Server
let latencySimulationMs: number = 0


auth.oauth.addProvider('google', {
    key: process.env.GOOGLE_KEY || 'TODO', // Client ID
    secret: process.env.GOOGLE_SECRET || 'TODO', // Client Secret
    scope: ['email'],//'identify', 
});

auth.oauth.onCallback(async (data, provider) => {
    const profile = data.profile;
    console.log('profile', profile)
    console.log(provider)
    // return await User.upsert({
    //     discord_id: profile.id,
    //     name: profile.global_name || profile.username,
    //     locale: profile.locale,
    //     email: profile.email,
    // });
});

// const one=Math.floor(Math.random()*100) 
// const two=Math.floor(Math.random()*100) 
const one = 1
const two = 2

const appConfig = config({
    options: {
        //   devMode: true,
    },

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('marbleGame' + one, MarbleGameRoom)//.enableRealtimeListing()
        gameServer.define('marbleGame' + two, MarbleGameRoom)//.enableRealtimeListing()
        // matchMaker.createRoom("marbleGame2", { /* options */ });
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

        // these latency methods are for development purpose only.
        // app.get("/latency", (req, res) => res.json(latencySimulationMs))
        // app.get("/simulate-latency/:milliseconds", (req, res) => {
        //     latencySimulationMs = parseInt(req.params.milliseconds || "100")

        //     // enable latency simulation
        //     gameServerRef.simulateLatency(latencySimulationMs)

        //     res.json({ success: true })
        // })

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor())

        app.use(auth.prefix, auth.routes());
    },


    beforeListen: async () => {
        /**
         * Before before gameServer.listen() is called.
         */
        await matchMaker.createRoom("marbleGame" + one, { /* options */ });
        await matchMaker.createRoom("marbleGame" + two, { /* options */ });
        // const rooms=await matchMaker.query()
        // console.log(rooms)
    }
})

// Create and listen on 2567 (or PORT environment variable.)
listen(appConfig).then((server) => {

})
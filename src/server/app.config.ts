import config from "@colyseus/tools"
import { monitor } from "@colyseus/monitor"
import { LobbyRoom, Server } from "colyseus"

/**
 * Import your Room files
 */
// import { Part1Room } from "./rooms/Part1Room"
// import { Part2Room } from "./rooms/Part2Room"
// import { Part3Room } from "./rooms/Part3Room"
// import { Part4Room } from "./rooms/Part4Room"
import { MarbleGameRoom } from "./rooms/MarbleGameRoom"

let gameServerRef: Server
let latencySimulationMs: number = 0

export default config({
    options: {
        devMode: true,
    },

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('marbleGame1', MarbleGameRoom )
        gameServer.define('marbleGame2', MarbleGameRoom)
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
        app.get("/latency", (req, res) => res.json(latencySimulationMs))
        app.get("/simulate-latency/:milliseconds", (req, res) => {
            latencySimulationMs = parseInt(req.params.milliseconds || "100")

            // enable latency simulation
            gameServerRef.simulateLatency(latencySimulationMs)

            res.json({ success: true })
        })

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor())
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
})

import path from "path"
import { fileURLToPath } from "url"
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const staticDir = path.join(__dirname, "public", "dist")

const app = express()
app.use(express.static(staticDir))

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
})

const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()

app.get("/health", (req, res) => {
    res.status(200).json({
        message: "ok",
        success: true
    })
})

// Catch-all for client-side routing (SPA fallback)
// Using app.use() instead of a wildcard path pattern avoids
// path-to-regexp version incompatibilities between Express 4/5.
app.use((req, res) => {
    res.sendFile(path.join(staticDir, "index.html"), (err) => {
        if (err) {
            console.error("Failed to send index.html:", err.message)
            res.status(500).send("Internal Server Error")
        }
    })
})

const PORT = Number(process.env.PORT) || 3000

httpServer.listen(PORT)
httpServer.on("listening", () => {
    console.log(`Server is running on port ${PORT}`)
})
httpServer.on("error", (error) => {
    console.error("Server failed to start:", error.message)
    process.exit(1)
})

// Global safety nets
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason)
})
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error)
    process.exit(1)
})

// Graceful shutdown
function shutdown(signal) {
    console.log(`${signal} received, shutting down gracefully...`)
    httpServer.close(() => {
        console.log("HTTP server closed")
        process.exit(0)
    })
}
process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
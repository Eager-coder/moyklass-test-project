import express from "express"
import config from "./config"
import { RootRouter } from "./routes"
import { LessonsRouter } from "./routes/lessons"

export const app = express()
app.use(express.json())

app.use("/", RootRouter)
app.use("/lessons", LessonsRouter)

app.listen(config.PORT, () => console.log(`Server has started on port ${config.PORT}.`))

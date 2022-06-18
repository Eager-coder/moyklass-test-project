import dotenv from "dotenv"
import findConfig from "find-config"

dotenv.config({ path: findConfig(".env")! })

const config = {
	PG_URI: process.env.PG_URI!,
	PORT: process.env.PORT,
}

export default config

import config from "./config"

import knex from "knex"

const db = knex({ client: "postgres", connection: { connectionString: config.PG_URI, pool: { min: 3, max: 5 } } })

export default db

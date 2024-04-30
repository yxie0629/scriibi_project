import mysql from "mysql2/promise";
import "dotenv/config";
const env = process.env;

// Database connection configuration
const dbConfig = {
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
};

export async function createDbConnection() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (e) {
    throw Error("createDbConnection error", { cause: e });
  }
  return connection;
}

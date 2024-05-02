import mysql from "mysql2";
import "dotenv/config";
const env = process.env;

// Database connection configuration
const dbConfig = {
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
};

export function createDbConnection() {
  let connection;
  try {
    connection = mysql.createConnection(dbConfig);

  } catch (e) {
    throw Error("createDbConnection error", { cause: e });
  }
  console.log('MySQL database connection created!');
  return connection;

}

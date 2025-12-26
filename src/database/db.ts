import sqlite3 from "sqlite3";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const dbPath = path.join(__dirname, "../../data/piloto-baba.db");

// Garantir que o diretório existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Promisificar métodos do banco
export function dbRun(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params || [], function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet(sql: string, params?: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params || [], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function dbAll(sql: string, params?: any[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params || [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Inicializar banco de dados
export async function initDatabase() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  return new Promise<void>(async (resolve, reject) => {
    db.exec(schema, async (err) => {
      if (err) {
        reject(err);
      } else {
        console.log("Banco de dados inicializado com sucesso");
        // Executar migração se necessário
        try {
          const { migrateDatabase } = require("./migrate");
          await migrateDatabase();
        } catch (migrationError: any) {
          console.warn("Aviso na migração:", migrationError?.message || migrationError);
          // Não falhar se a migração der erro (pode ser que não seja necessária)
        }
        resolve();
      }
    });
  });
}

export default db;

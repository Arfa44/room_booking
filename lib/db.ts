// lib/db.ts
import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_pinjam_ruangan',
});

export default db;

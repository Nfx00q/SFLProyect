import mysql from 'mysql2/promise';
import chalk from 'chalk';

// Configura tu conexión pool para eficiencia
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sfl_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(chalk.green.bold('✓ MySQL conectado con éxito!'));
    connection.release();
  } catch (error) {
    console.log(chalk.red.bold('✗ Error conectando a MySQL:'));
    console.error(error);
    process.exit(1);
  }
}

testConnection();

export { pool };

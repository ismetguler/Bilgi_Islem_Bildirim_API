const { Pool } = require('pg');
require('dotenv').config(); // Gizli dosyamızı okuması için

// Veritabanı havuzunu (Pool) oluşturuyoruz
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Bağlantıyı test ediyoruz
pool.connect((err, client, release) => {
    if (err) {
        console.error('Veritabanına bağlanırken hata oluştu:', err.stack);
    } else {
        console.log('PostgreSQL veritabanına başarıyla bağlanıldı!');
    }
    if (client) release(); // Bağlantıyı havuza geri bırakıyoruz
});

module.exports = pool;
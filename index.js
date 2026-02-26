// Express kütüphanesini projemize dahil ediyoruz
const express = require('express'); 
const app = express();
const pool = require('./db'); // Veritabanı bağlantımızı içeri aldık
// Sunucunun çalışacağı port numarasını belirliyoruz
const PORT = 3000;

// Ana sayfaya (/) bir istek geldiğinde verilecek cevap
app.get('/', (req, res) => {
    res.send('Bilgi Islem Bildirim API basariyla calisiyor!');
});

// Sunucuyu ayaklandırıp dinlemeye başlıyoruz
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde ayaklandi!`);
});
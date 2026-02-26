// Express kütüphanesini projemize dahil ediyoruz
const express = require('express'); 
const app = express();
const bcrypt = require('bcrypt'); // Şifreleme kütüphanesini dahil ettik

// Flutter'dan gelecek JSON verilerini okuyabilmek için middleware (ara katman) ekliyoruz
app.use(express.json());
const pool = require('./db'); // Veritabanı bağlantımızı içeri aldık
// Sunucunun çalışacağı port numarasını belirliyoruz
const PORT = 3000;

// Ana sayfaya (/) bir istek geldiğinde verilecek cevap
app.get('/', (req, res) => {
    res.send('Bilgi Islem Bildirim API basariyla calisiyor!');
});
// KULLANICI KAYIT API'si
app.post('/api/kayit', async (req, res) => {
    try {
        // Flutter'dan (veya test aracından) gelecek verileri karşılıyoruz
        const { ad_soyad, email, sifre, rol } = req.body;

        // ŞİFREYİ KRİPTOLAMA (Şov kısmı burası!)
        const saltRounds = 10;
        const kriptoluSifre = await bcrypt.hash(sifre, saltRounds);

        // Veritabanına kaydetme komutu (fcm_token kısmını öğrenci giriş yaptığında güncelleyeceğiz)
        const yeniKullanici = await pool.query(
            "INSERT INTO kullanicilar (ad_soyad, email, sifre, rol) VALUES ($1, $2, $3, $4) RETURNING id, ad_soyad, email, rol",
            [ad_soyad, email, kriptoluSifre, rol]
        );

        res.json({ 
            mesaj: "Kullanıcı başarıyla oluşturuldu!", 
            kullanici: yeniKullanici.rows[0] 
        });
    } catch (err) {
        console.error("Kayıt hatası:", err.message);
        res.status(500).json({ hata: "Sunucu tarafında bir sorun oluştu." });
    }
});
// Sunucuyu ayaklandırıp dinlemeye başlıyoruz
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde ayaklandi!`);
});
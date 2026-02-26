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
// KULLANICI GİRİŞ VE FCM TOKEN KAYIT API'si
app.post('/api/giris', async (req, res) => {
    try {
        const { email, sifre, fcm_token } = req.body;

        // 1. Kullanıcıyı e-posta adresinden veritabanında buluyoruz
        const kullanici = await pool.query("SELECT * FROM kullanicilar WHERE email = $1", [email]);

        if (kullanici.rows.length === 0) {
            return res.status(401).json({ hata: "Böyle bir kullanıcı bulunamadı." });
        }

        // 2. Şifreyi kontrol et (Kriptolu şifre ile kullanıcının girdiği şifreyi karşılaştırıyoruz)
        const sifreDogrumu = await bcrypt.compare(sifre, kullanici.rows[0].sifre);

        if (!sifreDogrumu) {
            return res.status(401).json({ hata: "Şifre hatalı, lütfen tekrar deneyin." });
        }

        // 3. Şov Kısmı: Giriş başarılıysa Flutter'dan gelen FCM Token'ı veritabanına kaydet/güncelle 
        if (fcm_token) {
            await pool.query(
                "UPDATE kullanicilar SET fcm_token = $1 WHERE id = $2",
                [fcm_token, kullanici.rows[0].id]
            );
        }

        // 4. Başarılı yanıtı gönder
        res.json({
            mesaj: "Giriş başarılı! Token güncellendi.",
            kullanici: {
                id: kullanici.rows[0].id,
                ad_soyad: kullanici.rows[0].ad_soyad,
                rol: kullanici.rows[0].rol
            }
        });

    } catch (err) {
        console.error("Giriş hatası:", err.message);
        res.status(500).json({ hata: "Sunucu tarafında bir sorun oluştu." });
    }
});
// DUYURU GÖNDERME VE TOKEN TOPLAMA API'si
app.post('/api/duyuru-gonder', async (req, res) => {
    try {
        const { baslik, icerik, gonderen_id, hedef_rol } = req.body;

        // 1. Duyuruyu önce veritabanına kalıcı olarak kaydediyoruz
        const yeniDuyuru = await pool.query(
            "INSERT INTO duyurular (baslik, icerik, gonderen_id, hedef_rol) VALUES ($1, $2, $3, $4) RETURNING *",
            [baslik, icerik, gonderen_id, hedef_rol]
        );

        // 2. Hedef kitledeki (örneğin tüm 'ogrenci'ler) kullanıcıların FCM Token'larını topluyoruz
        const tokenSorgusu = await pool.query(
            "SELECT fcm_token FROM kullanicilar WHERE rol = $1 AND fcm_token IS NOT NULL",
            [hedef_rol]
        );

        // Tokenları temiz bir dizi (array) haline getiriyoruz
        const tokenlar = tokenSorgusu.rows.map(row => row.fcm_token);

        // 3. BURASI FİREBASE'E BİLDİRİM GÖNDERME AŞAMASI (Bir sonraki adımda Firebase'i bağlayacağız)
        console.log(`Firebase'e iletilecek cihaz tokenları:`, tokenlar);

        res.json({
            mesaj: "Duyuru başarıyla kaydedildi ve bildirim kuyruğuna eklendi!",
            iletilecek_cihaz_sayisi: tokenlar.length,
            duyuru: yeniDuyuru.rows[0]
        });

    } catch (err) {
        console.error("Duyuru hatası:", err.message);
        res.status(500).json({ hata: "Sunucu tarafında bir sorun oluştu." });
    }
});
// Sunucuyu ayaklandırıp dinlemeye başlıyoruz
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde ayaklandi!`);
});
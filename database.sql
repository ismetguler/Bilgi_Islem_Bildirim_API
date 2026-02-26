-- KULLANICILAR TABLOSU (Öğrenci, Öğretmen, İdari Kadro)
CREATE TABLE kullanicilar (
    id SERIAL PRIMARY KEY,
    ad_soyad VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    sifre VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL, -- 'ogrenci', 'ogretmen', 'admin'
    fcm_token VARCHAR(255), -- Cihaza anında bildirim atmak için gereken eşsiz kimlik
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DUYURULAR TABLOSU
CREATE TABLE duyurular (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(150) NOT NULL,
    icerik TEXT NOT NULL,
    gonderen_id INTEGER REFERENCES kullanicilar(id), -- Hangi hocanın/adminin gönderdiğini tutar
    hedef_rol VARCHAR(20) NOT NULL, -- Duyuru kime gidecek? ('ogrenci', 'herkes' vb.)
    gonderim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
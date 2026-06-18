// =================================================================
// 1. FIREBASE BAĞLANTI AYARLARI
// =================================================================
const firebaseConfig = {
    apiKey: "BURAYA_APİ_KEY_GELECEK",
    authDomain: "BURAYA_AUTH_DOMAİN_GELECEK",
    databaseURL: "BURAYA_DATABASE_URL_GELECEK",
    projectId: "BURAYA_PROJECT_ID_GELECEK",
    storageBucket: "BURAYA_STORAGE_BUCKET_GELECEK",
    messagingSenderId: "BURAYA_SENDER_ID_GELECEK",
    appId: "BURAYA_APP_ID_GELECEK"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// =================================================================
// 2. GÜVENLİ ID YÖNETİMİ (Kişisel Veri İçermeyen Rastgele Token)
// =================================================================
const urlParams = new URLSearchParams(window.location.search);
let secureID = urlParams.get('id');

if (!secureID) {
    secureID = 'qr_' + Math.random().toString(36).substring(2, 8);
    window.history.replaceState({}, document.title, window.location.pathname + "?id=" + secureID);
}

// =================================================================
// 3. CANLI BULUT SUNUCUSU DİNLEYİCİSİ
// =================================================================
window.onload = function() {
    db.ref('guvenli_araclar/' + secureID).on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            db.ref('guvenli_araclar/' + secureID).set({
                aktif_mod: "🚗 Hatalı Park Modu"
            });
            return;
        }

        // Başlık mesajlarını güncelle
        document.getElementById('main-message').innerHTML = `Güvenli Kod: <b>${secureID}</b><br>Sistem Aktif (Gizlilik %100 Korunuyor).<br><b>Güncel Durum:</b> ${data.aktif_mod}`;
        document.getElementById('aktif-mod-rozeti').innerText = `Durum: ${data.aktif_mod}`;
        
        // Vatandaşa gösterilecek özel açıklamalar
        let mesaj = "ℹ️ Sürücüye ulaşmak için lütfen aşağıdaki durum butonlarından birine dokunun.";
        if (data.aktif_mod.includes("Park")) mesaj = "🚗 Kısa süreliğine hatalı park etmek zorunda kaldım. Lütfen durumunuzu belirten hazır butonlara tıklayarak bana bildirin, hemen geleceğim.";
        if (data.aktif_mod.includes("Acil")) mesaj = "⚠️ Acil bir durum nedeniyle buradayım. Bana anında bildirim yollamak için lütfen aşağıdaki hazır mesaj butonlarını kullanın.";
        if (data.aktif_mod.includes("Toplantı")) mesaj = "💼 Önemli bir toplantıdayım. Aşağıdaki acil durum mesaj butonlarından birine basarsanız ekranıma anında düşecektir.";
        document.getElementById('vatandas-mesaji').innerText = mesaj;
    });

    // Sürücü için gelen mesajları canlı dinlemeyi başlat
    canliMesaj HavuzunuGuncelle();
};

// =================================================================
// 4. İŞLEVSEL FONKSİYONLAR VE BUTON TETİKLEYİCİLERİ
// =================================================================

// Sürücü Mod Değiştirme Sistemi
const modButonlari = document.getElementsByClassName('mod-btn');
for (let buton of modButonlari) {
    buton.addEventListener('click', function() {
        db.ref('guvenli_araclar/' + secureID).update({ aktif_mod: this.innerText });
    });
}

// Vatandaşın Hazır Hızlı Mesajlara Tıklama Olayı (YENİ)
const hizliMesajButonlari = document.getElementsByClassName('hizli-mesaj-btn');
for (let buton of hizliMesajButonlari) {
    buton.addEventListener('click', function() {
        const gonderilecekMetin = this.innerText;
        const suankiSaat = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        // Sunucudaki mesaj havuzuna ekleme yapıyoruz
        db.ref('guvenli_araclar/' + secureID + '/mesajlar').push({
            metin: gonderilecekMetin,
            tarih: suankiSaat,
            okundu: false
        }).then(() => {
            alert('🎉 Seçtiğiniz durum sürücüye tamamen gizli ve anonim olarak başarıyla iletildi!');
        });
    });
}

// Sürücü Panelindeki Gelen Mesajlar Listesini Canlı Güncelleyen Fonksiyon (YENİ)
function canliMesajHavuzunuGuncelle() {
    const mesajKutusu = document.getElementById('sürücü-mesaj-havuzu');
    
    db.ref('guvenli_araclar/' + secureID + '/mesajlar').on('value', (snapshot) => {
        const mesajlar = snapshot.val();
        
        if (!mesajlar) {
            mesajKutusu.innerHTML = `<div style="color: #94a3b8; font-style: italic; text-align: center;">Henüz mesaj yok...</div>`;
            return;
        }

        mesajKutusu.innerHTML = ""; // Kutuyu temizle
        
        // Mesajları listele (En yeni mesaj en üstte görünecek şekilde ters çeviriyoruz)
        Object.keys(mesajlar).reverse().forEach(key => {
            const m = mesajlar[key];
            const div = document.createElement('div');
            div.className = "mesaj-item";
            div.innerHTML = `<span class="mesaj-vakit">${m.tarih}</span> 💬 ${m.metin}`;
            mesajKutusu.appendChild(div);
        });
    });
}

// İnternet Araması
document.getElementById('btn-guvenli-ara').addEventListener('click', () => {
    alert('🌐 Numara olmadan, WebRTC tabanlı dijital sesli arama altyapısı simüle ediliyor...');
});

// Arama Filtreleme (Sürücü Paneli)
document.getElementById('mod-search').addEventListener('keyup', function() {
    const aramaTerimi = this.value.trim().toLowerCase();
    const butonlar = document.getElementsByClassName('mod-btn');
    let bulunanModSayisi = 0;
    for (let i = 0; i < butonlar.length; i++) {
        if (butonlar[i].innerText.toLowerCase().includes(aramaTerimi)) {
            butonlar[i].classList.remove('hidden');
            bulunanModSayisi++;
        } else {
            butonlar[i].classList.add('hidden');
        }
    }
    document.getElementById('hata-mesaji').classList.toggle('hidden', bulunanModSayisi > 0);
});

// Ekran Değiştirme Tetikleyicileri
document.getElementById('btn-vatandas-ekranini-ac').addEventListener('click', () => {
    document.getElementById('panel-ekrani').classList.add('hidden');
    document.getElementById('vatandas-ekrani').classList.remove('hidden');
    document.getElementById('main-title').innerText = "📱 Korumalı İletişim Sistemi";
});

document.getElementById('btn-panele-geri-don').addEventListener('click', () => {
    document.getElementById('vatandas-ekrani').classList.add('hidden');
    document.getElementById('panel-ekrani').classList.remove('hidden');
    document.getElementById('main-title').innerText = "QR Numaratör";
});

// Sürücü Panelindeki Mesajları Veritabanından Tamamen Silme
document.getElementById('btn-mesajlari-temizle').addEventListener('click', () => {
    if(confirm("Tüm gelen mesaj geçmişini silmek istediğinize emin misiniz?")) {
        db.ref('guvenli_araclar/' + secureID + '/mesajlar').remove().then(() => {
            alert("🗑️ Mesaj geçmişi başarıyla temizlendi!");
        });
    }
});


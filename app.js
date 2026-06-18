// =================================================================
// 1. FIREBASE BAĞLANTI AYARLARI (Canlı Sunucu Bağlantısı)
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCJpkgYGXdNqATunee0ro5NuduE5XohwIU",
  authDomain: "://firebaseapp.com",
  databaseURL: "https://firebaseio.com",
  projectId: "qr-numarator-23ba9",
  storageBucket: "qr-numarator-23ba9.firebasestorage.app",
  messagingSenderId: "23341888407",
  appId: "1:23341888407:web:0359c86e3662a15b808ad2"
};

// Global Firebase ve DB Başlatma Kontrolü
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// =================================================================
// 2. GÜVENLİ ID YÖNETİMİ (Zorunlu Adres Çubuğu Güncelleyici)
// =================================================================
const urlParams = new URLSearchParams(window.location.search);
let secureID = urlParams.get('id');

if (!secureID) {
    secureID = 'qr_' + Math.random().toString(36).substring(2, 8);
    window.location.href = window.location.pathname + "?id=" + secureID;
}

// =================================================================
// 3. CANLI BULUT SUNUCUSU DİNLEYİCİSİ
// =================================================================
window.onload = function() {
    canliMesajHavuzunuGuncelle();
    butonOlaylariniBagla();
    qrKodUret();

    db.ref('guvenli_araclar/' + secureID).on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            db.ref('guvenli_araclar/' + secureID).set({
                aktif_mod: "🚗 Hatalı Park Modu"
            });
            return;
        }

        const mainMessageNode = document.getElementById('main-message');
        if (mainMessageNode) {
            mainMessageNode.className = ""; 
            mainMessageNode.innerHTML = `Güvenli Kod: <b>${secureID}</b><br>Sistem Aktif (Gizlilik %100 Korunuyor).<br><b>Güncel Durum:</b> ${data.aktif_mod}`;
        }
        
        const aktifModRozetiNode = document.getElementById('aktif-mod-rozeti');
        if (aktifModRozetiNode) {
            aktifModRozetiNode.innerText = `Durum: ${data.aktif_mod}`;
        }
        
        let mesaj = "ℹ️ Sürücüye ulaşmak için lütfen aşağıdaki durum butonlarından birine dokunun.";
        if (data.aktif_mod && data.aktif_mod.includes("Park")) mesaj = "🚗 Kısa süreliğine hatalı park etmek zorunda kaldım. Lütfen durumunuzu belirten hazır butonlara tıklayarak bana bildirin, hemen geleceğim.";
        if (data.aktif_mod && data.aktif_mod.includes("Acil")) mesaj = "⚠️ Acil bir durum nedeniyle buradayım. Bana anında bildirim yollamak için lütfen aşağıdaki hazır mesaj butonlarını kullanın.";
        if (data.aktif_mod && data.aktif_mod.includes("Toplantı")) mesaj = "💼 Önemli bir toplantıdayım. Aşağıdaki acil durum mesaj butonlarından birine basarsanız ekranıma anında düşecektir.";
        
        const vatandasMesajiNode = document.getElementById('vatandas-mesaji');
        if (vatandasMesajiNode) {
            vatandasMesajiNode.innerText = mesaj;
        }
    });
};

// =================================================================
// 4. İŞLEVSEL FONKSİYONLAR VE BUTON TETİKLEYİCİLERİ
// =================================================================
function butonOlaylariniBagla() {
    const modButonlari = document.getElementsByClassName('mod-btn');
    for (let buton of modButonlari) {
        buton.addEventListener('click', function() {
            db.ref('guvenli_araclar/' + secureID).update({ aktif_mod: this.innerText });
        });
    }

    const hizliMesajButonlari = document.getElementsByClassName('hizli-mesaj-btn');
    for (let buton of hizliMesajButonlari) {
        buton.addEventListener('click', function() {
            const gonderilecekMetin = this.innerText;
            const suankiSaat = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            db.ref('guvenli_araclar/' + secureID + '/mesajlar').push({
                metin: gonderilecekMetin,
                tarih: suankiSaat,
                okundu: false
            }).then(() => {
                alert('🎉 Seçtiğiniz durum sürücüye tamamen gizli ve anonim olarak başarıyla iletildi!');
            });
        });
    }

    const btnTemizle = document.getElementById('btn-mesajlari-temizle');
    if (btnTemizle) {
        btnTemizle.addEventListener('click', () => {
            if(confirm("Tüm gelen mesaj geçmişini silmek istediğinize emin misiniz?")) {
                db.ref('guvenli_araclar/' + secureID + '/mesajlar').remove().then(() => {
                    alert("🗑️ Mesaj geçmişi başarıyla temizlendi!");
                });
            }
        });
    }

    const btnAra = document.getElementById('btn-guvenli-ara');
    if (btnAra) {
        btnAra.addEventListener('click', () => {
            alert('🌐 Numara olmadan, WebRTC tabanlı dijital sesli arama altyapısı simüle ediliyor...');
        });
    }

    const modSearch = document.getElementById('mod-search');
    if (modSearch) {
        modSearch.addEventListener('keyup', function() {
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
            const hataMesaji = document.getElementById('hata-mesaji');
            if (hataMesaji) {
                hataMesaji.classList.toggle('hidden', bulunanModSayisi > 0);
            }
        });
    }

    const btnVatandasAc = document.getElementById('btn-vatandas-ekranini-ac');
    if (btnVatandasAc) {
        btnVatandasAc.addEventListener('click', () => {
            document.getElementById('panel-ekrani').classList.add('hidden');
            document.getElementById('vatandas-ekrani').classList.remove('hidden');
            document.getElementById('main-title').innerText = "📱 Korumalı İletişim Sistemi";
        });
    }

    const btnPaneleDon = document.getElementById('btn-panele-geri-don');
    if (btnPaneleDon) {
        btnPaneleDon.addEventListener('click', () => {
            document.getElementById('vatandas-ekrani').classList.add('hidden');
            document.getElementById('panel-ekrani').classList.remove('hidden');
            document.getElementById('main-title').innerText = "QR PREMIUM";
        });
    }
}

function canliMesajHavuzunuGuncelle() {
    const mesajKutusu = document.getElementById('sürücü-mesaj-havuzu');
    if (!mesajKutusu) return;
    
    db.ref('guvenli_araclar/' + secureID + '/mesajlar').on('value', (snapshot) => {
        const mesajlar = snapshot.val();
        
        if (!mesajlar) {
            mesajKutusu.innerHTML = `<div style="color: #94a3b8; font-style: italic; text-align: center;">Henüz mesaj yok...</div>`;
            return;
        }

        mesajKutusu.innerHTML = ""; 
        
        Object.keys(mesajlar).reverse().forEach(key => {
            const m = mesajlar[key];
            const div = document.createElement('div');
            div.className = "mesaj-item";
            div.innerHTML = `<span class="mesaj-vakit">${m.tarih}</span> 💬 ${m.metin}`;
            mesajKutusu.appendChild(div);
        });
    });
}

// =================================================================
// 5. OTOMATİK QR KOD ÜRETİM SİSTEMİ
// =================================================================
function qrKodUret() {
    const qrAlani = document.getElementById("qrcode-alanı");
    if (!qrAlani) return;
    
    qrAlani.innerHTML = "";
    new QRCode(qrAlani, {
        text: window.location.href,
        width: 160,
        height: 160,
        colorDark : "#1e3a8a",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

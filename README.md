# Duygu Bulutu

Google Meet, sunum veya projeksiyon sırasında katılımcıların telefonlarından anonim kısa kelimeler gönderebildiği gerçek zamanlı web uygulaması.

## Dosyalar

- `participant.html`: Katılımcıların telefondan kelime göndereceği sayfa.
- `screen.html`: Sunum ekranında bulutların akacağı sayfa.
- `style.css`: Ortak tasarım ve animasyonlar.
- `app.js`: Gönderme, dinleme, bulut oluşturma, küfür filtresi ve emoji eşleştirme.
- `firebase-config.js`: Firebase bağlantı ayarları.

## Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin.
2. `Add project` ile yeni bir proje oluşturun.
3. Analytics zorunlu değildir, kapalı bırakabilirsiniz.
4. Proje açıldıktan sonra `Project settings` bölümüne girin.
5. `Your apps` alanından web uygulaması ekleyin.
6. Size verilen Firebase SDK config bilgilerini kopyalayın.
7. `firebase-config.js` içindeki örnek değerleri kendi bilgilerinizle değiştirin.

## Realtime Database Kurma

1. Firebase Console içinde `Build > Realtime Database` bölümüne girin.
2. `Create Database` seçin.
3. Size yakın bir bölge seçin.
4. Başlangıç için test modu seçilebilir, ardından aşağıdaki güvenlik kurallarını ekleyin.

## Güvenlik Kuralları

Aşağıdaki kurallar anonim yazmaya izin verir, sadece son kayıtları okumaya açar ve metin uzunluğunu 30 karakterle sınırlar.

```json
{
  "rules": {
    "cloudWords": {
      ".read": true,
      "$wordId": {
        ".write": "newData.exists()",
        ".validate": "newData.hasChildren(['text', 'createdAt']) && newData.child('text').isString() && newData.child('text').val().length <= 30 && newData.child('createdAt').isNumber()"
      }
    }
  }
}
```

Daha kapalı bir kullanım isterseniz etkinlikten sonra `.write` değerini `false` yapabilirsiniz.

## Localhost Üzerinde Çalıştırma

Bu dosyalar statik çalışır. Yine de Firebase ve tarayıcı davranışları için küçük bir yerel sunucu önerilir.

Python yüklüyse klasörde şu komutu çalıştırın:

```bash
python -m http.server 8000
```

Sonra tarayıcıda:

- Katılımcı sayfası: `http://localhost:8000/participant.html`
- Ekran sayfası: `http://localhost:8000/screen.html`

Google Meet'te `screen.html` açık olan tarayıcı sekmesini veya ekranı paylaşabilirsiniz. Katılımcılara `participant.html` adresini gönderin.

## Ücretsiz Yayınlama

### GitHub Pages

1. Bu dosyaları bir GitHub deposuna yükleyin.
2. Repository ayarlarında `Pages` bölümüne girin.
3. Kaynak olarak ana branch ve kök klasörü seçin.
4. Yayınlanan bağlantıdan `participant.html` ve `screen.html` sayfalarını açın.

### Firebase Hosting

1. Firebase CLI kurun.
2. Proje klasöründe `firebase init hosting` çalıştırın.
3. Public klasör olarak bu dosyaların bulunduğu klasörü seçin.
4. Tek sayfa uygulama ayarını `No` seçin.
5. `firebase deploy` ile yayınlayın.

## Küfür Filtresi Örnek Yapısı

`app.js` içinde şu bölüm vardır:

```js
const badWords = [
  "ornek-kufur-1",
  "ornek-kufur-2"
];
```

Bu listeye engellemek istediğiniz kelimeleri küçük harfle ekleyebilirsiniz. Sistem Türkçe karakterleri destekler.

## Duyguya Göre Emoji Eşleştirme

`app.js` içinde şu yapı bulunur:

```js
const emotionEmojiMap = {
  "kaygi": "😟",
  "kaygı": "😟",
  "umut": "🌱",
  "sukur": "🤲",
  "şükür": "🤲",
  "ozlem": "🌙",
  "özlem": "🌙"
};
```

Yeni eşleştirmeler ekleyebilirsiniz:

```js
"cesaret": "🔥",
"huzur": "🕊️"
```

## Kullanım Notları

- Katılımcı adı sorulmaz; gönderimler anonimdir.
- Her gönderi en fazla 30 karakterdir.
- Gönderimden sonra metin kutusu temizlenir.
- `screen.html` açıkken gelen yeni kelimeler anında bulut olarak görünür.
- Bulutlar sağdan girer, soldan çıkar ve yaklaşık 45 saniye sonra temizlenir.

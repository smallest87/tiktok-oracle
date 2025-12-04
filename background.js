// background.js - VERSI IPC
const HOST_NAME = "com.tiktok.oracle.cpp";
let nativePort = null;

function connectToNative() {
    nativePort = chrome.runtime.connectNative(HOST_NAME);

    // Dengar pesan DARI C++ (Source: Named Pipe -> C++ -> Chrome)
    nativePort.onMessage.addListener((msg) => {
        // Jika C++ minta sign url tertentu
        if (msg.action === "SIGN_REQUEST" && msg.url) {
            console.log("[ORACLE-BG] C++ Minta Sign:", msg.url);
            
            // Cari tab TikTok aktif dan perintahkan
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs[0] && tabs[0].url.includes("tiktok.com")) {
                     chrome.tabs.sendMessage(tabs[0].id, {
                        action: "PING_TEST", // Kita reuse action PING_TEST di content.js biar gak ubah banyak
                        custom_url: msg.url  // Tambah parameter URL
                    });
                }
            });
        }
    });
    
    // ... sisa kode disconnect sama ...
    nativePort.onDisconnect.addListener(() => { nativePort = null; });
}

connectToNative();

// Terima Hasil dari Tab -> Kirim ke C++
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "HASIL_FINAL") {
        if (nativePort) nativePort.postMessage(message.data);
    }
});
// background.js - VERSI INTEGRASI C++
console.log("[ORACLE-BG] Service Worker Memuat...");

const HOST_NAME = "com.tiktok.oracle.cpp";
let nativePort = null;

// 1. Fungsi untuk membuka jalur ke C++
function connectToNative() {
    console.log("[ORACLE-BG] Mencoba menghubungkan ke Native Host...");
    nativePort = chrome.runtime.connectNative(HOST_NAME);

    // Jika C++ mengirim balasan
    nativePort.onMessage.addListener((msg) => {
        console.log("[ORACLE-BG] Diterima dari C++:", msg);
    });

    // Jika koneksi putus (atau error saat start)
    nativePort.onDisconnect.addListener(() => {
        console.error("[ORACLE-BG] GAGAL/PUTUS dari C++.", chrome.runtime.lastError);
        nativePort = null;
    });
}

// Buka koneksi saat script dimuat
connectToNative();

// 2. Listener: Terima Signature dari Content Script -> Kirim ke C++
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "HASIL_FINAL") {
        console.log("[ORACLE-BG] Signature diterima! Mengirim ke C++...", message.data);
        
        if (nativePort) {
            nativePort.postMessage(message.data);
        } else {
            console.warn("[ORACLE-BG] Port C++ mati. Mencoba connect ulang...");
            connectToNative();
            // Coba kirim lagi setelah reconnect (kasar tapi efektif untuk tes)
            setTimeout(() => {
                if(nativePort) nativePort.postMessage(message.data);
            }, 500);
        }
    }
});

// Pemicu Test (Klik Ikon)
chrome.action.onClicked.addListener((tab) => {
    if (tab.url.includes("tiktok.com")) {
        console.log("[ORACLE-BG] Tombol diklik. Mengirim PING ke tab...");
        chrome.tabs.sendMessage(tab.id, { action: "PING_TEST" });
    }
});
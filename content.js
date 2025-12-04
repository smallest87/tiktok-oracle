// content.js
console.log("[ORACLE-CONTENT] Content Script dimuat.");

// A. Tanamkan inject.js ke dalam halaman
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = function() {
    this.remove(); // Hapus tag <script> agar bersih
    console.log("[ORACLE-CONTENT] inject.js telah ditanam.");
};
(document.head || document.documentElement).appendChild(script);

// B. Terima dari Background -> Teruskan ke Inject (Page)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "PING_TEST") {
        
        // Gunakan URL dari C++ jika ada, jika tidak pakai default
        const targetUrl = request.custom_url || "https://webcast.tiktok.com/webcast/room/enter/?aid=1988&room_id=123456";

        console.log("[ORACLE-CONTENT] Meminta sign untuk:", targetUrl);
        window.postMessage({
            type: "MINTA_SIGN_DARI_EXT",
            payload: { url: targetUrl }
        }, "*");
    }
});

// C. Terima dari Inject (Page) -> Teruskan ke Background
window.addEventListener("message", (event) => {
    if (event.source !== window || event.data.type !== "HASIL_SIGN_DARI_PAGE") return;

    console.log("[ORACLE-CONTENT] Dapat hasil dari Page, meneruskan ke Background...");
    chrome.runtime.sendMessage({
        action: "HASIL_FINAL",
        data: event.data.payload
    });
});
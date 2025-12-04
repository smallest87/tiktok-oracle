// inject.js - FINAL VERSION
(function() {
    console.log("%c[ORACLE-INJECT] Oracle Siap dengan byted_acrawler!", "color: green; font-weight: bold; font-size: 14px;");

    window.addEventListener("message", function(event) {
        // 1. Validasi Keamanan
        if (event.source !== window || !event.data.type) return;

        if (event.data.type === "MINTA_SIGN_DARI_EXT") {
            const requestPayload = event.data.payload;
            console.log("[ORACLE-INJECT] Memproses URL:", requestPayload.url);

            try {
                // 2. CEK APAKAH MESIN TIKTOK SUDAH SIAP
                if (typeof window.byted_acrawler === "undefined" || typeof window.byted_acrawler.frontierSign !== "function") {
                    throw new Error("Mesin byted_acrawler belum siap atau tidak ditemukan!");
                }

                // 3. PANGGIL FUNGSI ASLI (The Magic Happens Here)
                // Kita pass seluruh payload karena frontierSign butuh object {url: "..."}
                const signatureData = window.byted_acrawler.frontierSign(requestPayload);

                // Log hasil asli ke console untuk verifikasi visual
                console.log("[ORACLE-INJECT] Signature Asli Dibuat:", signatureData);

                // 4. KIRIM HASIL ASLI KE EXTENSION
                window.postMessage({
                    type: "HASIL_SIGN_DARI_PAGE",
                    payload: {
                        original_url: requestPayload.url,
                        x_bogus: signatureData['X-Bogus'], // Ambil X-Bogus
                        _signature: signatureData['_signature'] || "", // Jaga-jaga jika ada _signature
                        full_result: signatureData // Kirim semua data biar aman
                    }
                }, "*");

            } catch (err) {
                console.error("[ORACLE-INJECT] Gagal membuat signature:", err);
                window.postMessage({
                    type: "HASIL_SIGN_DARI_PAGE",
                    payload: { error: err.message }
                }, "*");
            }
        }
    });
})();
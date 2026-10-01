export default async function handler(req, res) {
    // Hanya menerima POST
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method tidak diizinkan."
        });
    }

    try {
        // Ambil prompt dari website
        const { prompt } = req.body || {};

        // Cek prompt
        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                error: "Prompt kosong."
            });
        }

        // Ambil API key dari Vercel Environment Variables
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "API key belum dipasang di Vercel."
            });
        }

        // Kirim request ke RumahAI
        const response = await fetch(
            "https://rumahai.net/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },

                body: JSON.stringify({
                    model: "Claude-Sonnet-5",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],

                    stream: false,
                    temperature: 0.7
                })
            }
        );

        // Baca response dari RumahAI
        const data = await response.json();

        // Kalau RumahAI mengembalikan error
        if (!response.ok) {
            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    data?.error ||
                    "RumahAI gagal memproses permintaan."
            });
        }

        // Ambil hasil teks AI
        const output =
            data?.choices?.[0]?.message?.content || "";

        if (!output) {
            return res.status(500).json({
                error: "AI mengembalikan hasil kosong."
            });
        }

        // Kirim hasil kembali ke script.js
        return res.status(200).json({
            kind: "text",
            data: output
        });

    } catch (error) {
        console.error("RUN API ERROR:", error);

        return res.status(500).json({
            error: "Terjadi kesalahan pada server."
        });
    }
}

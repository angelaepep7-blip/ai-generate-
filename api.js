export default function handler(req, res) {
    return res.status(200).json({
        apis: [
            {
                id: "gpt-5.6-luna",
                label: "GPT-5.6 Luna",
                button: "✨ Generate AI"
            },
            {
                id: "claude-opus-4.8",
                label: "Claude Opus 4.8",
                button: "✨ Generate AI"
            }
        ]
    });
}

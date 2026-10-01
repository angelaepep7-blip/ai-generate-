/* =====================================================
   ELEMENT
===================================================== */

const $ = id => document.getElementById(id);

const sel = $("apiSelect");
const btn = $("generateBtn");

const result = $("result");
const img = $("resultImage");
const txt = $("resultText");
const links = $("resultLinks");

const loading = $("loading");
const dl = $("downloadBtn");

const promptInput = $("promptInput");
const mediaInput = $("mediaInput");

const systemCard = $("systemCard");
const systemText = $("systemText");
const progressBar = $("progressBar");
const statusText = $("statusText");

const matrixCanvas = $("matrixCanvas");


/* =====================================================
   AUDIO
===================================================== */

let audioContext = null;

function playClickSound() {

    try {

        const AudioCtx =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioCtx) return;

        if (!audioContext) {
            audioContext = new AudioCtx();
        }

        const osc =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        osc.type = "sine";

        osc.frequency.setValueAtTime(
            520,
            audioContext.currentTime
        );

        osc.frequency.exponentialRampToValueAtTime(
            880,
            audioContext.currentTime + 0.10
        );

        gain.gain.setValueAtTime(
            0.08,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.12
        );

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();

        osc.stop(
            audioContext.currentTime + 0.12
        );

    } catch (error) {

        console.log("Audio tidak tersedia.");

    }

}


/* =====================================================
   TYPING SOUND
===================================================== */

let typingTimeout;

if (promptInput) {

    promptInput.addEventListener(
        "input",
        function () {

            clearTimeout(typingTimeout);

            typingTimeout = setTimeout(
                playClickSound,
                35
            );

        }
    );

}


/* =====================================================
   MATRIX
===================================================== */

const matrixCtx =
    matrixCanvas
        ? matrixCanvas.getContext("2d")
        : null;

const matrixChars =
    "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@";

let matrixDrops = [];
let matrixRunning = false;


function resizeMatrix() {

    if (!matrixCanvas) return;

    matrixCanvas.width =
        window.innerWidth;

    matrixCanvas.height =
        window.innerHeight;

    const columns =
        Math.floor(
            matrixCanvas.width / 14
        );

    matrixDrops =
        new Array(columns).fill(1);

}


resizeMatrix();

window.addEventListener(
    "resize",
    resizeMatrix
);


function drawMatrix() {

    if (!matrixRunning || !matrixCtx)
        return;

    matrixCtx.fillStyle =
        "rgba(0,0,0,.075)";

    matrixCtx.fillRect(
        0,
        0,
        matrixCanvas.width,
        matrixCanvas.height
    );

    matrixCtx.fillStyle =
        "#27ff68";

    matrixCtx.font =
        "13px monospace";

    for (
        let i = 0;
        i < matrixDrops.length;
        i++
    ) {

        const char =
            matrixChars[
                Math.floor(
                    Math.random() *
                    matrixChars.length
                )
            ];

        matrixCtx.fillText(
            char,
            i * 14,
            matrixDrops[i] * 14
        );

        if (
            matrixDrops[i] * 14 >
            matrixCanvas.height &&
            Math.random() > .975
        ) {

            matrixDrops[i] = 0;

        }

        matrixDrops[i]++;

    }

    requestAnimationFrame(drawMatrix);

}


function startMatrix() {

    if (!matrixCanvas) return;

    matrixRunning = true;

    matrixCanvas.classList.add("active");

    drawMatrix();

}


function stopMatrix() {

    matrixRunning = false;

    if (matrixCanvas) {
        matrixCanvas.classList.remove("active");
    }

}


/* =====================================================
   TERMINAL
===================================================== */

function generateTerminalText() {

    if (!systemText) return;

    let output = "";

    const lines = [

        "[SYSTEM] INITIALIZING...",
        "[AI] CONNECTING MODEL...",
        "[AI] READING PROMPT...",
        "[CORE] PROCESSING DATA...",
        "[ENGINE] GENERATING...",
        "[ENGINE] OPTIMIZING RESULT...",
        "[SYSTEM] FINALIZING..."

    ];

    for (let i = 0; i < 14; i++) {

        output +=
            lines[
                Math.floor(
                    Math.random() *
                    lines.length
                )
            ];

        output += "\n";

        for (let x = 0; x < 35; x++) {

            output +=
                matrixChars[
                    Math.floor(
                        Math.random() *
                        matrixChars.length
                    )
                ];

        }

        output += "\n";

    }

    systemText.textContent = output;

}


/* =====================================================
   SYSTEM
===================================================== */

let progressTimer;


function startSystem() {

    if (systemCard) {
        systemCard.classList.add("active");
    }

    if (statusText) {
        statusText.textContent =
            "AI SYSTEM PROCESSING...";
    }

    if (progressBar) {
        progressBar.style.width = "0%";
    }

    startMatrix();

    generateTerminalText();

    clearInterval(progressTimer);

    let progress = 0;

    progressTimer =
        setInterval(function () {

            progress +=
                Math.random() * 8;

            if (progress > 96) {
                progress = 96;
            }

            if (progressBar) {
                progressBar.style.width =
                    progress + "%";
            }

            generateTerminalText();

        }, 180);

}


function finishSystem() {

    clearInterval(progressTimer);

    if (progressBar) {
        progressBar.style.width = "100%";
    }

    if (statusText) {
        statusText.textContent =
            "AI GENERATION COMPLETE";
    }

    generateTerminalText();

    setTimeout(
        stopMatrix,
        1000
    );

}


/* =====================================================
   API LIST
===================================================== */

let APIS = [];
let current = null;


async function loadAPIs() {

    try {

        const response =
            await fetch("/api/list");

        if (!response.ok) {

            throw new Error(
                "Gagal mengambil daftar model AI."
            );

        }

        const data =
            await response.json();

        APIS =
            Array.isArray(data.apis)
                ? data.apis
                : Array.isArray(data)
                    ? data
                    : [];

        if (!APIS.length) {

            throw new Error(
                "Tidak ada model AI."
            );

        }

        sel.innerHTML =
            APIS.map(api => {

                return `
                    <option value="${api.id}">
                        ${api.label || api.id}
                    </option>
                `;

            }).join("");

        renderModel();

    } catch (error) {

        console.error(error);

        sel.innerHTML = `
            <option>
                Gagal memuat model AI
            </option>
        `;

    }

}


/* =====================================================
   MODEL
===================================================== */

function renderModel() {

    current =
        APIS.find(
            api =>
                api.id === sel.value
        );

    if (!current) return;

    btn.textContent =
        current.button ||
        "✨ Generate AI";

    result.classList.remove("show");

}


sel.addEventListener(
    "change",
    function () {

        playClickSound();

        renderModel();

    }
);


/* =====================================================
   RIPPLE
===================================================== */

function createRipple(event) {

    const button =
        event.currentTarget;

    const circle =
        document.createElement("span");

    const diameter =
        Math.max(
            button.clientWidth,
            button.clientHeight
        );

    const radius =
        diameter / 2;

    const rect =
        button.getBoundingClientRect();

    circle.style.width =
        diameter + "px";

    circle.style.height =
        diameter + "px";

    circle.style.left =
        event.clientX -
        rect.left -
        radius +
        "px";

    circle.style.top =
        event.clientY -
        rect.top -
        radius +
        "px";

    circle.classList.add("ripple");

    const old =
        button.querySelector(".ripple");

    if (old) {
        old.remove();
    }

    button.appendChild(circle);

}


/* =====================================================
   HASIL LINK
===================================================== */

function showLinks(data) {

    links.innerHTML = "";

    const text =
        typeof data === "string"
            ? data
            : JSON.stringify(data || "");

    const urls =
        text.match(
            /https?:\/\/[^\s"'\\<>]+/g
        ) || [];

    [
        ...new Set(urls)
    ]
        .slice(0, 6)
        .forEach(url => {

            const a =
                document.createElement("a");

            a.href = url;
            a.target = "_blank";
            a.rel = "noopener";

            a.textContent =
                "↗ " + url;

            a.style.cssText = `
                display:block;
                padding:12px;
                border-radius:12px;
                border:1px solid rgba(75,255,140,.25);
                color:#7dffaa;
                font-size:13px;
                word-break:break-all;
                text-decoration:none;
            `;

            links.appendChild(a);

        });

}


/* =====================================================
   GENERATE AI
===================================================== */

btn.addEventListener(
    "click",
    async function (event) {

        playClickSound();

        createRipple(event);

        if (!current) {

            alert(
                "Model AI belum tersedia."
            );

            return;

        }

        const prompt =
            promptInput
                ? promptInput.value.trim()
                : "";

        if (!prompt) {

            if (promptInput) {
                promptInput.focus();
            }

            alert(
                "Isi prompt terlebih dahulu."
            );

            return;

        }


        /* =========================
           START SYSTEM
        ========================= */

        startSystem();

        loading.classList.add("active");

        result.classList.remove("show");


        try {

            /*
             * BACKEND BARU
             *
             * /api/run.js hanya menerima:
             *
             * {
             *   prompt: "..."
             * }
             */

            const response =
                await fetch(
                    "/api/run",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            prompt: prompt
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "AI gagal memproses."
                );

            }


            /* =========================
               HASIL
            ========================= */

            if (
                data.kind === "image" &&
                data.image
            ) {

                img.src =
                    data.image;

                img.style.display =
                    "block";

                txt.style.display =
                    "none";

                dl.style.display =
                    "block";

                window.generatedImage =
                    data.image;

                links.innerHTML = "";

            }

            else {

                const output =
                    typeof data.data === "string"
                        ? data.data
                        : JSON.stringify(
                            data.data,
                            null,
                            2
                        );

                txt.textContent =
                    output;

                txt.style.display =
                    "block";

                img.style.display =
                    "none";

                dl.style.display =
                    "none";

                showLinks(data.data);

            }


            /* =========================
               SELESAI
            ========================= */

            finishSystem();

            result.classList.add("show");

            setTimeout(
                function () {

                    result.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                },
                300
            );


        }

        catch (error) {

            clearInterval(
                progressTimer
            );

            stopMatrix();

            if (statusText) {
                statusText.textContent =
                    "SYSTEM ERROR";
            }

            if (progressBar) {
                progressBar.style.width =
                    "0%";
            }

            console.error(error);

            alert(
                error.message ||
                "Terjadi kesalahan."
            );

        }

        finally {

            loading.classList.remove(
                "active"
            );

        }

    }
);


/* =====================================================
   DOWNLOAD
===================================================== */

dl.addEventListener(
    "click",
    function () {

        if (!window.generatedImage)
            return;

        playClickSound();

        const a =
            document.createElement("a");

        a.href =
            window.generatedImage;

        a.target =
            "_blank";

        a.download =
            "hasil-ai.png";

        a.click();

    }
);


/* =====================================================
   START
===================================================== */

loadAPIs();
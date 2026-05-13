// 🌐 i18n Configuration
const i18n = {
    th: {
        pageTitle: "Rocket ! — P2P File Transfer",
        headerTitle: "🚀 Rocket !",
        headerSubtitle: "รับ-ส่งไฟล์แบบ Peer-to-Peer",
        badgeDirect: "⚡ ตรง",
        badgeP2P: "📲 P2P",
        badgeNoServer: "🌐 ไม่ผ่านเซิร์ฟเวอร์",
        badgeEncrypted: "🔐 เข้ารหัส",
        tabSend: "📤 ส่งไฟล์",
        tabReceive: "📥 รับไฟล์",
        dropzoneText: "คลิกหรือลากไฟล์มาวางที่นี่ รองรับไฟล์ทุกประเภท",
        generateBtn: "สร้างรหัสรับ-ส่งไฟล์",
        scanOrEnter: "สแกน QR Code หรือป้อนรหัส",
        copyCode: "คัดลอก",
        copyLink: "🔗 คัดลอกลิงก์",
        expiryPrefix: "รหัสหมดอายุใน",
        statusConnecting: "กำลังเชื่อมต่อ...",
        statusReady: "พร้อมแล้ว — รอผู้รับเชื่อมต่อ...",
        statusConnected: "เชื่อมต่อสำเร็จ! กำลังส่งไฟล์...",
        statusClosed: "การเชื่อมต่อสิ้นสุดลง",
        statusError: "เกิดข้อผิดพลาด",
        statusExpired: "รหัสหมดอายุแล้ว — กรุณาสร้างใหม่",
        statusRejected: "ปฏิเสธการเชื่อมต่อ — รอผู้รับใหม่...",
        fileSent: "ส่งไฟล์สำเร็จ!",
        fileSentDesc: "ไฟล์ของคุณถูกส่งแบบ peer-to-peer ผ่าน WebRTC",
        sendAnother: "ส่งไฟล์อื่น",
        enterCode: "XXXXXXXX",
        connectBtn: "🔗 เชื่อมต่อและรับไฟล์",
        statusConnectingReceive: "กำลังเชื่อมต่อ...",
        fileReceived: "รับไฟล์สำเร็จ!",
        downloading: "กำลังดาวน์โหลดอัตโนมัติ...",
        receiveAnother: "รับไฟล์อื่น",
        footerDesc: "🚀 ไฟล์ถูกส่งตรง peer-to-peer โดยไม่ผ่าน server กลาง และมีการเข้ารหัสความปลอดภัย",
        modalTitle: "มีผู้ขอรับไฟล์",
        modalPeerIdLabel: "PEER ID",
        modalFileLabel: "ไฟล์",
        modalReject: "✕ ปฏิเสธ",
        modalAccept: "✓ ส่งไฟล์",
        toastCopiedCode: "คัดลอก Code แล้ว: ",
        toastCopiedLink: "คัดลอก Link แล้ว",
        toastCodeLength: "กรุณาใส่ code 8 ตัวอักษร",
        errLargeFile: "ไฟล์ใหญ่เกินไปสำหรับ browser (ขีดจำกัด 2GB)",
        errMemory: "ไฟล์ใหญ่เกินไปสำหรับ RAM ของ browser",
        langBtn: "EN/TH"
    },
    en: {
        pageTitle: "Rocket ! — P2P File Transfer",
        headerTitle: "🚀 Rocket !",
        headerSubtitle: "Secure P2P File Transfer",
        badgeDirect: "⚡ DIRECT",
        badgeP2P: "📲 P2P",
        badgeNoServer: "🌐 NO SERVER",
        badgeEncrypted: "🔐 ENCRYPTED",
        tabSend: "📤 SEND",
        tabReceive: "📥 RECEIVE",
        dropzoneText: "Click or drop files here. All types supported.",
        generateBtn: "Generate Transfer Code",
        scanOrEnter: "Scan QR code or enter code",
        copyCode: "COPY",
        copyLink: "🔗 COPY LINK",
        expiryPrefix: "Code expires in",
        statusConnecting: "Connecting to peer server...",
        statusReady: "Ready — Waiting for receiver...",
        statusConnected: "Connected! Sending file...",
        statusClosed: "Connection closed",
        statusError: "Error",
        statusExpired: "Code expired — Please generate a new one",
        statusRejected: "Connection rejected — Waiting...",
        fileSent: "File sent successfully!",
        fileSentDesc: "Your file was sent peer-to-peer via WebRTC",
        sendAnother: "Send another file",
        enterCode: "XXXXXXXX",
        connectBtn: "🔗 Connect & Receive File",
        statusConnectingReceive: "Connecting...",
        fileReceived: "File received!",
        downloading: "Downloading automatically...",
        receiveAnother: "Receive another file",
        footerDesc: "🚀 Files are sent peer-to-peer without a central server and are encrypted.",
        modalTitle: "Incoming File Request",
        modalPeerIdLabel: "PEER ID",
        modalFileLabel: "FILE",
        modalReject: "✕ Reject",
        modalAccept: "✓ Send",
        toastCopiedCode: "Code copied: ",
        toastCopiedLink: "Link copied",
        toastCodeLength: "Please enter an 8-character code",
        errLargeFile: "File too large for browser (limit 2GB)",
        errMemory: "File too large for browser RAM",
        langBtn: "TH/EN"
    }
};

let currentLang = localStorage.getItem('lang') || 'th';
function t(key) { return i18n[currentLang]?.[key] || key; }
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18n[lang][key]) el.placeholder = i18n[lang][key];
    });
    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = i18n[lang].langBtn;
}

// 💾 File Size Limit (2GB Fallback/Warning)
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

// Global variables
let peer = null;
let conn = null;
let currentFile = null;
let peerCode = null;
let codeCreatedAt = null;
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 นาที

// ─── Crypto RNG ──────────────────────────────────────────────────────────────
function generateSecureCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, b => chars[b % chars.length]).join('');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupFileInput();
    setupDragDrop();
    setLanguage(currentLang);
    
    document.getElementById('langToggle').addEventListener('click', () => {
        setLanguage(currentLang === 'th' ? 'en' : 'th');
    });
});

// ─── Tab switching ────────────────────────────────────────────────────────────
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    if (tab === 'send') {
        document.querySelector('.tab:nth-child(1)').classList.add('active');
        document.getElementById('sendSection').classList.add('active');
    } else {
        document.querySelector('.tab:nth-child(2)').classList.add('active');
        document.getElementById('receiveSection').classList.add('active');
    }
}

// ─── File input & drag-drop ───────────────────────────────────────────────────
function setupFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });
}

function setupDragDrop() {
    const dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('click', () => document.getElementById('fileInput').click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
}

function handleFile(file) {
    if (file.size > MAX_FILE_SIZE) {
        showToast(t('errLargeFile'));
        return;
    }
    currentFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'flex';
    document.getElementById('generateBtn').disabled = false;
}

function removeFile() {
    currentFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('generateBtn').disabled = true;
}

// ─── Generate code ────────────────────────────────────────────────────────────
function generateCode() {
    if (!currentFile) return;
    peerCode = generateSecureCode(8);
    codeCreatedAt = Date.now();

    initializePeer(peerCode);

    document.getElementById('sendStep1').style.display = 'none';
    document.getElementById('sendStep2').style.display = 'block';
    document.getElementById('peerCode').textContent = peerCode;

    const qrUrl = window.location.href.split('?')[0] + '?code=' + peerCode;
    document.getElementById('qrcode').innerHTML = '';
    new QRCode(document.getElementById('qrcode'), {
        text: qrUrl,
        width: 200,
        height: 200
    });

    startExpiryCountdown();
}

// ─── Expiry countdown ─────────────────────────────────────────────────────────
let countdownInterval = null;
function startExpiryCountdown() {
    clearInterval(countdownInterval);
    const timerEl = document.getElementById('expiryCountdown');
    const timerContainer = document.getElementById('expiryTimer');
    timerContainer.style.color = '';
    countdownInterval = setInterval(() => {
        const elapsed = Date.now() - codeCreatedAt;
        const remaining = Math.max(0, CODE_EXPIRY_MS - elapsed);
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

        if (remaining <= 60000) timerContainer.style.color = '#ff4757';
        if (remaining === 0) {
            clearInterval(countdownInterval);
            timerEl.textContent = '0:00';
            updateSendStatus(t('statusExpired'), 'error');
        }
    }, 1000);
}

// ─── Custom modal ───────
let _modalResolve = null;
function showConfirmModal(peerId, fileName) {
    return new Promise((resolve) => {
        _modalResolve = resolve;
        document.getElementById('modalPeerId').textContent = peerId;
        document.getElementById('modalFileName').textContent = fileName || 'ไม่ทราบชื่อไฟล์';
        document.getElementById('confirmModal').classList.add('show');
    });
}

function modalAccept() {
    document.getElementById('confirmModal').classList.remove('show');
    if (_modalResolve) { _modalResolve(true); _modalResolve = null; }
}

function modalReject() {
    document.getElementById('confirmModal').classList.remove('show');
    if (_modalResolve) { _modalResolve(false); _modalResolve = null; }
}

// ─── PeerJS ───────────────────────────────────────────────────────────────────
function initializePeer(id) {
    try {
        peer = new Peer(id, { debug: 2 }); // ใช้ Public Server ตามค่าเริ่มต้น
        peer.on('open', (peerId) => {
            console.log('My peer ID is: ' + peerId);
            updateSendStatus(t('statusReady'), 'ready');
        });

        peer.on('connection', async (connection) => {
            if (Date.now() - codeCreatedAt > CODE_EXPIRY_MS) {
                connection.close();
                updateSendStatus(t('statusExpired'), 'error');
                return;
            }

            const confirmed = await showConfirmModal(connection.peer, currentFile?.name);
            if (!confirmed) {
                connection.close();
                updateSendStatus(t('statusRejected'), 'ready');
                return;
            }

            handleConnection(connection);
        });

        peer.on('error', (err) => {
            console.error('Peer error:', err);
            updateSendStatus(t('statusError') + ': ' + err.message, 'error');
        });
    } catch (err) {
        console.error('Failed to initialize peer:', err);
        updateSendStatus('Connection failed: ' + err.message, 'error');
    }
}

function handleConnection(connection) {
    conn = connection;
    conn.on('open', () => {
        console.log('Connected to: ' + conn.peer);
        updateSendStatus(t('statusConnected'), 'connected');
        sendFile();
    });

    conn.on('data', (data) => {
        if (data.type === 'progress') updateSendProgress(data.progress);
    });

    conn.on('close', () => {
        console.log('Connection closed');
        updateSendStatus(t('statusClosed'), 'closed');
    });

    conn.on('error', (err) => {
        console.error('Connection error:', err);
        updateSendStatus(t('statusError'), 'error');
    });
}

// ─── Send file w/ Backpressure ───────────────────────────────────────────────
const BUFFER_HIGH = 1 * 1024 * 1024;  // 1MB
const BUFFER_LOW  = 256 * 1024;        // 256KB

function sendFile() {
    if (!conn || !currentFile) return;
    const chunkSize = 64 * 1024;
    let offset = 0;

    conn.send({
        type: 'metadata',
        name: currentFile.name,
        size: currentFile.size,
        mimeType: currentFile.type
    });

    function readNextChunk() {
        if (!conn) return;

        const dc = conn.dataChannel;
        if (dc && dc.bufferedAmount > BUFFER_HIGH) {
            dc.bufferedAmountLowThreshold = BUFFER_LOW;
            dc.addEventListener('bufferedamountlow', readNextChunk, { once: true });
            return;
        }

        if (offset >= currentFile.size) {
            setTimeout(() => {
                document.getElementById('sendStep2').style.display = 'none';
                document.getElementById('sendStep3').style.display = 'block';
            }, 500);
            return;
        }

        const chunk = currentFile.slice(offset, offset + chunkSize);
        const reader = new FileReader();
        reader.onload = (e) => {
            conn.send({
                type: 'chunk',
                data: e.target.result,
                offset: offset,
                total: currentFile.size
            });

            offset = Math.min(offset + chunkSize, currentFile.size);
            updateSendProgress(Math.min(100, Math.round((offset / currentFile.size) * 100)));
            readNextChunk();
        };
        reader.readAsArrayBuffer(chunk);
    }

    readNextChunk();
}

// ─── Status & Progress ────────────────────────────────────────────────────────
function updateSendStatus(message, status) {
    const statusEl = document.getElementById('sendStatus');
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('span');
    text.textContent = message;
    dot.style.animation = '';
    if (status === 'ready')          dot.style.background = '#2ed573';
    else if (status === 'connected') { dot.style.background = '#667eea'; dot.classList.add('loading'); }
    else if (status === 'error')     { dot.style.background = '#ff4757'; dot.style.animation = 'none'; }
    else if (status === 'closed')    dot.style.background = '#ffa502';
}

function updateSendProgress(progress) {
    document.getElementById('sendProgressContainer').style.display = 'block';
    document.getElementById('sendProgress').style.width = progress + '%';
    document.getElementById('sendProgressText').textContent = progress + '%';
}

// ─── Clipboard + Toast ────────────────────────────────────────────────────────
function copyCode() {
    navigator.clipboard.writeText(peerCode).then(() => showToast(t('toastCopiedCode') + peerCode));
}

function copyLink() {
    const url = window.location.href.split('?')[0] + '?code=' + peerCode;
    navigator.clipboard.writeText(url).then(() => showToast(t('toastCopiedLink')));
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

// ─── Reset send ───────────────────────────────────────────────────────────────
function resetSend() {
    removeFile();
    clearInterval(countdownInterval);
    if (peer) { peer.destroy(); peer = null; }
    if (conn) { conn.close();   conn = null; }
    document.getElementById('sendStep1').style.display = 'block';
    document.getElementById('sendStep2').style.display = 'none';
    document.getElementById('sendStep3').style.display = 'none';
    document.getElementById('sendProgressContainer').style.display = 'none';
    document.getElementById('qrcode').innerHTML = '';
    peerCode = null;
    codeCreatedAt = null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECEIVER
// ═══════════════════════════════════════════════════════════════════════════════
function connectToSender() {
    const code = document.getElementById('receiverCode').value.toUpperCase().trim();
    if (code.length !== 8) {
        showToast(t('toastCodeLength'));
        return;
    }

    document.getElementById('receiveStep1').style.display = 'none';
    document.getElementById('receiveStep2').style.display = 'block';

    const randomId = generateSecureCode(12).toLowerCase();

    try {
        peer = new Peer(randomId, { debug: 2 });

        peer.on('open', () => {
            console.log('Receiver peer ID: ' + peer.id);
            connectToPeer(code);
        });

        peer.on('error', (err) => {
            console.error('Peer error:', err);
            document.getElementById('receiveStatusText').textContent = t('statusError') + ': ' + err.message;
        });
    } catch (err) {
        console.error('Failed to initialize peer:', err);
        document.getElementById('receiveStatusText').textContent = 'Connection failed: ' + err.message;
    }
}

function connectToPeer(senderCode) {
    try {
        conn = peer.connect(senderCode, { reliable: true });
        conn.on('open', () => {
            console.log('Connected to sender: ' + senderCode);
            document.getElementById('receiveStatusText').textContent = t('statusConnectingReceive');
        });

        conn.on('data', (data) => handleReceivedData(data));
        conn.on('close', () => console.log('Connection closed'));
        conn.on('error', (err) => {
            console.error('Connection error:', err);
            document.getElementById('receiveStatusText').textContent = t('statusError');
        });
    } catch (err) {
        console.error('Failed to connect:', err);
        document.getElementById('receiveStatusText').textContent = 'Connection failed — Please check the code';
    }
}

// ─── Receive: Pre-allocated buffer ────────────────────────────────────────────
let receivedBuffer   = null;
let receivedBytes    = 0;
let receivedMetadata = null;

function handleReceivedData(data) {
    if (data.type === 'metadata') {
        if (data.size > MAX_FILE_SIZE) {
            showToast(t('errLargeFile'));
            conn.close();
            return;
        }
        
        receivedMetadata = data;
        receivedBytes    = 0;
        try {
            receivedBuffer = new Uint8Array(data.size);
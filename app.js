// Global variables
let peer = null;
let conn = null;
let currentFile = null;
let peerCode = null;
let codeCreatedAt = null;
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 นาที

// ─── Crypto RNG ──────────────────────────────────────────────────────────────
function generateSecureCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ตัด 0/O และ 1/I
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, b => chars[b % chars.length]).join('');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupFileInput();
    setupDragDrop();
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

    // FIX 1: restore QR code ที่หายไปตอน refactor ครั้งก่อน
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
            timerEl.textContent = 'หมดอายุแล้ว';
            updateSendStatus('Code หมดอายุแล้ว — กรุณาสร้างใหม่', 'error');
        }
    }, 1000);
}

// ─── Custom modal (FIX 5: แทน confirm() ที่เป็น browser native dialog) ───────
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
        peer = new Peer(id, { debug: 2 });

        peer.on('open', (peerId) => {
            console.log('My peer ID is: ' + peerId);
            updateSendStatus('Ready — รอผู้รับเชื่อมต่อ...', 'ready');
        });

        // FIX 5: async handler + custom modal
        peer.on('connection', async (connection) => {
            if (Date.now() - codeCreatedAt > CODE_EXPIRY_MS) {
                connection.close();
                updateSendStatus('Code หมดอายุแล้ว — กรุณาสร้างใหม่', 'error');
                return;
            }

            const confirmed = await showConfirmModal(connection.peer, currentFile?.name);
            if (!confirmed) {
                connection.close();
                updateSendStatus('ปฏิเสธการเชื่อมต่อ — รอผู้รับใหม่...', 'ready');
                return;
            }

            handleConnection(connection);
        });

        peer.on('error', (err) => {
            console.error('Peer error:', err);
            updateSendStatus('Error: ' + err.message, 'error');
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
        updateSendStatus('Connected! Sending file...', 'connected');
        sendFile();
    });

    conn.on('data', (data) => {
        if (data.type === 'progress') updateSendProgress(data.progress);
    });

    conn.on('close', () => {
        console.log('Connection closed');
        updateSendStatus('Connection closed', 'closed');
    });

    conn.on('error', (err) => {
        console.error('Connection error:', err);
        updateSendStatus('Connection error', 'error');
    });
}

// ─── Send file w/ Backpressure (FIX 4) ───────────────────────────────────────
const BUFFER_HIGH = 1 * 1024 * 1024;  // 1MB — pause
const BUFFER_LOW  = 256 * 1024;        // 256KB — resume

function sendFile() {
    if (!conn || !currentFile) return;

    const chunkSize = 64 * 1024; // 64KB ต่อ chunk
    let offset = 0;

    conn.send({
        type: 'metadata',
        name: currentFile.name,
        size: currentFile.size,
        mimeType: currentFile.type
    });

    function readNextChunk() {
        if (!conn) return;

        // FIX 4: เช็ค DataChannel buffer ก่อนส่ง
        const dc = conn.dataChannel;
        if (dc && dc.bufferedAmount > BUFFER_HIGH) {
            dc.bufferedAmountLowThreshold = BUFFER_LOW;
            dc.addEventListener('bufferedamountlow', readNextChunk, { once: true });
            return; // รอ event จาก browser — ไม่ต้อง poll ด้วย setTimeout
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
    navigator.clipboard.writeText(peerCode).then(() => showToast('คัดลอก Code แล้ว: ' + peerCode));
}

function copyLink() {
    const url = window.location.href.split('?')[0] + '?code=' + peerCode;
    navigator.clipboard.writeText(url).then(() => showToast('คัดลอก Link แล้ว'));
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
        showToast('กรุณาใส่ code 8 ตัวอักษร');
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
            document.getElementById('receiveStatusText').textContent = 'Error: ' + err.message;
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
            document.getElementById('receiveStatusText').textContent = 'Connected! Receiving file...';
        });

        conn.on('data', (data) => handleReceivedData(data));
        conn.on('close', () => console.log('Connection closed'));
        conn.on('error', (err) => {
            console.error('Connection error:', err);
            document.getElementById('receiveStatusText').textContent = 'Connection error';
        });
    } catch (err) {
        console.error('Failed to connect:', err);
        document.getElementById('receiveStatusText').textContent = 'Connection failed — Please check the code';
    }
}

// ─── Receive: Pre-allocated buffer (FIX 3) ────────────────────────────────────
// เดิม: receivedFileData.push(data.data) → array โตเรื่อย ๆ + ต้อง reduce() นับ bytes
// ใหม่: Uint8Array ขนาดตายตัวเท่ากับไฟล์ เขียน chunk ตาม offset โดยตรง
//        → RAM = ขนาดไฟล์จริง 1x เท่านั้น, ไม่มี overhead array

let receivedBuffer   = null;
let receivedBytes    = 0;
let receivedMetadata = null;

function handleReceivedData(data) {
    if (data.type === 'metadata') {
        receivedMetadata = data;
        receivedBytes    = 0;

        try {
            receivedBuffer = new Uint8Array(data.size); // allocate ครั้งเดียว
        } catch (e) {
            document.getElementById('receiveStatusText').textContent =
                'ไฟล์ใหญ่เกินไปสำหรับ RAM ของ browser (' + formatFileSize(data.size) + ')';
            return;
        }

        console.log('Receiving file:', data.name, formatFileSize(data.size));
        document.getElementById('receiveProgressContainer').style.display = 'block';

    } else if (data.type === 'chunk') {
        if (!receivedBuffer || !receivedMetadata) return;

        receivedBuffer.set(new Uint8Array(data.data), data.offset); // เขียนตำแหน่งตรง
        receivedBytes += data.data.byteLength;

        const progress = Math.min(100, Math.round((receivedBytes / receivedMetadata.size) * 100));
        document.getElementById('receiveProgress').style.width = progress + '%';
        document.getElementById('receiveProgressText').textContent = progress + '%';

        if (receivedBytes >= receivedMetadata.size) assembleFile();
    }
}

function assembleFile() {
    console.log('Assembling file...');

    const blob = new Blob([receivedBuffer], { type: receivedMetadata.mimeType });
    receivedBuffer = null; // คืน RAM ทันทีหลัง Blob ถูกสร้าง

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = receivedMetadata.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);

    document.getElementById('receivedFileName').textContent = receivedMetadata.name;
    document.getElementById('receiveStep2').style.display = 'none';
    document.getElementById('receiveStep3').style.display = 'block';

    receivedBytes    = 0;
    receivedMetadata = null;
}

function resetReceive() {
    if (peer) { peer.destroy(); peer = null; }
    if (conn) { conn.close();   conn = null; }
    receivedBuffer   = null;
    receivedBytes    = 0;
    receivedMetadata = null;

    document.getElementById('receiverCode').value = '';
    document.getElementById('receiveStep1').style.display = 'block';
    document.getElementById('receiveStep2').style.display = 'none';
    document.getElementById('receiveStep3').style.display = 'none';
    document.getElementById('receiveProgressContainer').style.display = 'none';
}

// ─── Utils ────────────────────────────────────────────────────────────────────
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        document.getElementById('receiverCode').value = code.toUpperCase();
        switchTab('receive');
    }
});

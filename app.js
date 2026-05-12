// Global variables
let peer = null;
let conn = null;
let currentFile = null;
let peerCode = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupFileInput();
    setupDragDrop();
});

// Tab switching
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

// File input setup
function setupFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
}

// Drag & Drop setup
function setupDragDrop() {
    const dropZone = document.getElementById('dropZone');
    
    dropZone.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
}

// Handle selected file
function handleFile(file) {
    currentFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'flex';
    document.getElementById('generateBtn').disabled = false;
}

// Remove selected file
function removeFile() {
    currentFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('generateBtn').disabled = true;
}

// Generate peer code and start sending
function generateCode() {
    if (!currentFile) return;
    
    // Generate random 6-character code
    peerCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Initialize PeerJS
    initializePeer(peerCode);
    
    // Show step 2
    document.getElementById('sendStep1').style.display = 'none';
    document.getElementById('sendStep2').style.display = 'block';
    
    // Display code
    document.getElementById('peerCode').textContent = peerCode;
    
    // Generate QR code
    const qrUrl = window.location.href.split('?')[0] + '?code=' + peerCode;
    new QRCode(document.getElementById('qrcode'), {
        text: qrUrl,
        width: 200,
        height: 200
    });
}

// Initialize PeerJS connection
function initializePeer(id) {
    try {
        peer = new Peer(id, {
            debug: 2
        });
        
        peer.on('open', (peerId) => {
            console.log('My peer ID is: ' + peerId);
            updateSendStatus('Ready to connect — Waiting for recipient...', 'ready');
        });
        
        peer.on('connection', (connection) => {
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

// Handle incoming connection
function handleConnection(connection) {
    conn = connection;
    
    conn.on('open', () => {
        console.log('Connected to: ' + conn.peer);
        updateSendStatus('Connected! Sending file...', 'connected');
        
        // Send file
        sendFile();
    });
    
    conn.on('data', (data) => {
        console.log('Received:', data);
        if (data.type === 'progress') {
            updateSendProgress(data.progress);
        }
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

// Send file to receiver
function sendFile() {
    if (!conn || !currentFile) return;
    
    const reader = new FileReader();
    const chunkSize = 16384; // 16KB chunks
    let offset = 0;
    
    // Send file metadata first
    const metadata = {
        type: 'metadata',
        name: currentFile.name,
        size: currentFile.size,
        mimeType: currentFile.type
    };
    conn.send(metadata);
    
    // Read and send file in chunks
    function readNextChunk() {
        const chunk = currentFile.slice(offset, offset + chunkSize);
        
        reader.onload = (e) => {
            const chunkData = {
                type: 'chunk',
                data: e.target.result,
                offset: offset,
                total: currentFile.size
            };
            
            conn.send(chunkData);
            
            offset += chunkSize;
            const progress = Math.round((offset / currentFile.size) * 100);
            updateSendProgress(progress);
            
            if (offset < currentFile.size) {
                setTimeout(readNextChunk, 10); // Small delay to prevent blocking
            } else {
                // File sent completely
                setTimeout(() => {
                    document.getElementById('sendStep2').style.display = 'none';
                    document.getElementById('sendStep3').style.display = 'block';
                }, 1000);
            }
        };
        
        reader.readAsArrayBuffer(chunk);
    }
    
    readNextChunk();
}

// Update send status
function updateSendStatus(message, status) {
    const statusEl = document.getElementById('sendStatus');
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('span');
    
    text.textContent = message;
    
    if (status === 'ready') {
        dot.style.background = '#2ed573';
    } else if (status === 'connected') {
        dot.style.background = '#667eea';
        dot.classList.add('loading');
    } else if (status === 'error') {
        dot.style.background = '#ff4757';
        dot.style.animation = 'none';
    } else if (status === 'closed') {
        dot.style.background = '#ffa502';
    }
}

// Update send progress
function updateSendProgress(progress) {
    document.getElementById('sendProgressContainer').style.display = 'block';
    document.getElementById('sendProgress').style.width = progress + '%';
    document.getElementById('sendProgressText').textContent = progress + '%';
}

// Copy code to clipboard
function copyCode() {
    navigator.clipboard.writeText(peerCode).then(() => {
        alert('Code copied: ' + peerCode);
    });
}

// Copy link to clipboard
function copyLink() {
    const url = window.location.href.split('?')[0] + '?code=' + peerCode;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied');
    });
}

// Reset send form
function resetSend() {
    removeFile();
    if (peer) {
        peer.destroy();
        peer = null;
    }
    if (conn) {
        conn.close();
        conn = null;
    }
    
    document.getElementById('sendStep1').style.display = 'block';
    document.getElementById('sendStep2').style.display = 'none';
    document.getElementById('sendStep3').style.display = 'none';
    document.getElementById('sendProgressContainer').style.display = 'none';
    document.getElementById('qrcode').innerHTML = '';
    peerCode = null;
}

// ========== RECEIVER FUNCTIONS ==========

// Connect to sender
function connectToSender() {
    const code = document.getElementById('receiverCode').value.toUpperCase().trim();
    
    if (code.length !== 6) {
        alert('Please enter 6-digit code');
        return;
    }
    
    document.getElementById('receiveStep1').style.display = 'none';
    document.getElementById('receiveStep2').style.display = 'block';
    
    // Initialize peer with random ID
    const randomId = Math.random().toString(36).substring(2, 15);
    
    try {
        peer = new Peer(randomId, {
            debug: 2
        });
        
        peer.on('open', () => {
            console.log('Receiver peer ID: ' + peer.id);
            connectToPeer(code);
        });
        
        peer.on('error', (err) => {
            console.error('Peer error:', err);
            document.getElementById('receiveStatusText').textContent = 
                'Error: ' + err.message;
        });
    } catch (err) {
        console.error('Failed to initialize peer:', err);
        document.getElementById('receiveStatusText').textContent = 
            'Connection failed: ' + err.message;
    }
}

// Connect to sender's peer
function connectToPeer(senderCode) {
    try {
        conn = peer.connect(senderCode, {
            reliable: true
        });
        
        conn.on('open', () => {
            console.log('Connected to sender: ' + senderCode);
            document.getElementById('receiveStatusText').textContent = 
                'Connected! Receiving file...';
        });
        
        conn.on('data', (data) => {
            handleReceivedData(data);
        });
        
        conn.on('close', () => {
            console.log('Connection closed');
        });
        
        conn.on('error', (err) => {
            console.error('Connection error:', err);
            document.getElementById('receiveStatusText').textContent = 
                'Connection error';
        });
    } catch (err) {
        console.error('Failed to connect:', err);
        document.getElementById('receiveStatusText').textContent = 
            'Connection failed - Please check the code';
    }
}

// Handle received data
let receivedFileData = [];
let receivedMetadata = null;

function handleReceivedData(data) {
    if (data.type === 'metadata') {
        receivedMetadata = data;
        receivedFileData = [];
        console.log('Receiving file:', data.name, data.size);
        document.getElementById('receiveProgressContainer').style.display = 'block';
    } else if (data.type === 'chunk') {
        receivedFileData.push(data.data);
        
        const progress = Math.round(((data.offset + data.data.byteLength) / data.total) * 100);
        document.getElementById('receiveProgress').style.width = progress + '%';
        document.getElementById('receiveProgressText').textContent = progress + '%';
        
        // Check if file is complete
        const totalReceived = receivedFileData.reduce((acc, chunk) => acc + chunk.byteLength, 0);
        if (totalReceived >= data.total) {
            assembleFile();
        }
    }
}

// Assemble and download file
function assembleFile() {
    console.log('Assembling file...');
    
    const blob = new Blob(receivedFileData, { type: receivedMetadata.mimeType });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = receivedMetadata.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    // Show success
    document.getElementById('receivedFileName').textContent = receivedMetadata.name;
    document.getElementById('receiveStep2').style.display = 'none';
    document.getElementById('receiveStep3').style.display = 'block';
    
    // Reset for next file
    receivedFileData = [];
    receivedMetadata = null;
}

// Reset receive form
function resetReceive() {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    if (conn) {
        conn.close();
        conn = null;
    }
    
    document.getElementById('receiverCode').value = '';
    document.getElementById('receiveStep1').style.display = 'block';
    document.getElementById('receiveStep2').style.display = 'none';
    document.getElementById('receiveStep3').style.display = 'none';
    document.getElementById('receiveProgressContainer').style.display = 'none';
}

// Utility: Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Check URL for code parameter (auto-fill receiver)
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        document.getElementById('receiverCode').value = code.toUpperCase();
        switchTab('receive');
    }
});

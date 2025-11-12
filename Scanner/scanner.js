// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    API_URL: 'http://localhost:3000/api',
    SCANNER_FPS: 10,
    SCANNER_QRBOX: 250
};

// ============================================
// ÉTAT DE L'APPLICATION
// ============================================
let appState = {
    html5QrCode: null,
    isScanning: false,
    cameras: [],
    currentCameraIndex: 0,
    scannedCount: 0,
    boardedCount: 0,
    currentReservation: null,
    scanHistory: []
};

// ============================================
// UTILITAIRES
// ============================================
const Utils = {
    formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    },

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    },

    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type]}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    playBeep(type = 'success') {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'success') {
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
            oscillator.start();
            setTimeout(() => oscillator.stop(), 100);
        } else if (type === 'error') {
            oscillator.frequency.value = 400;
            gainNode.gain.value = 0.3;
            oscillator.start();
            setTimeout(() => {
                oscillator.frequency.value = 300;
            }, 100);
            setTimeout(() => oscillator.stop(), 200);
        }
    }
};

// ============================================
// DÉCODAGE QR CODE
// ============================================
function decodeQRCodeData(qrString) {
    try {
        const data = JSON.parse(qrString);
        
        if (!data.v || !data.booking || !data.passengers) {
            throw new Error('Format QR Code invalide');
        }

        return {
            valid: true,
            data: data
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
}

// ============================================
// ✅ AFFICHAGE RÉSULTAT AVEC CHARGEMENT API
// ============================================
async function displayScanResult(qrData) {
    const resultContainer = document.getElementById('scan-result');
    const decoded = decodeQRCodeData(qrData);
    
    if (!decoded.valid) {
        resultContainer.innerHTML = `
            <div class="result-header">
                <h2 class="result-title">❌ QR Code invalide</h2>
                <span class="result-status status-invalid">INVALIDE</span>
            </div>
            <p>Le QR Code scanné n'est pas au bon format.</p>
            <p style="color: var(--color-text-secondary); font-size: 14px; margin-top: 12px;">
                Erreur : ${decoded.error}
            </p>
            <div class="result-actions" style="margin-top: 20px;">
                <button class="btn btn-secondary" onclick="clearResult()">Réessayer</button>
            </div>
        `;
        resultContainer.classList.add('show');
        Utils.playBeep('error');
        return;
    }
    
    // ✅ Si format simplifié (v2.0), charger les détails depuis l'API
    if (decoded.needsFullData) {
        resultContainer.innerHTML = `
            <div class="result-header">
                <h2 class="result-title">🔍 ${decoded.bookingNumber}</h2>
            </div>
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <p>Chargement des détails de la réservation...</p>
            </div>
        `;
        resultContainer.classList.add('show');
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/reservations/${decoded.bookingNumber}`);
            
            if (!response.ok) {
                throw new Error('Réservation non trouvée');
            }
            
            const result = await response.json();
            const reservation = result.reservation;
            
            // Convertir en format complet pour affichage
            const fullData = {
                v: "1.0",
                booking: reservation.bookingNumber,
                status: reservation.status,
                route: reservation.route,
                passengers: reservation.passengers.map((p, index) => ({
                    name: p.name,
                    type: index < (reservation.passengers.length - (reservation.passengerCounts?.children || 0)) ? 'ADULTE' : 'ENFANT',
                    seat: p.seat,
                    phone: p.phone,
                    baggage: p.baggage || 0
                })),
                payment: {
                    total: reservation.totalPriceNumeric,
                    currency: "FCFA"
                }
            };
            
            // Afficher avec les données complètes
            displayFullReservation(fullData);
            
        } catch (error) {
            resultContainer.innerHTML = `
                <div class="result-header">
                    <h2 class="result-title">❌ Erreur</h2>
                    <span class="result-status status-invalid">ERREUR</span>
                </div>
                <p>Impossible de charger les détails de la réservation.</p>
                <p style="color: var(--color-text-secondary); font-size: 14px; margin-top: 12px;">
                    ${error.message}
                </p>
                <div class="result-actions" style="margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="clearResult()">Réessayer</button>
                </div>
            `;
            Utils.playBeep('error');
        }
        
    } else {
        // ✅ Format complet (v1.0), afficher directement
        displayFullReservation(decoded.data);
    }
}

// ✅ NOUVELLE FONCTION : Afficher réservation complète
function displayFullReservation(reservation) {
    const resultContainer = document.getElementById('scan-result');
    
    const isValid = reservation.status === 'Confirmé';
    const isPending = reservation.status === 'En attente de paiement';
    const isCancelled = reservation.status === 'Annulé' || reservation.status === 'Expiré';
    
    const adults = reservation.passengers.filter(p => p.type === 'ADULTE');
    const children = reservation.passengers.filter(p => p.type === 'ENFANT');
    
    // ... (reste du code HTML existant) ...
    
    const passengersHTML = reservation.passengers.map(passenger => `
        <div class="passenger-card ${passenger.type === 'ENFANT' ? 'child' : ''}">
            <!-- ... HTML existant ... -->
        </div>
    `).join('');
    
    resultContainer.innerHTML = `
        <!-- ... HTML complet existant ... -->
    `;
    
    resultContainer.classList.add('show');
    
    if (isValid) {
        Utils.playBeep('success');
    } else {
        Utils.playBeep('error');
    }
    
    addToHistory(reservation, isValid);
}

// ============================================
// EMBARQUEMENT
// ============================================
function boardPassengers() {
    if (!appState.currentReservation) return;
    
    const booking = appState.currentReservation.booking;
    
    appState.boardedCount++;
    document.getElementById('boarded-count').textContent = appState.boardedCount;
    
    Utils.showToast(`Passagers embarqués : ${booking}`, 'success');
    Utils.playBeep('success');
    
    clearResult();
}

function rejectBoarding() {
    if (!appState.currentReservation) return;
    
    const booking = appState.currentReservation.booking;
    
    Utils.showToast(`Embarquement refusé : ${booking}`, 'error');
    Utils.playBeep('error');
    
    clearResult();
}

// ============================================
// HISTORIQUE
// ============================================
function addToHistory(reservation, isValid) {
    const historyList = document.getElementById('history-list');
    
    const noHistory = historyList.querySelector('.no-history');
    if (noHistory) {
        noHistory.remove();
    }
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-item-info">
            <div class="history-item-booking">${reservation.booking}</div>
            <div class="history-item-details">
                ${reservation.route.from} → ${reservation.route.to} | 
                ${reservation.passengers.length} passager(s)
                ${reservation.passengers.some(p => p.type === 'ENFANT') ? ' (👶 Enfant)' : ''}
            </div>
        </div>
        <div class="history-item-time">
            ${Utils.formatTime(new Date())}
        </div>
        <span class="history-item-status ${isValid ? 'success' : 'error'}">
            ${isValid ? 'Valide' : 'Invalide'}
        </span>
    `;
    
    historyItem.onclick = () => displayScanResult(JSON.stringify(reservation));
    
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    appState.scanHistory.unshift(reservation);
}

function clearHistory() {
    if (!confirm('Êtes-vous sûr de vouloir effacer l\'historique ?')) return;
    
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<p class="no-history">Aucun scan effectué</p>';
    
    appState.scanHistory = [];
    Utils.showToast('Historique effacé', 'info');
}

function clearResult() {
    const resultContainer = document.getElementById('scan-result');
    resultContainer.classList.remove('show');
    appState.currentReservation = null;
}

// ============================================
// SCANNER QR CODE
// ============================================
async function initScanner() {
    try {
        const statusDiv = document.getElementById('scanner-status');
        statusDiv.innerHTML = `
            <div class="status-icon">🔍</div>
            <p class="status-text">Recherche des caméras disponibles...</p>
        `;
        
        const cameras = await Html5Qrcode.getCameras();
        
        if (cameras && cameras.length > 0) {
            appState.cameras = cameras;
            
            statusDiv.innerHTML = `
                <div class="status-icon">✅</div>
                <p class="status-text">${cameras.length} caméra(s) détectée(s). Prêt à scanner.</p>
            `;
            
            document.getElementById('start-scan-btn').disabled = false;
            document.getElementById('switch-camera-btn').disabled = cameras.length <= 1;
            
            Utils.showToast(`${cameras.length} caméra(s) disponible(s)`, 'success');
        } else {
            throw new Error('Aucune caméra détectée');
        }
        
    } catch (error) {
        console.error('Erreur init scanner:', error);
        
        const statusDiv = document.getElementById('scanner-status');
        statusDiv.innerHTML = `
            <div class="status-icon">❌</div>
            <p class="status-text">Erreur : ${error.message}</p>
            <p class="status-text" style="font-size: 14px; margin-top: 8px;">
                Utilisez la saisie manuelle ou autorisez l'accès à la caméra.
            </p>
        `;
        
        Utils.showToast('Impossible d\'accéder à la caméra', 'error');
    }
}

async function startScanning() {
    try {
        const cameraId = appState.cameras[appState.currentCameraIndex].id;
        
        appState.html5QrCode = new Html5Qrcode("qr-reader");
        
        await appState.html5QrCode.start(
            cameraId,
            {
                fps: CONFIG.SCANNER_FPS,
                qrbox: CONFIG.SCANNER_QRBOX
            },
            (decodedText) => {
                appState.scannedCount++;
                document.getElementById('scanned-count').textContent = appState.scannedCount;
                
                stopScanning();
                displayScanResult(decodedText);
            },
            (errorMessage) => {
                // Erreur normale en continu
            }
        );
        
        appState.isScanning = true;
        
        document.getElementById('start-scan-btn').style.display = 'none';
        document.getElementById('stop-scan-btn').style.display = 'inline-flex';
        document.getElementById('scanner-status').style.display = 'none';
        
        Utils.showToast('Scanner activé', 'success');
        
    } catch (error) {
        console.error('Erreur démarrage scan:', error);
        Utils.showToast('Erreur lors du démarrage du scan', 'error');
    }
}

async function stopScanning() {
    if (!appState.html5QrCode || !appState.isScanning) return;
    
    try {
        await appState.html5QrCode.stop();
        appState.isScanning = false;
        
        document.getElementById('start-scan-btn').style.display = 'inline-flex';
        document.getElementById('stop-scan-btn').style.display = 'none';
        document.getElementById('scanner-status').style.display = 'block';
        
        Utils.showToast('Scanner arrêté', 'info');
        
    } catch (error) {
        console.error('Erreur arrêt scan:', error);
    }
}

async function switchCamera() {
    if (appState.cameras.length <= 1) return;
    
    await stopScanning();
    
    appState.currentCameraIndex = (appState.currentCameraIndex + 1) % appState.cameras.length;
    
    Utils.showToast(`Caméra ${appState.currentCameraIndex + 1}/${appState.cameras.length}`, 'info');
    
    setTimeout(() => {
        startScanning();
    }, 500);
}

// ============================================
// SAISIE MANUELLE
// ============================================
function openManualEntry() {
    const modal = document.getElementById('manual-modal');
    modal.classList.add('show');
}

function closeManualEntry() {
    const modal = document.getElementById('manual-modal');
    modal.classList.remove('show');
    
    document.getElementById('manual-booking-number').value = '';
    document.getElementById('manual-qr-data').value = '';
}

async function validateManualEntry() {
    const bookingNumber = document.getElementById('manual-booking-number').value.trim();
    const qrData = document.getElementById('manual-qr-data').value.trim();
    
    if (!bookingNumber && !qrData) {
        Utils.showToast('Veuillez renseigner au moins un champ', 'error');
        return;
    }
    
    if (qrData) {
        // Données QR complètes fournies
        closeManualEntry();
        displayScanResult(qrData);
    } else {
        // ✅ Créer un QR Code simplifié v2.0
        const simpleQR = {
            v: "2.0",
            b: bookingNumber,
            p: 1, // Sera mis à jour depuis l'API
            d: new Date().toISOString().split('T')[0],
            s: "C",
            c: new Date().toISOString()
        };
        
        closeManualEntry();
        displayScanResult(JSON.stringify(simpleQR));
    }
}

// ============================================
// ÉVÉNEMENTS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initScanner();
    
    document.getElementById('start-scan-btn').addEventListener('click', startScanning);
    document.getElementById('stop-scan-btn').addEventListener('click', stopScanning);
    document.getElementById('switch-camera-btn').addEventListener('click', switchCamera);
    
    document.getElementById('manual-entry-btn').addEventListener('click', openManualEntry);
    document.getElementById('close-modal').addEventListener('click', closeManualEntry);
    document.getElementById('cancel-manual').addEventListener('click', closeManualEntry);
    document.getElementById('validate-manual').addEventListener('click', validateManualEntry);
    
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
    
    document.getElementById('manual-modal').addEventListener('click', (e) => {
        if (e.target.id === 'manual-modal') {
            closeManualEntry();
        }
    });
});

// ============================================
// RACCOURCIS CLAVIER
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        if (appState.isScanning) {
            stopScanning();
        } else {
            startScanning();
        }
    }
    
    if (e.key === 'm' && !e.target.matches('input, textarea')) {
        openManualEntry();
    }
    
    if (e.key === 'Escape') {
        closeManualEntry();
        clearResult();
    }
});
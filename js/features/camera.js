// Camera/Selfie functionality
import { CONFIG } from '../config.js';

export class CameraManager {
    constructor() {
        this.cameraModal = document.getElementById('camera-modal');
        this.cameraFeed = document.getElementById('camera-feed');
        this.cameraCanvas = document.getElementById('camera-canvas');
        this.snapBtn = document.getElementById('snap-btn');
        this.selfiePreviewContainer = document.getElementById('selfie-preview-container');
        this.selfiePreview = document.getElementById('selfie-preview');
        this.takeSelfieBtn = document.getElementById('take-selfie-btn');
        this.cameraModalClose = document.getElementById('camera-modal-close');
        
        this.cameraStream = null;
        this.selfieData = null;
        
        this.init();
    }

    init() {
        // Event listeners
        this.takeSelfieBtn.addEventListener('click', () => this.openCamera());
        this.cameraModalClose.addEventListener('click', () => this.closeCamera());
        this.snapBtn.addEventListener('click', () => this.takeSnapshot());
    }

    async openCamera() {
        this.cameraModal.style.display = 'flex';
        
        try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' }, 
                audio: false 
            });
            this.cameraFeed.srcObject = this.cameraStream;
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
            this.closeCamera();
        }
    }

    closeCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
        this.cameraStream = null;
        this.cameraModal.style.display = 'none';
    }

    takeSnapshot() {
        const videoWidth = this.cameraFeed.videoWidth;
        const videoHeight = this.cameraFeed.videoHeight;
        
        this.cameraCanvas.width = videoWidth;
        this.cameraCanvas.height = videoHeight;
        
        const context = this.cameraCanvas.getContext('2d');
        context.drawImage(this.cameraFeed, 0, 0, videoWidth, videoHeight);
        
        this.selfieData = this.cameraCanvas.toDataURL('image/jpeg', CONFIG.CAMERA_QUALITY);
        this.selfiePreview.src = this.selfieData;
        this.selfiePreviewContainer.classList.remove('hidden');
        
        this.closeCamera();
    }

    getSelfieData() {
        return this.selfieData;
    }

    clearSelfie() {
        this.selfieData = null;
        this.selfiePreviewContainer.classList.add('hidden');
    }

    hasSelfie() {
        return this.selfieData !== null;
    }
}

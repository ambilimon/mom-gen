// Meeting history management
import { CONFIG } from '../config.js';
import { getMeetingHistory, saveMeetingHistory } from '../utils/storage.js';

export class HistoryManager {
    constructor(contactManager) {
        this.contactManager = contactManager;
        this.history = [];
        this.historyListContainer = document.getElementById('history-list-container');
        
        this.init();
    }

    init() {
        this.loadHistory();
    }

    loadHistory() {
        this.history = getMeetingHistory();
        this.renderHistory();
    }

    addMeeting(meetingData) {
        const meeting = {
            id: Date.now().toString(),
            ...meetingData,
            timestamp: new Date().toISOString()
        };
        
        this.history.unshift(meeting); // Add to beginning
        
        // Keep history to max items
        if (this.history.length > CONFIG.MAX_HISTORY_ITEMS) {
            this.history.pop();
        }
        
        saveMeetingHistory(this.history);
        this.renderHistory();
        return meeting;
    }

    deleteMeeting(id) {
        this.history = this.history.filter(m => m.id !== id);
        saveMeetingHistory(this.history);
        this.renderHistory();
    }

    renderHistory() {
        this.historyListContainer.innerHTML = '';
        
        if (this.history.length === 0) {
            this.historyListContainer.innerHTML = '<p class="text-sm text-gray-500">No meeting logs found.</p>';
            return;
        }

        this.history.forEach(meeting => {
            const div = document.createElement('div');
            div.className = 'history-item';
            const meetingTime = new Date(meeting.timestamp).toLocaleString();
            
            const selfieHtml = meeting.selfieData 
                ? `<img src="${meeting.selfieData}" class="w-20 h-20 rounded-lg border border-gray-200 mb-2" alt="Meeting selfie">`
                : '';
            
            div.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <p class="font-bold text-lg text-gray-800">${this.escapeHtml(meeting.recipientName)}</p>
                    <button class="btn-danger !text-xs !py-1 !px-2 delete-meeting-btn" data-id="${meeting.id}">Delete</button>
                </div>
                <p class="text-sm text-gray-600">${this.escapeHtml(meeting.companyName || 'No Company')}</p>
                <p class="text-sm text-gray-600 mb-2">${meetingTime}</p>
                
                ${selfieHtml}
                
                <p class="text-xs font-medium text-gray-700 mt-3">Message Sent:</p>
                <div class="text-xs text-gray-600 p-2 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap">${this.escapeHtml(meeting.generatedMessage)}</div>
                
                <button class="saveContactBtn" 
                    data-name="${this.escapeHtml(meeting.recipientName)}" 
                    data-phone="${this.escapeHtml(meeting.recipientPhone)}" 
                    data-company="${this.escapeHtml(meeting.companyName || '')}" 
                    data-address="${this.escapeHtml(meeting.companyAddress || '')}">
                    Save Contact
                </button>
            `;
            
            this.historyListContainer.appendChild(div);
        });

        // Add delete listeners
        this.historyListContainer.querySelectorAll('.delete-meeting-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.deleteMeeting(id);
            });
        });

        // Add Save Contact listeners
        this.historyListContainer.querySelectorAll('.saveContactBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.contactManager.saveContactToDevice({
                    name: btn.dataset.name,
                    phone: btn.dataset.phone,
                    company: btn.dataset.company,
                    address: btn.dataset.address
                });
            });
        });
    }

    getMeeting(id) {
        return this.history.find(m => m.id === id);
    }

    getAllMeetings() {
        return this.history;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

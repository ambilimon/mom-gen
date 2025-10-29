// Main form submission logic
import { SYSTEM_PROMPTS } from '../config.js';
import { getPrompts } from '../utils/storage.js';
import { callGeminiAPI } from '../utils/api.js';

export class FormManager {
    constructor(contactManager, snippetManager, cameraManager, historyManager) {
        this.contactManager = contactManager;
        this.snippetManager = snippetManager;
        this.cameraManager = cameraManager;
        this.historyManager = historyManager;
        
        this.form = document.getElementById('mom-form');
        this.recipientNameInput = document.getElementById('recipient-name');
        this.recipientPhoneInput = document.getElementById('recipient-phone');
        this.companyNameInput = document.getElementById('company-name');
        this.companyAddressInput = document.getElementById('company-address');
        this.meetingLocationInput = document.getElementById('meeting-location');
        this.participantsInput = document.getElementById('participants');
        this.messageTypeSelect = document.getElementById('message-type');
        this.rawNotesInput = document.getElementById('raw-notes');
        
        this.generateBtn = document.getElementById('generate-btn');
        this.generateBtnText = document.getElementById('generate-btn-text');
        this.generateBtnLoader = document.getElementById('generate-btn-loader');
        
        this.resultsContainer = document.getElementById('results-container');
        this.generatedMessageContainer = document.getElementById('generated-message-container');
        this.actionItemsList = document.getElementById('action-items-list');
        this.errorMessage = document.getElementById('error-message');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // 1. Get all form data
        const recipientName = this.recipientNameInput.value.trim();
        const recipientPhone = this.recipientPhoneInput.value.trim();
        const companyName = this.companyNameInput.value.trim();
        const companyAddress = this.companyAddressInput.value.trim();
        const meetingLocation = this.meetingLocationInput.value.trim();
        const participants = this.participantsInput.value.trim();
        const messageType = this.messageTypeSelect.value;
        const rawNotes = this.rawNotesInput.value.trim();

        if (!recipientName || !recipientPhone || !rawNotes) {
            this.showError("Please fill in Recipient's Name, Phone, and Raw Notes.");
            return;
        }

        // 2. Show loading state
        this.setLoading(true);
        this.showError(null);
        this.resultsContainer.classList.add('hidden');

        try {
            // 3. Find requested snippet
            const snippetTag = rawNotes.match(/\[USE_SNIPPET: (.*?)\]/);
            let snippetContent = null;
            if (snippetTag) {
                const snippetName = snippetTag[1];
                const foundSnippet = this.snippetManager.findSnippet(snippetName);
                if (foundSnippet) {
                    snippetContent = foundSnippet.content;
                }
            }

            // 4. Construct User Query
            let userQuery = `
Meeting Details:
- Recipient: ${recipientName}
- Company: ${companyName || 'N/A'}
- Address: ${companyAddress || 'N/A'}
- Location: ${meetingLocation || 'N/A'}
- Participants: ${participants || 'N/A'}

Raw Meeting Notes:
${rawNotes}
`;

            if (snippetContent) {
                userQuery += `\n\nPersonalize and integrate this service snippet:
${snippetContent}
`;
            }

            // 5. Get System Prompt (use custom if available, otherwise default)
            const customPrompts = getPrompts();
            const systemPrompt = customPrompts[messageType] || SYSTEM_PROMPTS[messageType];
            
            // 6. Call AI
            const aiResponse = await callGeminiAPI(userQuery, systemPrompt);

            // 7. Display results
            this.generatedMessageContainer.textContent = aiResponse.whatsappMessage;
            this.actionItemsList.innerHTML = ''; // Clear old items
            
            if (aiResponse.actionItems && aiResponse.actionItems.length > 0) {
                aiResponse.actionItems.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    this.actionItemsList.appendChild(li);
                });
            } else {
                this.actionItemsList.innerHTML = '<li>No action items for you.</li>';
            }
            
            this.resultsContainer.classList.remove('hidden');

            // 8. Save to contacts and history
            this.contactManager.saveContact(recipientName, recipientPhone);
            
            this.historyManager.addMeeting({
                recipientName,
                recipientPhone,
                companyName,
                companyAddress,
                meetingLocation,
                participants,
                messageType,
                rawNotes,
                generatedMessage: aiResponse.whatsappMessage,
                actionItems: aiResponse.actionItems,
                selfieData: this.cameraManager.getSelfieData()
            });

            // 9. Open WhatsApp
            const whatsappUrl = `https://wa.me/${recipientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(aiResponse.whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');

            // 10. Clear form for next entry
            this.clearForm();

        } catch (error) {
            console.error("Error in form submission:", error);
            this.showError(`Error: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    }

    clearForm() {
        this.form.reset();
        this.cameraManager.clearSelfie();
        this.resultsContainer.classList.add('hidden');
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.generateBtn.disabled = true;
            this.generateBtnText.classList.add('hidden');
            this.generateBtnLoader.classList.remove('hidden');
        } else {
            this.generateBtn.disabled = false;
            this.generateBtnText.classList.remove('hidden');
            this.generateBtnLoader.classList.add('hidden');
        }
    }

    showError(message) {
        if (message) {
            this.errorMessage.textContent = message;
            this.errorMessage.classList.remove('hidden');
        } else {
            this.errorMessage.classList.add('hidden');
        }
    }
}

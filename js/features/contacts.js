// Contact management
import { getContacts, saveContacts } from '../utils/storage.js';

export class ContactManager {
    constructor() {
        this.contacts = {};
        this.contactHistoryList = document.getElementById('contact-history-list');
        this.recipientNameInput = document.getElementById('recipient-name');
        this.recipientPhoneInput = document.getElementById('recipient-phone');
        
        this.init();
    }

    init() {
        this.loadContacts();
        
        // Auto-fill phone when contact name is selected
        this.recipientNameInput.addEventListener('change', () => {
            const contact = this.contacts[this.recipientNameInput.value.toLowerCase()];
            if (contact) {
                this.recipientPhoneInput.value = contact.phone;
            }
        });
    }

    loadContacts() {
        this.contacts = getContacts();
        this.renderContactDatalist();
    }

    saveContact(name, phone) {
        if (!name || !phone) return false;
        
        this.contacts[name.toLowerCase()] = { name, phone };
        saveContacts(this.contacts);
        this.renderContactDatalist();
        return true;
    }

    renderContactDatalist() {
        this.contactHistoryList.innerHTML = '';
        for (const key in this.contacts) {
            const option = document.createElement('option');
            option.value = this.contacts[key].name;
            this.contactHistoryList.appendChild(option);
        }
    }

    /**
     * Save contact to device as vCard file
     * @param {Object} contact - Contact data
     */
    saveContactToDevice(contact) {
        const { name, phone, company = '', address = '' } = contact;
        
        const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=CELL:${phone}
ORG:${company}
ADR;TYPE=WORK:;;${address};;;
END:VCARD`;

        const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s/g, '_')}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getContact(name) {
        return this.contacts[name.toLowerCase()] || null;
    }

    getAllContacts() {
        return this.contacts;
    }
}

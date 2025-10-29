// Snippet management
import { getSnippets, saveSnippets } from '../utils/storage.js';

export class SnippetManager {
    constructor() {
        this.snippets = [];
        this.snippetForm = document.getElementById('snippet-form');
        this.snippetNameInput = document.getElementById('snippet-name');
        this.snippetContentInput = document.getElementById('snippet-content');
        this.savedSnippetsList = document.getElementById('saved-snippets-list');
        this.snippetButtonsContainer = document.getElementById('snippet-buttons-container');
        this.rawNotesInput = document.getElementById('raw-notes');
        
        this.init();
    }

    init() {
        this.loadSnippets();
        
        // Event listener for adding new snippet
        this.snippetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSnippet();
        });
    }

    loadSnippets() {
        this.snippets = getSnippets();
        this.renderSnippetButtons();
        this.renderSavedSnippetsList();
    }

    addSnippet() {
        const name = this.snippetNameInput.value.trim();
        const content = this.snippetContentInput.value.trim();
        
        if (!name || !content) {
            return false;
        }
        
        this.snippets.push({ name, content });
        saveSnippets(this.snippets);
        this.snippetForm.reset();
        this.renderSnippetButtons();
        this.renderSavedSnippetsList();
        return true;
    }

    deleteSnippet(index) {
        if (index >= 0 && index < this.snippets.length) {
            this.snippets.splice(index, 1);
            saveSnippets(this.snippets);
            this.renderSnippetButtons();
            this.renderSavedSnippetsList();
            return true;
        }
        return false;
    }

    renderSnippetButtons() {
        this.snippetButtonsContainer.innerHTML = '';
        
        this.snippets.forEach(snippet => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-secondary text-xs !py-1 !px-2';
            button.textContent = `+ ${snippet.name}`;
            button.addEventListener('click', () => this.addSnippetToNotes(snippet));
            this.snippetButtonsContainer.appendChild(button);
        });
    }

    renderSavedSnippetsList() {
        this.savedSnippetsList.innerHTML = '';
        
        if (this.snippets.length === 0) {
            this.savedSnippetsList.innerHTML = '<p class="text-sm text-gray-500">No snippets saved.</p>';
            return;
        }
        
        this.snippets.forEach((snippet, index) => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-start p-2 border-b border-gray-100';
            div.innerHTML = `
                <div class="mr-2 flex-1">
                    <p class="font-medium text-sm text-gray-800">${this.escapeHtml(snippet.name)}</p>
                    <p class="text-xs text-gray-500 truncate">${this.escapeHtml(snippet.content)}</p>
                </div>
                <button class="btn btn-danger !py-1 !px-2 text-xs" data-index="${index}">Delete</button>
            `;
            this.savedSnippetsList.appendChild(div);
        });

        // Add delete event listeners
        this.savedSnippetsList.querySelectorAll('.btn-danger').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index, 10);
                this.deleteSnippet(index);
            });
        });
    }

    addSnippetToNotes(snippet) {
        // Add a tag to the notes. The AI will use this to find the full content.
        this.rawNotesInput.value += `\n[USE_SNIPPET: ${snippet.name}]`;
        this.rawNotesInput.focus();
    }

    findSnippet(name) {
        return this.snippets.find(s => s.name === name);
    }

    getAllSnippets() {
        return this.snippets;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

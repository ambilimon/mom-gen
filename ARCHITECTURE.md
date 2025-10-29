# MOM Generator - Module Architecture

## Architecture Diagram

```mermaid
graph TB
    HTML[index.html]
    CSS[css/styles.css]
    APP[js/app.js]
    CONFIG[js/config.js]
    
    subgraph Features
        SETTINGS[features/settings.js]
        FORM[features/form.js]
        CONTACTS[features/contacts.js]
        SNIPPETS[features/snippets.js]
        CAMERA[features/camera.js]
        HISTORY[features/history.js]
        NAV[features/navigation.js]
    end
    
    subgraph Utils
        STORAGE[utils/storage.js]
        API[utils/api.js]
    end
    
    subgraph External
        NETLIFY[netlify/functions/generate-mom.js]
        GEMINI[Gemini API]
        OPENROUTER[OpenRouter API]
    end
    
    HTML --> CSS
    HTML --> APP
    APP --> CONFIG
    APP --> SETTINGS
    APP --> CONTACTS
    APP --> SNIPPETS
    APP --> CAMERA
    APP --> HISTORY
    APP --> NAV
    APP --> FORM
    
    FORM --> CONTACTS
    FORM --> SNIPPETS
    FORM --> CAMERA
    FORM --> HISTORY
    
    HISTORY --> CONTACTS
    
    SETTINGS --> STORAGE
    SETTINGS --> API
    CONTACTS --> STORAGE
    SNIPPETS --> STORAGE
    HISTORY --> STORAGE
    FORM --> STORAGE
    FORM --> API
    
    API --> CONFIG
    STORAGE --> CONFIG
    
    API --> NETLIFY
    NETLIFY --> GEMINI
    NETLIFY --> OPENROUTER
```

## Dependency Flow

```
app.js (Entry Point)
  │
  ├─> SettingsManager
  │     └─> storage.js, api.js
  │
  ├─> ContactManager
  │     └─> storage.js
  │
  ├─> SnippetManager
  │     └─> storage.js
  │
  ├─> CameraManager
  │
  ├─> HistoryManager (depends on ContactManager)
  │     └─> storage.js
  │
  ├─> NavigationManager
  │
  └─> FormManager (depends on all above)
        └─> storage.js, api.js
```

## Data Flow

```
User Input (Form)
  │
  ├─> FormManager.handleSubmit()
  │     │
  │     ├─> SnippetManager.findSnippet()
  │     ├─> api.callGeminiAPI()
  │     │     └─> Netlify Function
  │     │           └─> AI Provider (Gemini/OpenRouter)
  │     │
  │     ├─> ContactManager.saveContact()
  │     │     └─> storage.saveContacts()
  │     │
  │     ├─> HistoryManager.addMeeting()
  │     │     └─> storage.saveMeetingHistory()
  │     │
  │     └─> Open WhatsApp with generated message
  │
  └─> Display Results
```

## Module Responsibilities

### Core
- **app.js**: Orchestration & initialization
- **config.js**: Constants & configuration

### Features (UI + Logic)
- **settings.js**: API configuration
- **form.js**: Main business logic
- **contacts.js**: Contact CRUD
- **snippets.js**: Template management
- **camera.js**: Media capture
- **history.js**: Meeting logs
- **navigation.js**: UI navigation

### Utils (Helpers)
- **storage.js**: Data persistence
- **api.js**: Network communication

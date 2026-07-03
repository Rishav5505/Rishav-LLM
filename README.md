# Rishav AI Chatbot Web Application

Rishav AI is a production-ready, full-stack AI chatbot platform built using **React.js**, **Tailwind CSS**, **Node.js/Express**, **MongoDB**, and the **Google Gemini API** (`gemini-2.5-flash` model by default).

It mimics ChatGPT's conversational model with real-time chats, contextual conversation history (memory), PDF document uploads with textual QA search (RAG-lite), custom chatbot personality configurations, speech-to-text voice inputs, and audio speech synthesis outputs.

---

## Technical Features
- **Frontend:** React (Vite template), Tailwind CSS (v4), Axios, Lucide React, and React Router DOM.
- **Backend:** Express API, JWT Session state, Multer (memory buffer storage), PDF-parse, rate-limiting, and error middleware.
- **AI Integration:** Google Generative AI Node SDK, featuring conversational memory context windows (20 messages) and keyword similarity RAG-lite indexing.

---

## Directory Folder Structure
```
Rishav LLM/
├── server/                 # Node.js backend
│   ├── config/             # DB settings
│   ├── controllers/        # Express handlers (Auth, Chat, PDF, Admin Settings)
│   ├── middleware/         # Auth verification guards, file uploads, rate limits
│   ├── models/             # Mongoose schemas (User, Chat, Message, Document, Setting)
│   ├── routes/             # API routes definitions
│   ├── services/           # Gemini core client and PDF chunk matching logic
│   ├── utils/              # Helpers
│   ├── .env                # Backend configurations
│   ├── server.js           # Server startup script
│   └── package.json        # Backend package file
├── src/                    # React frontend source
│   ├── components/         # Reusable panels (Sidebar, Navbar, ChatBubble, PDFUploader)
│   ├── context/            # React Global States (AuthContext, ChatContext)
│   ├── pages/              # Routing portals (Home, Login, Register, Dashboard, Chat, Profile, Admin)
│   ├── services/           # Axios API mappings
│   └── utils/              # Markdown parsers
├── index.html              # HTML shell
├── tailwind.config.js      # CSS configuration
├── vite.config.js          # Vite config
├── package.json            # Frontend package file
└── README.md               # Setup reference
```

---

## Installation & Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally on default port `27017` (or access to MongoDB Atlas connection string)
- **Google Gemini API Key** (Acquire one from [Google AI Studio](https://aistudio.google.com/))

### Step 1: Environment Setup
1. Open [server/.env](file:///c:/Users/risha/Desktop/Rishav%20LLM/server/.env) and configure the variables:
   - Provide your **Google Gemini API key** in the `GEMINI_API_KEY` field.
   - Adjust `MONGO_URI` if you are using an external Atlas URL (it defaults to `mongodb://127.0.0.1:27017/rishav-ai` for local installations).

### Step 2: Install Dependencies & Run Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   npm install
   ```
2. Start the backend Node server using `nodemon` (auto-reloads on edits):
   ```bash
   npm run dev
   ```
   *The server starts listening on port `5000` (e.g. `http://localhost:5000`).*

### Step 3: Install Dependencies & Run Frontend
1. Open a second terminal window in the project root (`Rishav LLM/`):
   ```bash
   npm install
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *Vite boots the frontend on port `5173` or similar (e.g. `http://localhost:5173`).*

---

## API Documentation Routes

### 1. Authentication
- `POST /api/auth/register` - Creates a user account.
- `POST /api/auth/login` - Authenticates user credentials and returns a JWT.
- `GET /api/auth/me` - Verifies session JWT and fetches the current profile.

### 2. Conversations Chat
- `POST /api/chat/new` - Initiates a new chat thread.
- `GET /api/chat/history` - Fetches the user's active session history.
- `GET /api/chat/history/:id` - Pulls details, messages, and uploaded files for a chat.
- `POST /api/chat/message` - Dispatches user prompts, retrieves Gemini responses, saves both messages.
- `DELETE /api/chat/:id` - Deletes chat threads, texts, and related documents.
- `PUT /api/chat/:id/title` - Renames chat thread title manually.
- `POST /api/chat/:id/clear` - Clears conversation text but keeps the session shell.

### 3. PDF Document Operations
- `POST /api/pdf/upload` - Processes Multi-part uploads, parses text in-memory, splits into chunks, and links them to the chat ID.
- `POST /api/pdf/ask` - Executes targeted queries against text chunks from a single document.

### 4. Admin Options
- `GET /api/admin/settings` - Fetches active chatbot system instructions.
- `PUT /api/admin/settings` - Updates global system prompts (Restricted to user role `admin`).

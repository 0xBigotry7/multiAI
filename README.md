# Multi-Agent AI Dating Simulator

A modern React frontend with Python Flask backend application that simulates conversations between AI agents using CrewAI. The application features both single AI chat and multi-agent conversation modes.

## Project Structure

```
.
├── backend/                 # Python Flask backend
│   ├── app.py              # Main Flask application with Socket.IO
│   └── requirements.txt    # Python dependencies
└── frontend/              # React TypeScript frontend
    ├── public/            # Static files
    ├── src/
    │   ├── components/    # Shared UI components
    │   │   └── layout/    # Layout components (BottomNavigation, LeftSidebar)
    │   ├── features/      # Feature-specific components
    │   │   ├── chat/      # Single AI chat feature
    │   │   │   ├── components/  # Chat-specific components
    │   │   │   ├── hooks/       # Custom hooks for chat
    │   │   │   └── SingleAIChat.tsx
    │   │   └── simulator/ # Multi-agent simulator feature
    │   │       └── ChatSimulator.tsx
    │   ├── services/     # Shared services
    │   │   └── socket/   # Socket.IO service
    │   ├── types/        # TypeScript type definitions
    │   ├── config/       # Configuration files
    │   └── App.tsx      # Main application component
    ├── package.json
    └── tsconfig.json

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- npm or yarn
- WSL2 (for Windows users)

## Environment Setup

1. Clone this repository:
```bash
git clone <repository-url>
cd multiAI
```

2. Set up the Python backend:
```bash
cd backend

# Create a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows using WSL: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create and configure .env file
cp .env.example .env
# Edit .env with your API keys:
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY (optional)
# - DEEPSEEK_API_KEY (optional)
# - LLAMA_API_KEY (optional)
# - MIXTRAL_API_KEY (optional)
```

3. Set up the React frontend:
```bash
cd frontend

# Install dependencies
npm install
```

## Running the Application

1. Start the Python backend server:
```bash
cd backend
source venv/bin/activate  # On Windows using WSL: source venv/bin/activate
python app.py
```

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Features

### Single AI Chat Mode
- One-on-one conversation with selected AI model
- Real-time message updates
- Support for multiple AI providers
- Voice input support (coming soon)
- Chat history management

### Multi-Agent Simulator Mode
- Simulated conversations between two AI agents
- Multiple personality modes:
  - Network Debate Mode
  - Technical Discussion Mode
  - Rap Battle Mode
- Real-time conversation progress tracking
- Support for different AI models for each agent
- Ability to pause and continue conversations

### Common Features
- Dark mode UI
- Mobile-responsive design
- Socket.IO real-time communication
- Error handling and reconnection
- Message history
- Model selection
- Settings management

## Configuration

### Frontend
- AI model configurations in `src/config/agentPersonalities.ts`
- Socket event definitions in `src/services/socket/events.ts`
- Theme configuration in `src/App.tsx`

### Backend
- Environment variables in `.env`
- Model configurations in `app.py`
- Agent personalities and conversation settings in `app.py`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 
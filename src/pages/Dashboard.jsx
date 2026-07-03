import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, MessageSquarePlus, Code, Terminal, BookOpen, 
  Lightbulb, HelpCircle, FileText, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNewChat, postMessage, chats } = useChat();

  const suggestionCards = [
    {
      title: 'Code assistance',
      prompt: 'Explain asynchronous JavaScript closures and provide a working example of a memoized function.',
      icon: <Code size={18} className="text-purple-400" />,
      color: 'hover:border-purple-500/40 hover:bg-purple-950/10',
    },
    {
      title: 'Interview prep',
      prompt: 'Grill me on system design concepts related to horizontal vs vertical scaling and load balancer algorithms.',
      icon: <Terminal size={18} className="text-blue-400" />,
      color: 'hover:border-blue-500/40 hover:bg-blue-950/10',
    },
    {
      title: 'Summarization',
      prompt: 'What is the best way to write a concise, outcome-oriented executive summary? Show me a standard template.',
      icon: <BookOpen size={18} className="text-green-400" />,
      color: 'hover:border-green-500/40 hover:bg-green-950/10',
    },
    {
      title: 'Productivity hacks',
      prompt: 'Draft a professional email requesting a project deadline extension due to delayed API dependencies integration.',
      icon: <Lightbulb size={18} className="text-yellow-400" />,
      color: 'hover:border-yellow-500/40 hover:bg-yellow-950/10',
    },
  ];

  const handleCreateChat = async (initialPrompt = '') => {
    try {
      const newChat = await createNewChat('New Chat');
      navigate(`/chat/${newChat._id}`);
      
      if (initialPrompt) {
        setTimeout(async () => {
          await postMessage(initialPrompt);
        }, 300);
      }
    } catch (err) {
      console.error('Failed to instantiate chat from dashboard:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full select-none relative">
      
      {/* Subtle background glow */}
      <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />

      {/* Decorative center sparkles */}
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-purple to-indigo-900 flex items-center justify-center border border-brand-purple/40 shadow-[0_0_30px_rgba(116,9,104,0.35)] mb-6 animate-pulse">
        <Sparkles size={26} className="text-white" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-2 tracking-tight">
        Hello, {user?.name || 'Explorer'}
      </h1>
      <p className="text-sm sm:text-base text-gray-400 text-center max-w-lg mb-10 leading-relaxed">
        Start a new chatbot session, upload reference PDFs, or select one of the suggested prompts below.
      </p>

      {/* Suggestion Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12">
        {suggestionCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => handleCreateChat(card.prompt)}
            className={`flex flex-col text-left p-5 glass-panel glass-panel-hover rounded-2xl cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(116,9,104,0.1)] transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                {card.icon}
                <span className="text-xs font-bold text-gray-200 tracking-wide">{card.title}</span>
              </div>
              <ArrowRight size={14} className="text-gray-500 hover:text-white transition-colors" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 italic">
              "{card.prompt}"
            </p>
          </div>
        ))}
      </div>

      {/* Main Start Action */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <button
          onClick={() => handleCreateChat()}
          className="flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3.5 px-8 rounded-xl transition-all cursor-pointer text-sm shadow-[0_0_20px_rgba(116,9,104,0.3)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageSquarePlus size={18} />
          Create New Chat
        </button>

        {chats.length > 0 && (
          <button
            onClick={() => navigate(`/chat/${chats[0]._id}`)}
            className="flex items-center justify-center gap-2 bg-dark-surface/50 hover:bg-dark-hover/75 border border-dark-border/80 text-gray-300 hover:text-white font-bold py-3.5 px-8 rounded-xl transition-all cursor-pointer text-sm"
          >
            Resume Recent Chat
          </button>
        )}
      </div>

      {/* Statistics brief */}
      <div className="mt-16 flex items-center justify-center gap-8 border-t border-dark-border/40 pt-6 w-full max-w-md text-xs text-gray-500">
        <div className="text-center">
          <p className="font-bold text-gray-300 text-lg">{chats.length}</p>
          <p>Total Chats</p>
        </div>
        <div className="h-8 w-px bg-dark-border/50" />
        <div className="text-center">
          <p className="font-bold text-gray-300 text-lg">
            {user?.role === 'admin' ? 'Admin' : 'User'}
          </p>
          <p>Account Role</p>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

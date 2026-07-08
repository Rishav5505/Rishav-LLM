import React, { useState } from 'react';
import { Menu, FileDown, Trash2, Cpu, Sparkles, Sliders, ChevronDown } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const modelsList = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    desc: 'Default - Ultra-fast & Multimodal',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    desc: 'Advanced Reasoning & Analysis',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/10',
    borderColor: 'border-indigo-400/20'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    desc: 'ChatGPT - Smart & Concise',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    desc: 'Claude - Master of Coding & Writing',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    desc: 'High-speed Open Source (Free)',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20'
  },
  {
    id: 'qwen-2.5-coder',
    name: 'Qwen 2.5 Coder',
    provider: 'Alibaba',
    desc: 'Expert Code Generation (Free)',
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
    borderColor: 'border-teal-400/20'
  }
];

const Navbar = ({ toggleSidebar }) => {
  const { 
    currentChat, messages, selectedModel, changeSelectedModel, clearChatSession,
    temperature, setTemperature, maxOutputTokens, setMaxOutputTokens
  } = useChat();

  const [showSettings, setShowSettings] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleClearChat = async () => {
    if (!currentChat) return;
    if (confirm('Are you sure you want to clear all message history in this chat?')) {
      await clearChatSession(currentChat._id);
    }
  };

  const handleExportPDF = () => {
    if (!messages || messages.length === 0) {
      alert('No messages to export.');
      return;
    }
    
    // Open a clean window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker prevented printing. Please allow popups for this site.');
      return;
    }

    const chatTitle = currentChat?.title || 'Chat Session';
    
    // Format messages cleanly for PDF printing
    let messagesHTML = '';
    messages.forEach((msg) => {
      const isUserMsg = msg.role === 'user';
      const roleLabel = isUserMsg ? 'USER' : 'RISHAV AI';
      
      // Basic formatting parsing for print view
      const rawText = msg.content;
      const formattedContent = rawText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code style="background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>');
        
      messagesHTML += `
        <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9; page-break-inside: avoid;">
          <div style="font-weight: 700; font-size: 11px; color: ${isUserMsg ? '#475569' : '#740968'}; margin-bottom: 6px; letter-spacing: 0.5px;">
            ${roleLabel}
          </div>
          <div style="font-size: 13.5px; color: #0f172a; line-height: 1.6; font-family: inherit;">
            ${formattedContent}
          </div>
        </div>
      `;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Export - ${chatTitle}</title>
          <style>
            @media print {
              body { padding: 0; }
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto; 
              color: #0f172a;
              background-color: #ffffff;
            }
            h1 { 
              color: #740968; 
              font-size: 24px;
              border-bottom: 2px solid #740968; 
              padding-bottom: 12px; 
              margin-bottom: 4px; 
              font-weight: 800;
            }
            .subtitle {
              color: #64748b;
              font-size: 12px;
              margin-bottom: 40px;
            }
            .content {
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Rishav AI</h1>
          <div class="subtitle">Chat Session Export &bull; Title: <strong>${chatTitle}</strong></div>
          <div class="content">${messagesHTML}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-dark-border bg-dark-sidebar/90 px-4 shrink-0 backdrop-blur-md select-none sticky top-0 z-30">
      {/* Mobile Drawer Action & Navigation Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-dark-hover md:hidden text-gray-300 transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>
        
        {currentChat ? (
          <h2 className="hidden md:block font-bold text-base text-white max-w-sm truncate">
            {currentChat.title}
          </h2>
        ) : (
          <span className="hidden md:block font-bold text-base bg-gradient-to-r from-brand-purple-light to-indigo-400 bg-clip-text text-transparent">
            Rishav AI Assistant
          </span>
        )}
      </div>

      {/* Model Selection and Action Control Panels */}
      {currentChat && (
        <div className="flex items-center gap-2 md:gap-4">
          {/* Live System Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-xl px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            System Online
          </div>

          {/* Custom Model Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-dark-surface hover:bg-dark-hover border border-dark-border rounded-xl px-3 py-1.5 text-xs text-gray-300 transition-all cursor-pointer select-none active:scale-95"
              title="Select LLM Model"
            >
              {(() => {
                const activeModel = modelsList.find(m => m.id === selectedModel) || modelsList[0];
                const Icon = activeModel.id.startsWith('gemini-') ? Sparkles : Cpu;
                return (
                  <>
                    <Icon size={14} className={activeModel.color} />
                    <span className="font-semibold text-white">{activeModel.name}</span>
                  </>
                );
              })()}
              <ChevronDown size={12} className="text-gray-500" />
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-45" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute top-full right-0 mt-2 w-80 bg-dark-sidebar border border-dark-border rounded-2xl p-2 shadow-2xl z-50 animate-message">
                  <div className="px-3 py-2 border-b border-dark-border mb-1 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                    Select AI Model
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-1">
                    {modelsList.map((model) => {
                      const isSelected = model.id === selectedModel;
                      const Icon = model.id.startsWith('gemini-') ? Sparkles : Cpu;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            changeSelectedModel(model.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer hover:bg-dark-surface ${
                            isSelected 
                              ? 'bg-dark-surface border border-dark-border shadow-sm' 
                              : 'border border-transparent'
                          }`}
                        >
                          <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${model.bgColor} ${model.borderColor}`}>
                            <Icon size={14} className={model.color} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white truncate">{model.name}</span>
                              <span className="text-[9px] font-bold text-gray-500 bg-dark-bg/60 border border-dark-border/40 rounded px-1.5 py-0.5 uppercase shrink-0">
                                {model.provider}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">{model.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Model Settings Panel Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                showSettings 
                  ? 'bg-brand-purple/10 border-brand-purple text-brand-purple-light shadow-[0_0_15px_rgba(116,9,104,0.25)]' 
                  : 'bg-dark-surface hover:bg-dark-hover border-dark-border text-gray-300'
              }`}
              title="Generation Parameters"
            >
              <Sliders size={14} />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2.5 w-64 glass-panel rounded-2xl p-4.5 shadow-2xl border border-white/10 z-50 text-left select-none">
                <h4 className="text-xs font-extrabold text-white mb-4 tracking-wider uppercase flex items-center gap-1.5">
                  <Sliders size={12} className="text-brand-purple-light" />
                  Model Parameters
                </h4>
                
                {/* Temperature Slider */}
                <div className="space-y-1.5 mb-4.5">
                  <div className="flex justify-between text-[11px] font-bold text-gray-400">
                    <span>Temperature (Creativity)</span>
                    <span className="text-brand-purple-light font-mono">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-brand-purple"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 font-medium">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Max Length Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-gray-400">
                    <span>Max Response Length</span>
                    <span className="text-indigo-400 font-mono">{maxOutputTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="2048"
                    step="64"
                    value={maxOutputTokens}
                    onChange={(e) => setMaxOutputTokens(parseInt(e.target.value))}
                    className="w-full h-1 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-brand-purple"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 font-medium">
                    <span>Short</span>
                    <span>Long</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export PDF Button */}
          {messages.length > 0 && (
            <>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1 bg-dark-surface hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer"
                title="Export Transcript as PDF"
              >
                <FileDown size={14} className="text-indigo-400" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Clear History Button */}
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 bg-dark-surface hover:bg-red-950/15 hover:border-red-900 border border-dark-border text-gray-400 hover:text-red-400 font-semibold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer"
                title="Clear Chat Messages"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

import React from 'react';
import { Menu, FileDown, Trash2, Cpu, Sparkles } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const Navbar = ({ toggleSidebar }) => {
  const { 
    currentChat, messages, selectedModel, changeSelectedModel, clearChatSession 
  } = useChat();

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
          {/* Model Selection Dropdown */}
          <div className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-xl px-2.5 py-1.5 text-xs text-gray-300">
            <Cpu size={14} className="text-brand-purple-light" />
            <select
              value={selectedModel}
              onChange={(e) => changeSelectedModel(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-medium pr-1"
            >
              <option value="gemini-2.5-flash" className="bg-dark-surface text-white">
                gemini-2.5-flash
              </option>
              <option value="gemini-2.5-pro" className="bg-dark-surface text-white">
                gemini-2.5-pro
              </option>
            </select>
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

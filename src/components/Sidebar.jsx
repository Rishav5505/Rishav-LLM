import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, MessageSquare, Trash2, Edit2, Check, X, 
  User, Settings, LogOut, FileText, Menu, Sparkles
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { 
    chats, currentChat, createNewChat, deleteChatSession, 
    renameChatSession, chatsLoading 
  } = useChat();

  // Inline editing state for chat titles
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateChat = async () => {
    try {
      const newChat = await createNewChat('New Chat');
      navigate(`/chat/${newChat._id}`);
      if (isOpen) toggleSidebar(); // Close mobile drawer
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (chat, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(chat._id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = async (chatId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      await renameChatSession(chatId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (chatId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat session and its documents?')) {
      await deleteChatSession(chatId);
      navigate('/dashboard');
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Main Sidebar Wrapper */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-dark-sidebar border-r border-dark-border text-gray-200 transition-transform duration-300 md:sticky md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-16 items-center justify-between border-b border-dark-border px-5 shrink-0 select-none">
          <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-purple to-indigo-900 border border-brand-purple/50">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Rishav AI
            </span>
          </Link>
          <button onClick={toggleSidebar} className="p-1 rounded-lg hover:bg-dark-hover md:hidden cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Action Button: Create New Chat */}
        <div className="p-4 shrink-0">
          <button
            onClick={handleCreateChat}
            className="flex w-full items-center justify-center gap-2 border border-brand-purple bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple-light hover:text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(116,9,104,0.15)]"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        {/* Scrollable Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-3 select-none">
            Recent Chats
          </span>

          {chatsLoading ? (
            <div className="text-xs text-gray-500 text-center py-4">Loading sessions...</div>
          ) : chats.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4 px-3 select-none">
              No chat history. Start a new session above!
            </div>
          ) : (
            <div className="space-y-1 mt-2">
              {chats.map((chat) => {
                const isActive = currentChat && currentChat._id === chat._id;
                const isEditing = editingId === chat._id;

                return (
                  <div
                    key={chat._id}
                    onClick={() => {
                      if (!isEditing) {
                        navigate(`/chat/${chat._id}`);
                        if (isOpen) toggleSidebar();
                      }
                    }}
                    className={`group relative flex items-center rounded-xl p-3 text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-purple/20 text-white border-l-4 border-brand-purple'
                        : 'text-gray-400 hover:bg-dark-hover hover:text-gray-200'
                    }`}
                  >
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(chat._id, e)}
                        className="flex items-center w-full gap-1.5"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 bg-dark-bg border border-brand-purple rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          type="submit"
                          className="text-green-400 hover:text-green-300 p-0.5"
                          onClick={(e) => handleSaveRename(chat._id, e)}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-300 p-0.5"
                          onClick={handleCancelRename}
                        >
                          <X size={14} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <MessageSquare size={16} className="mr-2.5 shrink-0 text-gray-500" />
                        <span className="truncate flex-1 pr-12">{chat.title}</span>

                        {/* Inline Actions (visible on hover) */}
                        <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleStartEdit(chat, e)}
                            className="p-1 hover:text-white rounded text-gray-500 hover:bg-dark-surface cursor-pointer"
                            title="Rename"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(chat._id, e)}
                            className="p-1 hover:text-red-400 rounded text-gray-500 hover:bg-dark-surface cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation Panels */}
        <div className="border-t border-dark-border p-3 shrink-0 space-y-1 bg-dark-sidebar">
          {/* User Profile Info Card */}
          <Link
            to="/profile"
            onClick={() => isOpen && toggleSidebar()}
            className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-dark-hover transition-colors cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-surface border border-dark-border text-brand-purple-light font-bold select-none uppercase">
              {user?.name ? user.name[0] : <User size={16} />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold truncate text-white">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email || 'email@example.com'}</p>
            </div>
          </Link>

          {/* Admin Command Link (only shown if admin role) */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => isOpen && toggleSidebar()}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-dark-hover transition-colors cursor-pointer"
            >
              <Settings size={14} className="text-brand-purple-light" />
              Admin Personality
            </Link>
          )}

          {/* Logout Action */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/15 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

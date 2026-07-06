import React, { useState, useEffect } from 'react';
import { User, Sparkles, Copy, Check, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { renderMarkdown } from '../utils/markdown';
import Loader from './Loader';

const ChatBubble = ({ message }) => {
  const { role, content, loading, error, createdAt } = message;
  const isUser = role === 'user';
  const isAssistant = !isUser;
  const isNewMessage = isAssistant && (!createdAt || (Date.now() - new Date(createdAt).getTime()) < 3000);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop reading if the bubble is unmounted
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting symbols before speaking
    const cleanSpeechText = content
      .replace(/[*#`_\-]/g, '')
      .replace(/\[Source:.*?\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex w-full py-4 px-4 md:px-6 transition-all animate-message">
      <div className={`flex max-w-4xl mx-auto w-full gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        
        {/* Assistant Avatar (left side) */}
        {!isUser && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-950 border border-indigo-500/40 text-indigo-400 select-none shadow-sm mt-7">
            <Sparkles size={15} />
          </div>
        )}

        {/* Message Bubble Container */}
        <div className={`flex flex-col space-y-1.5 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Sender label */}
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-gray-500 select-none px-1">
            {isUser ? 'You' : 'Rishav AI'}
          </span>

          <div
            className={`text-sm md:text-base leading-relaxed transition-all rounded-2xl p-4 shadow-xl border ${
              isUser
                ? 'bg-brand-purple/15 border-brand-purple/35 text-white rounded-tr-none shadow-[0_0_15px_rgba(116,9,104,0.1)]'
                : 'bg-dark-surface/45 border-dark-border/80 text-gray-200 rounded-tl-none'
            }`}
          >
            {loading ? (
              <Loader size="md" />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-500/30 rounded-xl p-3">
                <AlertCircle size={18} />
                <span>{content}</span>
              </div>
            ) : (
              <div className={`prose-custom prose prose-invert max-w-none ${isNewMessage ? 'blinking-cursor' : ''}`}>
                {renderMarkdown(content)}
              </div>
            )}
          </div>
        </div>

        {/* User Avatar (right side) */}
        {isUser && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-purple/20 border border-brand-purple/50 text-brand-purple-light select-none shadow-sm mt-7">
            <User size={15} />
          </div>
        )}

        {/* Quick Actions (Assistant messages only) */}
        {!isUser && !loading && !error && (
          <div className="flex flex-col sm:flex-row gap-1 self-end mb-1 shrink-0 select-none">
            {/* Speak toggle */}
            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isSpeaking
                  ? 'border-brand-purple bg-brand-purple/15 text-brand-purple-light shadow-[0_0_10px_rgba(156,21,141,0.25)]'
                  : 'border-dark-border hover:bg-dark-hover hover:border-gray-500 hover:text-white text-gray-500'
              }`}
              title={isSpeaking ? 'Mute Speech' : 'Speak Message'}
            >
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-dark-border hover:bg-dark-hover hover:border-gray-500 hover:text-white text-gray-500 transition-all cursor-pointer"
              title="Copy message"
            >
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;

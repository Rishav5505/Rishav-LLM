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
    <div
      className={`flex w-full gap-4 py-6 px-4 md:px-6 transition-all animate-message ${
        isUser ? 'bg-dark-bg' : 'bg-dark-surface/60 border-y border-dark-border/40'
      }`}
    >
      <div className="flex max-w-3xl mx-auto w-full gap-4 items-start">
        {/* Avatar Icon */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold select-none ${
            isUser
              ? 'bg-brand-purple/20 border-brand-purple/60 text-brand-purple-light'
              : 'bg-indigo-950 border-indigo-500/50 text-indigo-400'
          }`}
        >
          {isUser ? <User size={16} /> : <Sparkles size={16} />}
        </div>

        {/* Bubble Message Content */}
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wide uppercase text-gray-400 select-none">
              {isUser ? 'You' : 'Rishav AI'}
            </span>
          </div>

          <div className="text-sm md:text-base leading-relaxed text-gray-300">
            {loading ? (
              <Loader size="md" />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-500/30 rounded-lg p-3">
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

        {/* Quick Actions (Copy response for model outputs) */}
        {!isUser && !loading && !error && (
          <div className="shrink-0 pt-1 flex flex-col sm:flex-row gap-1.5 select-none">
            {/* Speech synthesis speak toggle */}
            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isSpeaking
                  ? 'border-brand-purple bg-brand-purple/10 text-brand-purple-light'
                  : 'border-dark-border hover:bg-dark-hover hover:border-gray-500 hover:text-white text-gray-400'
              }`}
              title={isSpeaking ? 'Mute Speech' : 'Speak Message'}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* Copy clip button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-dark-border hover:bg-dark-hover hover:border-gray-500 hover:text-white text-gray-400 transition-all cursor-pointer"
              title="Copy message"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;

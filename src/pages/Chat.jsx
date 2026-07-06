import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Send, Mic, MicOff, ArrowLeft, Paperclip, 
  HelpCircle, Sparkles, Wand2, Loader2, Volume2, VolumeX,
  AlertCircle, FileText, Image, Music
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { chatAPI } from '../services/api';
import ChatBubble from '../components/ChatBubble';

const Chat = () => {
  const { id } = useParams();
  const { 
    currentChat, messages, loadChatDetails, postMessage, 
    messagesLoading, selectedModel, uploadPdfFile, documents 
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('soundEnabled') !== 'false');
  const [isFocused, setIsFocused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const getFileIconAndColor = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      return { Icon: FileText, iconColor: 'text-red-400', bgColor: 'bg-red-950/15', borderColor: 'border-red-500/25' };
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
      return { Icon: Image, iconColor: 'text-purple-400', bgColor: 'bg-purple-950/15', borderColor: 'border-purple-500/25' };
    }
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
      return { Icon: Music, iconColor: 'text-emerald-400', bgColor: 'bg-emerald-950/15', borderColor: 'border-emerald-500/25' };
    }
    if (['docx', 'doc'].includes(ext)) {
      return { Icon: FileText, iconColor: 'text-blue-400', bgColor: 'bg-blue-950/15', borderColor: 'border-blue-500/25' };
    }
    return { Icon: FileText, iconColor: 'text-gray-400', bgColor: 'bg-gray-800/15', borderColor: 'border-gray-700/25' };
  };

  const handlePdfUploadClick = () => {
    playSound('click');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePdfUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || !currentChat) return;

    const allowedExtensions = /\.(pdf|docx|doc|txt|csv|md|html|css|png|jpg|jpeg|webp|mp3|wav|ogg|m4a)$/i;
    if (
      !allowedExtensions.test(selectedFile.name) && 
      !selectedFile.type.startsWith('image/') && 
      !selectedFile.type.startsWith('audio/')
    ) {
      setUploadError('Unsupported format. Upload PDF, Word, Text, Image, or Audio.');
      setTimeout(() => setUploadError(''), 4000);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      setTimeout(() => setUploadError(''), 4000);
      return;
    }

    setIsUploading(true);
    setUploadError('');
    try {
      const result = await uploadPdfFile(selectedFile);
      if (result && result.success) {
        playSound('success');
      } else {
        setUploadError(result?.message || 'Failed to upload file.');
        setTimeout(() => setUploadError(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setUploadError('An unexpected error occurred.');
      setTimeout(() => setUploadError(''), 4000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Sound effects generator utilizing Web Audio API (cross-browser compatible)
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'mic-start') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'success') {
        // Play double chord sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);

        setTimeout(() => {
          const ctx2 = new AudioContext();
          const osc2 = ctx2.createOscillator();
          const gain2 = ctx2.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx2.destination);
          osc2.frequency.setValueAtTime(659.25, ctx2.currentTime); // E5
          gain2.gain.setValueAtTime(0.04, ctx2.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.18);
          osc2.start();
          osc2.stop(ctx2.currentTime + 0.2);
        }, 110);
      }
    } catch (e) {
      console.warn('Audio Context sound play blocked by browser policy:', e);
    }
  };

  // Toggle sound and persist setting
  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('soundEnabled', String(newVal));
  };

  // Reload chat details when ID changes
  useEffect(() => {
    if (id) {
      loadChatDetails(id);
    }
  }, [id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagesLoading]);

  // Sound cue on message complete
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && !lastMsg.loading && !lastMsg.error) {
        playSound('success');
      }
    }
  }, [messages]);

  // Handle message send
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    playSound('click');
    const messageText = inputText.trim();
    setInputText(''); // Clear input optimistically

    // Trigger postMessage from ChatContext
    await postMessage(messageText);
  };

  // Handle enter key submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Enhance prompt utilizing Gemini
  const handleEnhancePrompt = async () => {
    if (!inputText.trim() || isEnhancing) return;
    setIsEnhancing(true);
    playSound('click');
    try {
      const response = await chatAPI.enhancePrompt(inputText);
      if (response.data.success && response.data.enhancedPrompt) {
        setInputText(response.data.enhancedPrompt);
      }
    } catch (err) {
      console.error('Failed to enhance prompt:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Mic speech recognition logic (ChatGPT style: continuous + real-time interim results)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      playSound('click');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      playSound('mic-start');
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      let accumulatedFinal = '';
      const baseText = inputText ? `${inputText.trim()} ` : '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let newFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinal += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        accumulatedFinal += newFinal;
        setInputText(baseText + accumulatedFinal + interimTranscript);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition instantiation error:', err);
      setIsListening(false);
    }
  };

  // Terminate speech recognition if navigating away
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-dark-bg relative overflow-hidden">
      
      <div className="flex-1 flex min-h-0">
        {/* Active conversation panel */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          
          {/* Scrollable conversation history */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 select-text">
            {messagesLoading && messages.length === 0 ? (
              <div className="flex flex-col h-full w-full items-center justify-center text-sm text-gray-500 select-none">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-purple mb-4"></div>
                Loading conversation messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col h-full items-center justify-center p-8 select-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-purple/10 border border-brand-purple/30 text-brand-purple-light mb-4 animate-bounce">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">Start Chatting with Rishav AI</h3>
                <p className="text-xs text-gray-400 text-center max-w-sm">
                  Send your first prompt in the input below. To ask questions from a document, attach it using the PDF panel.
                </p>
              </div>
            ) : (
              <div className="flex flex-col animate-message">
                {messages.map((message) => (
                  <ChatBubble key={message._id} message={message} />
                ))}
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={scrollRef} className="h-4" />
          </div>

          {/* Bottom Prompt Input Area */}
          <div className="border-t border-dark-border bg-dark-sidebar/45 backdrop-blur-md p-4 shrink-0">
            <form onSubmit={handleSend} className="max-w-3xl mx-auto relative select-none">
              
              {/* Autocomplete Suggestion Chips */}
              {inputText.trim().length > 3 && (
                <div className="flex flex-wrap gap-2 mb-3 px-1 animate-message">
                  {[
                    { label: 'Explain this 💡', text: '\n\nCan you explain this in detail line-by-line?' },
                    { label: 'Refactor Code 💻', text: '\n\nRefactor this code to be cleaner and more optimized.' },
                    { label: 'Add Comments 📝', text: '\n\nAdd clear, helpful comments to this code.' },
                    { label: 'Write Tests 🧪', text: '\n\nWrite comprehensive unit tests for this code.' }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setInputText(prev => prev + chip.text);
                      }}
                      className="text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-full bg-dark-surface hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Attached PDF/Word/Image/Audio Chips & Progress Indicators */}
              {((documents && documents.length > 0) || isUploading || uploadError) && (
                <div className="flex flex-wrap gap-2 mb-3 px-1 animate-message">
                  {documents.map((doc) => {
                    const { Icon, iconColor, bgColor, borderColor } = getFileIconAndColor(doc.originalName);
                    return (
                      <div
                        key={doc._id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-gray-300 text-xs font-semibold select-none shadow-sm ${bgColor} ${borderColor}`}
                      >
                        <Icon size={12} className={iconColor} />
                        <span className="max-w-[130px] truncate">{doc.originalName}</span>
                        <span className="text-[9px] text-gray-500">({Math.round(doc.textLength / 1000)}k chars)</span>
                      </div>
                    );
                  })}
                  
                  {isUploading && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-brand-purple-light text-xs font-semibold animate-pulse">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Processing file...</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs font-semibold animate-bounce">
                      <AlertCircle size={12} />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              )}

              <div className={`relative flex items-end w-full border rounded-2xl bg-dark-surface transition-all p-2 shadow-2xl ${
                isFocused 
                  ? 'border-brand-purple-light/60 shadow-[0_0_20px_rgba(156,21,141,0.2)] ring-1 ring-brand-purple-light/10' 
                  : 'border-dark-border'
              }`}>
                
                {/* Hidden input for multiple file formats */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePdfUpload}
                  accept=".pdf,.docx,.doc,.txt,.csv,.md,.html,.css,image/*,audio/*"
                  className="hidden"
                />

                {/* File uploader button */}
                <button
                  type="button"
                  onClick={handlePdfUploadClick}
                  disabled={isUploading}
                  className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-hover transition-all cursor-pointer ${
                    isUploading ? 'text-brand-purple-light bg-brand-purple/5' : ''
                  }`}
                  title="Upload Context File (PDF, DOCX, Image, Audio, Text)"
                >
                  <Paperclip size={18} />
                </button>

                {/* Text input area */}
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={isUploading ? "Uploading PDF, please wait..." : `Ask Rishav AI (${selectedModel})...`}
                  rows={1}
                  disabled={isUploading}
                  className="flex-1 max-h-36 min-h-[36px] bg-transparent text-sm md:text-base border-none outline-none text-white py-2 px-3 resize-none focus:ring-0 focus:outline-none placeholder:text-gray-600 rounded-lg disabled:opacity-50"
                  style={{ height: 'auto' }}
                />

                {/* Sound toggle button */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-hover transition-all cursor-pointer"
                  title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
                >
                  {soundEnabled ? <Volume2 size={18} className="text-brand-purple-light" /> : <VolumeX size={18} />}
                </button>

                {/* Magic Wand Prompt Enhancer */}
                {inputText.trim() && (
                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing}
                    className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-hover transition-all cursor-pointer ${
                      isEnhancing ? 'animate-pulse text-brand-purple-light' : ''
                    }`}
                    title="Enhance Prompt with AI 🪄"
                  >
                    {isEnhancing ? (
                      <Loader2 size={18} className="animate-spin text-brand-purple-light" />
                    ) : (
                      <Wand2 size={18} className="text-brand-purple-light hover:text-brand-purple-light" />
                    )}
                  </button>
                )}

                {/* Voice dictation button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-950 text-red-400 border border-red-500/40 animate-pulse'
                      : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak Prompt (Speech-to-Text)'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Send Prompt button */}
                <div className="relative">
                  {inputText.trim() && (
                    <span className="absolute inset-0 rounded-xl bg-brand-purple/40 animate-ping pointer-events-none" />
                  )}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="relative p-2 rounded-xl bg-brand-purple hover:bg-brand-purple-hover text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(116,9,104,0.3)] hover:scale-[1.05] active:scale-95 flex items-center justify-center"
                    title="Send Message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-center text-gray-500 mt-2">
                Shift + Enter for new lines. Responses generated using Google Gemini AI.
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Chat;

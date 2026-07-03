import React, { useState, useRef } from 'react';
import { FileText, UploadCloud, CheckCircle, AlertCircle, FilePlus, Loader2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const PDFUploader = () => {
  const { currentChat, uploadPdfFile, documents } = useChat();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setStatus({ type: 'error', message: 'Only PDF documents are supported.' });
        setFile(null);
      } else if (selectedFile.size > 10 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'PDF size exceeds 10MB limit.' });
        setFile(null);
      } else {
        setFile(selectedFile);
        setStatus({ type: '', message: '' });
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !currentChat) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const result = await uploadPdfFile(file);
      if (result && result.success) {
        setStatus({ type: 'success', message: `Indexed: ${result.filename}` });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setStatus({ 
          type: 'error', 
          message: result?.message || 'Failed to upload PDF. Ensure the file has readable text.' 
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'An unexpected error occurred during upload.' });
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop events
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        setStatus({ type: 'error', message: 'Only PDF documents are supported.' });
      } else if (droppedFile.size > 10 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'PDF size exceeds 10MB limit.' });
      } else {
        setFile(droppedFile);
        setStatus({ type: '', message: '' });
      }
    }
  };

  if (!currentChat) return null;

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-4 w-full space-y-4">
      <div className="flex items-center justify-between border-b border-dark-border/60 pb-2">
        <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
          <FileText size={16} className="text-brand-purple-light" />
          PDF Chat Context ({documents.length})
        </h3>
      </div>

      {/* Upload zone */}
      <form onSubmit={handleUpload} className="space-y-3">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-all select-none ${
            isDragOver
              ? 'border-brand-purple bg-brand-purple/5'
              : 'border-dark-border hover:border-gray-500 hover:bg-dark-hover/30'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          {loading ? (
            <Loader2 className="animate-spin text-brand-purple-light h-8 w-8 mb-2" />
          ) : (
            <UploadCloud className="text-gray-400 h-8 w-8 mb-2" />
          )}
          <span className="text-xs font-semibold text-gray-200">
            {file ? file.name : 'Click or Drag PDF here'}
          </span>
          <span className="text-[10px] text-gray-500 mt-1">PDF up to 10MB</span>
        </div>

        {/* Status Messages */}
        {status.message && (
          <div
            className={`flex items-center gap-2 text-xs rounded-lg p-2.5 ${
              status.type === 'success'
                ? 'bg-green-950/20 text-green-400 border border-green-500/20'
                : 'bg-red-950/20 text-red-400 border border-red-500/20'
            }`}
          >
            {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span className="truncate flex-1 font-medium">{status.message}</span>
          </div>
        )}

        {/* Action Button */}
        {file && (
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <FilePlus size={14} />
            {loading ? 'Processing Text...' : 'Index & Chat PDF'}
          </button>
        )}
      </form>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
            Active Documents:
          </span>
          <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between text-xs bg-dark-bg/60 border border-dark-border/50 rounded-lg p-2 text-gray-300"
              >
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <FileText size={13} className="text-red-400 shrink-0" />
                  <span className="truncate font-medium">{doc.originalName}</span>
                </div>
                <span className="text-[10px] text-gray-500 shrink-0">
                  {Math.round(doc.textLength / 1000)}k chars
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;

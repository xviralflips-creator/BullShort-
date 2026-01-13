import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Video, Loader2, X, Wand2 } from 'lucide-react';
import { GenerationType, GenerationConfig } from '../types';

interface PromptBarProps {
  onGenerate: (prompt: string, type: GenerationType, config: GenerationConfig, imageFile?: File) => void;
  isGenerating: boolean;
  statusMessage: string;
}

export const PromptBar: React.FC<PromptBarProps> = ({ onGenerate, isGenerating, statusMessage }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [mode, setMode] = useState<GenerationType>(GenerationType.TEXT_TO_VIDEO);
  const [aspectRatio, setAspectRatio] = useState<GenerationConfig['aspectRatio']>('16:9');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setMode(GenerationType.IMAGE_TO_VIDEO);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setMode(GenerationType.TEXT_TO_VIDEO);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !selectedFile) return;

    // Determine type
    let type = GenerationType.TEXT_TO_VIDEO;
    if (selectedFile) type = GenerationType.IMAGE_TO_VIDEO;
    else if (mode === GenerationType.TEXT_TO_IMAGE) type = GenerationType.TEXT_TO_IMAGE;

    onGenerate(prompt, type, { aspectRatio, resolution: '720p' }, selectedFile || undefined);
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-40">
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <form onSubmit={handleSubmit} className="relative bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
          
          {/* File Preview */}
          {filePreview && (
            <div className="relative mb-2 mx-2 mt-2 w-24 h-24 group/preview">
              <img src={filePreview} alt="Reference" className="w-full h-full object-cover rounded-lg border border-white/10" />
              <button
                type="button"
                onClick={clearFile}
                className="absolute -top-2 -right-2 bg-zinc-800 text-white p-1 rounded-full shadow-lg hover:bg-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Text Area */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={mode === GenerationType.IMAGE_TO_VIDEO ? "Describe how to animate this image..." : "Describe your imagination..."}
            className="w-full bg-transparent text-white placeholder-zinc-500 px-4 py-3 min-h-[60px] max-h-[200px] outline-none resize-none font-light text-lg"
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          {/* Controls Bar */}
          <div className="flex items-center justify-between px-2 pt-2 pb-1 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${selectedFile ? 'text-accent' : 'text-zinc-400'}`}
                title="Upload Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Aspect Ratio Selector */}
              <div className="h-6 w-[1px] bg-white/10 mx-1" />
              
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="bg-transparent text-xs text-zinc-400 hover:text-white outline-none cursor-pointer"
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
              </select>

              {/* Mode Toggle (if no file) */}
              {!selectedFile && (
                 <button
                 type="button"
                 onClick={() => setMode(mode === GenerationType.TEXT_TO_VIDEO ? GenerationType.TEXT_TO_IMAGE : GenerationType.TEXT_TO_VIDEO)}
                 className="text-xs text-zinc-400 flex items-center gap-1 hover:text-white ml-2 px-2 py-1 rounded bg-white/5"
               >
                 {mode === GenerationType.TEXT_TO_VIDEO ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                 {mode === GenerationType.TEXT_TO_VIDEO ? "Video Mode" : "Image Mode"}
               </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isGenerating || (!prompt && !selectedFile)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300
                ${isGenerating || (!prompt && !selectedFile)
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]'}
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{statusMessage || 'Processing'}</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Generate</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Disclaimer / Info */}
      <div className="text-center mt-4 text-xs text-zinc-600">
        Powered by Google Veo & Imagen 3. High quality generation may take 1-2 minutes.
      </div>
    </div>
  );
};

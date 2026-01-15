import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PromptBar } from './components/PromptBar';
import { VideoGallery } from './components/VideoGallery';
import { Generation, GenerationType, GenerationStatus, GenerationConfig } from './types';
import { enhancePrompt, generateImage, generateVideo, fileToBase64, checkAndPromptKey } from './services/geminiService';
import { Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generations, setGenerations] = useState<Generation[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hailuo_generations');
    if (saved) {
      try {
        setGenerations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved generations");
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (generations.length > 0) {
      localStorage.setItem('hailuo_generations', JSON.stringify(generations));
    }
  }, [generations]);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your generation history?")) {
      setGenerations([]);
      localStorage.removeItem('hailuo_generations');
    }
  };

  const handleGenerate = async (
    prompt: string, 
    type: GenerationType, 
    config: GenerationConfig, 
    imageFile?: File
  ) => {
    // For Veo models, we must ensure an API key is selected
    if (type !== GenerationType.TEXT_TO_IMAGE) {
      await checkAndPromptKey();
    }

    setIsGenerating(true);
    const newId = Date.now().toString();
    
    const newGen: Generation = {
      id: newId,
      type,
      prompt,
      status: GenerationStatus.ENHANCING,
      createdAt: Date.now(),
      config,
    };
    
    setGenerations(prev => [newGen, ...prev]);

    try {
      let finalPrompt = prompt;
      if (prompt) {
        setStatusMessage('Enhancing prompt with Gemini...');
        const enhanced = await enhancePrompt(prompt);
        finalPrompt = enhanced;
        
        setGenerations(prev => prev.map(g => 
            g.id === newId ? { ...g, enhancedPrompt: finalPrompt, status: GenerationStatus.PROCESSING } : g
        ));
      }

      let mediaUrl = '';
      if (type === GenerationType.TEXT_TO_IMAGE) {
        setStatusMessage('Generating image with Imagen 3...');
        mediaUrl = await generateImage(finalPrompt, config);
      } else {
        let imageBase64;
        let imageMime;
        
        if (imageFile) {
            const fullBase64 = await fileToBase64(imageFile);
            const matches = fullBase64.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                imageMime = matches[1];
                imageBase64 = matches[2];
            }
        }

        setStatusMessage('Starting video generation (usually 60-90s)...');
        mediaUrl = await generateVideo(finalPrompt, config, imageBase64, imageMime);
      }

      setGenerations(prev => prev.map(g => 
        g.id === newId ? { ...g, status: GenerationStatus.COMPLETED, mediaUrl } : g
      ));

    } catch (error: any) {
      console.error("Generation failed:", error);
      setGenerations(prev => prev.map(g => 
        g.id === newId ? { ...g, status: GenerationStatus.FAILED } : g
      ));
      alert(`Generation failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans selection:bg-primary/30">
      <Navbar />
      
      <main className="relative pt-32 pb-10 min-h-screen flex flex-col gap-12">
        <Hero />
        
        <div className="px-4 text-center z-10 space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            Dream. Visualize. <br /> Create.
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Generate cinematic videos and high-fidelity images with the power of Google Veo & Imagen 3.
          </p>
        </div>

        <PromptBar 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          statusMessage={statusMessage} 
        />

        <div className="z-10 mt-10">
          <div className="max-w-7xl mx-auto px-4 mb-6 flex items-center justify-between">
             <div className="flex items-center gap-4 flex-1">
                <h2 className="text-2xl font-display font-bold text-white whitespace-nowrap">Latest Creations</h2>
                <div className="h-[1px] flex-1 bg-white/10"></div>
             </div>
             {generations.length > 0 && (
               <button 
                onClick={clearHistory}
                className="ml-4 text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-2 text-sm"
               >
                 <Trash2 className="w-4 h-4" />
                 Clear All
               </button>
             )}
          </div>
          <VideoGallery generations={generations} />
        </div>
      </main>
    </div>
  );
};

export default App;

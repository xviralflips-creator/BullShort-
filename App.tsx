import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PromptBar } from './components/PromptBar';
import { VideoGallery } from './components/VideoGallery';
import { Generation, GenerationType, GenerationStatus, GenerationConfig } from './types';
import { enhancePrompt, generateImage, generateVideo, fileToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generations, setGenerations] = useState<Generation[]>([]);

  // Load "mock" history on mount
  useEffect(() => {
    // In a real app, this fetches from Firestore
    // Here we can initialize with empty or some fake data if desired
  }, []);

  const handleGenerate = async (
    prompt: string, 
    type: GenerationType, 
    config: GenerationConfig, 
    imageFile?: File
  ) => {
    setIsGenerating(true);
    const newId = Date.now().toString();
    
    // Optimistic UI update
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
      // 1. Enhance Prompt (only if text is present)
      let finalPrompt = prompt;
      if (prompt) {
        setStatusMessage('Enhancing prompt with Gemini...');
        const enhanced = await enhancePrompt(prompt);
        finalPrompt = enhanced;
        
        // Update local state with enhanced prompt
        setGenerations(prev => prev.map(g => 
            g.id === newId ? { ...g, enhancedPrompt: finalPrompt, status: GenerationStatus.PROCESSING } : g
        ));
      }

      setStatusMessage('Generating content...');
      let mediaUrl = '';

      if (type === GenerationType.TEXT_TO_IMAGE) {
        mediaUrl = await generateImage(finalPrompt, config);
      } else if (type === GenerationType.TEXT_TO_VIDEO || type === GenerationType.IMAGE_TO_VIDEO) {
        
        let imageBase64;
        let imageMime;
        
        if (imageFile) {
            // Strip data:image/xyz;base64, prefix for the API
            const fullBase64 = await fileToBase64(imageFile);
            const matches = fullBase64.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                imageMime = matches[1];
                imageBase64 = matches[2];
            } else {
                throw new Error("Invalid image file processing");
            }
        }

        setStatusMessage('Starting video generation (this takes ~1 min)...');
        mediaUrl = await generateVideo(finalPrompt, config, imageBase64, imageMime);
      }

      // 2. Success Update
      setGenerations(prev => prev.map(g => 
        g.id === newId ? { ...g, status: GenerationStatus.COMPLETED, mediaUrl } : g
      ));

    } catch (error) {
      console.error("Generation failed:", error);
      setGenerations(prev => prev.map(g => 
        g.id === newId ? { ...g, status: GenerationStatus.FAILED } : g
      ));
      alert(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
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
          <div className="max-w-7xl mx-auto px-4 mb-6 flex items-center gap-4">
             <h2 className="text-2xl font-display font-bold text-white">Latest Creations</h2>
             <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>
          <VideoGallery generations={generations} />
        </div>
      </main>
    </div>
  );
};

export default App;

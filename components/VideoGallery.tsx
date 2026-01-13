import React, { useRef, useState } from 'react';
import { Generation, GenerationStatus, GenerationType } from '../types';
import { Play, Download, Share2, Maximize2 } from 'lucide-react';

interface GalleryProps {
  generations: Generation[];
}

const GenerationCard: React.FC<{ item: Generation }> = ({ item }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && item.type !== GenerationType.TEXT_TO_IMAGE) {
      videoRef.current.play().catch(() => {}); // Auto-play might be blocked
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current && item.type !== GenerationType.TEXT_TO_IMAGE) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const isVideo = item.type === GenerationType.TEXT_TO_VIDEO || item.type === GenerationType.IMAGE_TO_VIDEO;

  return (
    <div 
      className="relative group rounded-xl overflow-hidden bg-zinc-900 border border-white/5 break-inside-avoid mb-4 shadow-lg transition-transform hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`aspect-[${item.config.aspectRatio === '16:9' ? '16/9' : '9/16'}] relative bg-zinc-800`}>
        {item.status === GenerationStatus.COMPLETED ? (
          isVideo ? (
            <video
              ref={videoRef}
              src={item.mediaUrl}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              poster={item.thumbnailUrl} // In real app, generate thumb
            />
          ) : (
            <img src={item.mediaUrl} alt={item.prompt} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
             <div className="relative w-12 h-12">
               <div className="absolute inset-0 border-2 border-zinc-700 rounded-full"></div>
               <div className="absolute inset-0 border-2 border-primary rounded-full border-t-transparent animate-spin"></div>
             </div>
             <span className="text-xs uppercase tracking-widest animate-pulse">Processing</span>
          </div>
        )}

        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4`}>
          <p className="text-white text-sm line-clamp-2 font-light mb-3">{item.prompt}</p>
          
          <div className="flex items-center gap-2">
            {item.mediaUrl && (
                <a href={item.mediaUrl} download target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-colors">
                    <Download className="w-4 h-4" />
                </a>
            )}
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="ml-auto p-2 bg-primary hover:bg-primary/80 rounded-full text-white transition-colors">
              {isVideo ? <Play className="w-4 h-4 fill-current" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoGallery: React.FC<GalleryProps> = ({ generations }) => {
  if (generations.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p className="text-lg">No generations yet.</p>
        <p className="text-sm">Start by typing a prompt above.</p>
      </div>
    );
  }

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 px-4 max-w-7xl mx-auto pb-20">
      {generations.map((gen) => (
        <GenerationCard key={gen.id} item={gen} />
      ))}
    </div>
  );
};

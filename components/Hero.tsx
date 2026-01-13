import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background z-10" />
      
      {/* Abstract Background Elements */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 opacity-20 scale-110">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-video bg-zinc-800 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
             {/* Placeholder for where a real background video loop would go */}
          </div>
        ))}
      </div>
    </div>
  );
};

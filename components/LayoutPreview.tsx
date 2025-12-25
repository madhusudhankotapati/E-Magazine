
import React from 'react';
import { LayoutData } from '../types';

interface Props {
  layout: LayoutData;
}

const LayoutPreview: React.FC<Props> = ({ layout }) => {
  const images = layout.media.filter(m => m.type === 'image');
  const videos = layout.media.filter(m => m.type === 'video');
  const audio = layout.media.filter(m => m.type === 'audio');

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
      {/* Hero Section */}
      <div 
        className="relative min-h-[450px] flex items-center justify-center p-12 overflow-hidden"
        style={{ backgroundColor: `${layout.themeColor}10` }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          {images.length > 0 && (
            <img src={images[0].url} alt="bg" className="w-full h-full object-cover blur-[2px]" />
          )}
        </div>
        
        <div className="relative z-10 text-center max-w-2xl animate-in fade-in zoom-in duration-700">
          <h1 
            className="text-5xl font-extrabold mb-6 tracking-tight leading-tight"
            style={{ color: layout.themeColor || '#1e293b' }}
          >
            {layout.title || 'Your Vision, Realized'}
          </h1>
          <p className="text-xl text-slate-700 leading-relaxed font-medium">
            {layout.description || 'Describe your idea and let AI generate the perfect content for you.'}
          </p>
        </div>
      </div>

      {/* Structured Content Sections */}
      {layout.sections && layout.sections.length > 0 && (
        <div className="px-12 py-16 space-y-16">
          {layout.sections.map((section, idx) => (
            <div key={section.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4">
                <h2 
                  className="text-2xl font-bold border-l-4 pl-4"
                  style={{ borderColor: layout.themeColor }}
                >
                  {section.heading}
                </h2>
              </div>
              <div className="md:col-span-8">
                <p className="text-lg text-slate-600 leading-relaxed">
                  {section.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Grid */}
      <div className="p-8 space-y-12">
        {images.length > 1 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 px-4">Gallery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.slice(1).map((img, i) => (
                <div key={img.id} className="group relative overflow-hidden rounded-2xl aspect-square bg-slate-100 shadow-sm">
                  <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={img.name} />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 px-4">Visual Media</h3>
            <div className="grid grid-cols-1 gap-8">
              {videos.map(vid => (
                <div key={vid.id} className="relative aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl">
                  <video src={vid.url} controls className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {audio.length > 0 && (
          <section className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Soundscape</h3>
            <div className="space-y-4">
              {audio.map(aud => (
                <div key={aud.id} className="flex items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: layout.themeColor }}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8v4l4-2-4-2z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 mb-2">{aud.name}</p>
                    <audio src={aud.url} controls className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="p-12 border-t border-slate-100 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-4">
          Generated via LuminaLayout AI
        </div>
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} LuminaLayout. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LayoutPreview;

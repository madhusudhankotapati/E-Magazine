
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LayoutData, MediaItem, MediaType, ContentSection } from './types';
import { PlusIcon, TrashIcon, SparklesIcon, ImageIcon, VideoIcon, AudioIcon } from './components/Icons';
import LayoutPreview from './components/LayoutPreview';
import { refineLayoutContent, generateImageFromDescription } from './services/geminiService';

const App: React.FC = () => {
  const [layouts, setLayouts] = useState<LayoutData[]>([]);
  const [activeLayout, setActiveLayout] = useState<LayoutData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiStatus, setAIStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentMediaType, setCurrentMediaType] = useState<MediaType>('image');

  // New Layout Initialization
  const createNewLayout = () => {
    const newLayout: LayoutData = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      sections: [],
      media: [],
      themeColor: '#6366f1',
      createdAt: Date.now(),
    };
    setActiveLayout(newLayout);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (activeLayout) {
      setLayouts(prev => {
        const index = prev.findIndex(l => l.id === activeLayout.id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = activeLayout;
          return updated;
        }
        return [activeLayout, ...prev];
      });
      setIsEditing(false);
      setActiveLayout(null);
    }
  };

  const handleAIImprove = async () => {
    if (!activeLayout?.title && !activeLayout?.description) return;
    setIsAILoading(true);
    setAIStatus('Refining narrative...');
    
    try {
      // Step 1: Generate Text Content
      const result = await refineLayoutContent(activeLayout.title, activeLayout.description);
      
      const newSections: ContentSection[] = result.sections.map(s => ({
        id: Math.random().toString(36).substr(2, 9),
        heading: s.heading,
        body: s.body
      }));

      // Update state with text first for immediate feedback
      setActiveLayout(prev => prev ? ({
        ...prev,
        title: result.refinedTitle,
        description: result.refinedDescription,
        themeColor: result.suggestedTheme,
        sections: newSections
      }) : null);

      // Step 2: Automatically generate the "perfect" image
      setAIStatus('Painting visual assets...');
      const imgUrl = await generateImageFromDescription(result.refinedDescription, result.refinedTitle);
      
      if (imgUrl) {
        const newMedia: MediaItem = {
          id: 'ai-hero-' + Date.now(),
          type: 'image',
          url: imgUrl,
          name: `AI Hero: ${result.refinedTitle}`
        };
        setActiveLayout(prev => prev ? ({ 
          ...prev, 
          // Prepend the new hero image
          media: [newMedia, ...prev.media.filter(m => !m.id.startsWith('ai-hero-'))] 
        }) : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAILoading(false);
      setAIStatus('');
    }
  };

  const handleAIGenImage = async () => {
    if (!activeLayout?.description) return;
    setIsAILoading(true);
    setAIStatus('Generating custom visual...');
    try {
      const imgUrl = await generateImageFromDescription(activeLayout.description, activeLayout.title);
      if (imgUrl) {
        const newMedia: MediaItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          url: imgUrl,
          name: `AI Generated Media`
        };
        setActiveLayout(prev => prev ? ({ ...prev, media: [...prev.media, newMedia] }) : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAILoading(false);
      setAIStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newMedia: MediaItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: currentMediaType,
          url,
          name: file.name
        };
        setActiveLayout(prev => prev ? ({ ...prev, media: [...prev.media, newMedia] }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = (id: string) => {
    setActiveLayout(prev => prev ? ({ ...prev, media: prev.media.filter(m => m.id !== id) }) : null);
  };

  const removeSection = (id: string) => {
    setActiveLayout(prev => prev ? ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }) : null);
  };

  const deleteLayout = (id: string) => {
    setLayouts(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafc]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200 py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">L</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">E-magazine <span className="text-indigo-600">AI</span></h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Campus Layout Suite</p>
            </div>
          </div>
          <button 
            onClick={createNewLayout}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 transform active:scale-95"
          >
            <PlusIcon /> New Project
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {isEditing && activeLayout ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Editor Panel */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
              <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-slate-900">Project Canvas</h2>
                  <button 
                    onClick={handleAIImprove}
                    disabled={isAILoading || (!activeLayout.title && !activeLayout.description)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    <SparklesIcon /> 
                    <span>Magic Generate</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-500 transition-colors">Core Title</label>
                    <input 
                      type="text"
                      value={activeLayout.title}
                      onChange={(e) => setActiveLayout({ ...activeLayout, title: e.target.value })}
                      placeholder="e.g., The Future of Sustainable Tech"
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all text-xl font-bold text-slate-800 placeholder:text-slate-300 bg-slate-50/50"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-500 transition-colors">Brief Description</label>
                    <textarea 
                      rows={3}
                      value={activeLayout.description}
                      onChange={(e) => setActiveLayout({ ...activeLayout, description: e.target.value })}
                      placeholder="Provide a starting point for the AI to expand upon..."
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all resize-none text-slate-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                {activeLayout.sections.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">AI Generated Content</h3>
                    <div className="space-y-3">
                      {activeLayout.sections.map(section => (
                        <div key={section.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                          <h4 className="font-bold text-slate-800 mb-1">{section.heading}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2">{section.body}</p>
                          <button 
                            onClick={() => removeSection(section.id)}
                            className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Visual & Audio Assets</h3>
                    <button 
                      onClick={handleAIGenImage}
                      disabled={isAILoading || !activeLayout.description}
                      className="text-[10px] font-bold bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      <SparklesIcon /> Add AI Image
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {(['image', 'video', 'audio'] as MediaType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setCurrentMediaType(type);
                          fileInputRef.current?.click();
                        }}
                        className="flex flex-col items-center gap-2 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all group"
                      >
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-indigo-100 transition-all">
                          {type === 'image' && <ImageIcon />}
                          {type === 'video' && <VideoIcon />}
                          {type === 'audio' && <AudioIcon />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                      </button>
                    ))}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept={currentMediaType === 'image' ? 'image/*' : currentMediaType === 'video' ? 'video/*' : 'audio/*'}
                    />
                  </div>

                  {activeLayout.media.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-6">
                      {activeLayout.media.map(item => (
                        <div key={item.id} className="relative aspect-square group rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                          {item.type === 'image' && <img src={item.url} className="w-full h-full object-cover" alt="" />}
                          {item.type === 'video' && <div className="w-full h-full flex items-center justify-center text-slate-400"><VideoIcon /></div>}
                          {item.type === 'audio' && <div className="w-full h-full flex items-center justify-center text-slate-400"><AudioIcon /></div>}
                          <button 
                            onClick={() => removeMedia(item.id)}
                            className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                  >
                    Finalize Layout
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setActiveLayout(null); }}
                    className="px-8 py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                  >
                    Discard
                  </button>
                </div>
              </div>

              {isAILoading && (
                <div className="bg-slate-900 text-white p-6 rounded-[2rem] animate-pulse flex items-center gap-4 shadow-2xl transition-all">
                  <div className="w-6 h-6 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-widest">{aiStatus || 'Processing...'}</p>
                    <p className="text-xs text-slate-400 font-medium">LuminaLayout is dreaming up your content...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div className="lg:sticky lg:top-24 h-fit animate-in fade-in slide-in-from-right duration-700">
               <div className="text-[10px] font-black text-slate-400 mb-4 flex items-center gap-2 tracking-[0.2em]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                VIRTUAL STAGING
              </div>
              <LayoutPreview layout={activeLayout} />
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-700">
            <div className="flex flex-col items-center text-center py-16 max-w-3xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest border border-indigo-100 shadow-sm">
                <SparklesIcon /> Powered by Gemini 3 Flash
              </div>
              <h2 className="text-6xl font-black tracking-tighter text-slate-900 leading-[1.1]">Build beautiful layouts <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">at the speed of thought.</span></h2>
              <p className="text-slate-500 text-xl font-medium leading-relaxed">Simply provide a title and a basic idea. Our AI will automatically generate structured content, suggest themes, and create visual assets for you.</p>
              
              <button 
                onClick={createNewLayout}
                className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-xl hover:bg-indigo-600 transition-all shadow-2xl hover:shadow-indigo-200 transform hover:-translate-y-1"
              >
                Start Creating Free
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {layouts.map(layout => (
                <div key={layout.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-100 flex flex-col h-[480px]">
                  <div className="h-48 bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
                     {layout.media.find(m => m.type === 'image') ? (
                       <img src={layout.media.find(m => m.type === 'image')?.url} className="w-full h-full object-cover rounded-2xl shadow-inner transition-transform duration-700 group-hover:scale-110" alt="" />
                     ) : (
                       <div className="text-indigo-600/5 font-black text-7xl select-none">LAYOUT</div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="absolute top-4 right-4 flex gap-2">
                       <button 
                        onClick={(e) => { e.stopPropagation(); setActiveLayout(layout); setIsEditing(true); }}
                        className="bg-white p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 shadow-lg transition-all transform hover:scale-110"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                       </button>
                       <button 
                        onClick={(e) => { e.stopPropagation(); deleteLayout(layout.id); }}
                        className="bg-white p-2.5 rounded-xl text-slate-600 hover:text-red-600 shadow-lg transition-all transform hover:scale-110"
                       >
                         <TrashIcon />
                       </button>
                     </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layout.themeColor }} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Creative Suite</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-3 line-clamp-2 leading-tight">{layout.title || 'Untitled Project'}</h3>
                      <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed font-medium">{layout.description || 'Drafting phase...'}</p>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-6">
                      <div className="flex -space-x-2">
                        {layout.media.slice(0, 4).map(m => (
                          <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm overflow-hidden">
                            {m.type === 'image' ? <img src={m.url} className="w-full h-full object-cover" /> : <div className="text-[8px] font-bold">{m.type[0].toUpperCase()}</div>}
                          </div>
                        ))}
                        {layout.media.length > 4 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black shadow-lg">
                            +{layout.media.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Modified</span>
                        <span className="text-xs font-bold text-slate-900">{new Date(layout.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={createNewLayout}
                className="group border-4 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 transition-all h-[480px]"
              >
                <div className="w-20 h-20 bg-slate-100 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white rounded-3xl flex items-center justify-center transition-all transform group-hover:rotate-12 group-hover:scale-110 shadow-sm">
                  <PlusIcon />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-700 group-hover:text-indigo-900 mb-2">New Creation</h3>
                  <p className="text-sm text-slate-400 font-medium">Start fresh with AI assistance</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black">L</div>
             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">LuminaLayout AI Engine</p>
          </div>
          <nav className="flex gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Templates</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default App;

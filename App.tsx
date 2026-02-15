
import React, { useState, useEffect, useRef } from 'react';
import { AppTab, GenerationSettings, HistoryItem, PERSONA_PRESETS, STYLE_PRESETS, LIGHTING_PRESETS, CAMERA_PRESETS } from './types';
import { GeminiService } from './services/gemini';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CREATE);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Initializing AI...');
  const [history, setHistory] = useState<HistoryItem[]>(StorageService.getHistory());
  const [showSplash, setShowSplash] = useState(true);
  
  // Settings
  const [settings, setSettings] = useState<GenerationSettings>({
    quality: 'HD',
    aspectRatio: '1:1',
    negativePrompt: '',
    strength: 50,
    lighting: 'Cinematic',
    camera: 'Portrait lens',
    faceEnhancement: true
  });

  // Transformation Tab State
  const [uploadImage, setUploadImage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnhancePrompt = async () => {
    if (!prompt) return;
    setLoading(true);
    setLoadingMsg('AI is reimagining your prompt...');
    try {
      const enhanced = await GeminiService.enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (activeTab === AppTab.CREATE && !prompt) return;
    if ((activeTab === AppTab.TRANSFORM || activeTab === AppTab.PERSONA) && !uploadImage) {
        alert("Please upload an image first.");
        return;
    }

    setLoading(true);
    setLoadingMsg('Generating Masterpiece...');
    try {
      let resultUrl = '';
      if (activeTab === AppTab.CREATE) {
        resultUrl = await GeminiService.generateImage(prompt, settings);
      } else if (activeTab === AppTab.TRANSFORM) {
        resultUrl = await GeminiService.transformImage(uploadImage!, prompt, settings);
      } else if (activeTab === AppTab.PERSONA) {
        resultUrl = await GeminiService.personaTransform(uploadImage!, prompt, settings);
      } else if (activeTab === AppTab.EXPAND) {
        resultUrl = await GeminiService.transformImage(uploadImage!, "expand the canvas and fill the edges seamlessly", settings);
      }

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        url: resultUrl,
        prompt: prompt,
        settings: { ...settings },
        timestamp: Date.now(),
        type: activeTab
      };

      StorageService.saveItem(newItem);
      setHistory(StorageService.getHistory());
      setImage(resultUrl);
    } catch (err) {
      console.error(err);
      alert('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `harzo-gen-${Date.now()}.png`;
    link.click();
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#030712] flex flex-col items-center justify-center z-50">
        <div className="relative">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-indigo-500/50 animate-float">
            <i className="fa-solid fa-wand-magic-sparkles text-white text-4xl -rotate-12"></i>
          </div>
        </div>
        <h1 className="mt-8 text-4xl font-sora font-extrabold text-white tracking-tight">Harzo Gen</h1>
        <p className="mt-2 text-indigo-400 font-medium">Premium AI Studio</p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#030712]/80 backdrop-blur-md py-4 z-40">
        <div>
          <h1 className="text-2xl font-sora font-bold text-white">Harzo Gen</h1>
          <p className="text-xs text-indigo-400/80">Premium Android Experience</p>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-white">
            <i className="fa-solid fa-moon"></i>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="space-y-6">
        {/* Navigation Tabs (Top pill for mobile) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {Object.values(AppTab).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setImage(null); }}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Specific Content */}
        {activeTab === AppTab.CREATE && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="glass rounded-3xl p-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like to create?"
                className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 text-lg min-h-[120px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleEnhancePrompt}
                  disabled={loading || !prompt}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/20 active:scale-95 transition-transform"
                >
                  <i className="fa-solid fa-sparkles"></i>
                  ENHANCE PROMPT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-3">
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Aspect Ratio</label>
                <select 
                  value={settings.aspectRatio}
                  onChange={(e) => setSettings({...settings, aspectRatio: e.target.value as any})}
                  className="bg-transparent text-white w-full text-sm focus:outline-none"
                >
                  <option className="bg-gray-900" value="1:1">1:1 Square</option>
                  <option className="bg-gray-900" value="4:5">4:5 Portrait</option>
                  <option className="bg-gray-900" value="16:9">16:9 Landscape</option>
                  <option className="bg-gray-900" value="9:16">9:16 Mobile</option>
                </select>
              </div>
              <div className="glass rounded-2xl p-3">
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Quality</label>
                <select 
                  value={settings.quality}
                  onChange={(e) => setSettings({...settings, quality: e.target.value as any})}
                  className="bg-transparent text-white w-full text-sm focus:outline-none"
                >
                  <option className="bg-gray-900" value="Standard">Standard</option>
                  <option className="bg-gray-900" value="HD">HD</option>
                  <option className="bg-gray-900" value="Ultra HD">Ultra HD (Pro)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {(activeTab === AppTab.TRANSFORM || activeTab === AppTab.PERSONA || activeTab === AppTab.EXPAND) && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div 
              className="glass rounded-3xl h-64 border-2 border-dashed border-indigo-500/30 flex flex-col items-center justify-center relative overflow-hidden group"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {uploadImage ? (
                <>
                  <img src={uploadImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <p className="text-white text-sm font-bold">Change Image</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                    <i className="fa-solid fa-cloud-arrow-up text-indigo-500 text-2xl"></i>
                  </div>
                  <p className="text-gray-400 font-medium">Upload Image</p>
                  <p className="text-gray-600 text-xs mt-1">Tap to browse files</p>
                </>
              )}
              <input 
                id="file-upload"
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>

            {activeTab === AppTab.PERSONA && (
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-400">Select Transformation Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {PERSONA_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPrompt(p.prompt)}
                      className={`glass p-3 rounded-2xl flex flex-col items-center gap-2 border ${prompt === p.prompt ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent'}`}
                    >
                      <i className={`fa-solid ${p.icon} text-indigo-400 text-lg`}></i>
                      <span className="text-[10px] font-bold text-center">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab !== AppTab.EXPAND && (
              <div className="glass rounded-3xl p-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={activeTab === AppTab.PERSONA ? "How should you be reimagined?" : "Transformation instructions..."}
                  className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 text-base min-h-[100px] resize-none"
                />
              </div>
            )}

            <div className="glass rounded-3xl p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-400">Transformation Strength</span>
                <span className="text-indigo-400 font-bold">{settings.strength}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={settings.strength}
                onChange={(e) => setSettings({...settings, strength: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        )}

        {activeTab === AppTab.HISTORY && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="relative group rounded-2xl overflow-hidden glass aspect-square">
                  <img src={item.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-[10px] text-white line-clamp-2 font-medium mb-2">{item.prompt}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => downloadImage(item.url)}
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md"
                      >
                        <i className="fa-solid fa-download text-xs text-white"></i>
                      </button>
                      <button 
                        onClick={() => StorageService.deleteItem(item.id)}
                        className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center backdrop-blur-md"
                      >
                        <i className="fa-solid fa-trash text-xs text-white"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-20 opacity-30">
                <i className="fa-solid fa-clock-rotate-left text-4xl mb-4"></i>
                <p className="font-bold">No History Yet</p>
              </div>
            )}
            {history.length > 0 && (
              <button 
                onClick={() => { StorageService.clearAll(); setHistory([]); }}
                className="col-span-2 mt-4 text-xs font-bold text-red-400 uppercase tracking-widest py-4 bg-red-400/5 rounded-2xl border border-red-400/10"
              >
                Clear All History
              </button>
            )}
          </div>
        )}

        {/* Generated Result View */}
        {image && !loading && (
          <div className="mt-8 space-y-4 animate-in zoom-in-95 duration-500">
            <div className="glass rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/10">
              <img src={image} className="w-full h-auto" />
              <div className="p-4 flex gap-3">
                <button 
                  onClick={() => downloadImage(image)}
                  className="flex-1 bg-white text-black py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <i className="fa-solid fa-download"></i>
                  SAVE TO GALLERY
                </button>
                <button 
                  onClick={() => setImage(null)}
                  className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                  <i className="fa-solid fa-rotate-left"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-[#030712]/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center px-10 text-center">
             <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-4 bg-indigo-500 rounded-full animate-pulse flex items-center justify-center">
                  <i className="fa-solid fa-sparkles text-white text-xl"></i>
                </div>
             </div>
             <h2 className="text-2xl font-sora font-bold text-white mb-2">{loadingMsg}</h2>
             <p className="text-gray-400 text-sm">Please wait while our AI models process your request.</p>
             <div className="mt-10 w-full max-w-[200px] h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite]"></div>
             </div>
             <style>{`
                @keyframes loading {
                  0% { transform: translateX(-100%); }
                  50% { transform: translateX(0%); }
                  100% { transform: translateX(100%); }
                }
             `}</style>
          </div>
        )}

        {/* Advanced Expert Panel (Collapsible) */}
        {activeTab !== AppTab.HISTORY && (
          <div className="mt-8">
            <details className="group">
              <summary className="list-none flex items-center justify-between glass p-4 rounded-2xl cursor-pointer group-open:rounded-b-none">
                <span className="text-sm font-bold text-gray-300 flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-indigo-400"></i>
                  EXPERT CONTROLS
                </span>
                <i className="fa-solid fa-chevron-down text-xs transition-transform group-open:rotate-180"></i>
              </summary>
              <div className="glass p-4 rounded-b-2xl border-t border-white/10 space-y-4">
                <div>
                   <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Cinematic Lighting</label>
                   <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                     {LIGHTING_PRESETS.map(l => (
                       <button 
                        key={l}
                        onClick={() => setSettings({...settings, lighting: l})}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-colors ${settings.lighting === l ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                       >
                         {l}
                       </button>
                     ))}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Camera Lens</label>
                   <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                     {CAMERA_PRESETS.map(c => (
                       <button 
                        key={c}
                        onClick={() => setSettings({...settings, camera: c})}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-colors ${settings.camera === c ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                       >
                         {c}
                       </button>
                     ))}
                   </div>
                </div>
                <div className="pt-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Negative Prompt (AI Exclusions)</label>
                  <input 
                    type="text"
                    value={settings.negativePrompt}
                    onChange={(e) => setSettings({...settings, negativePrompt: e.target.value})}
                    placeholder="low quality, blurry, distorted limbs..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 flex justify-center z-50">
        <div className="w-full max-w-sm glass rounded-[32px] p-2 flex items-center justify-between relative shadow-2xl shadow-black">
          <button onClick={() => setActiveTab(AppTab.CREATE)} className={`flex-1 py-3 flex flex-col items-center gap-1 ${activeTab === AppTab.CREATE ? 'text-indigo-400' : 'text-gray-500'}`}>
            <i className={`fa-solid fa-plus-circle text-xl`}></i>
            <span className="text-[8px] font-bold uppercase">Create</span>
          </button>
          <button onClick={() => setActiveTab(AppTab.TRANSFORM)} className={`flex-1 py-3 flex flex-col items-center gap-1 ${activeTab === AppTab.TRANSFORM ? 'text-indigo-400' : 'text-gray-500'}`}>
            <i className="fa-solid fa-wand-magic text-xl"></i>
            <span className="text-[8px] font-bold uppercase">Trans</span>
          </button>
          
          {/* Main Generate FAB */}
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center -mt-12 shadow-xl shadow-indigo-600/50 active:scale-90 transition-transform relative z-10"
          >
            <i className="fa-solid fa-play text-white text-2xl ml-1"></i>
          </button>

          <button onClick={() => setActiveTab(AppTab.PERSONA)} className={`flex-1 py-3 flex flex-col items-center gap-1 ${activeTab === AppTab.PERSONA ? 'text-indigo-400' : 'text-gray-500'}`}>
            <i className="fa-solid fa-dna text-xl"></i>
            <span className="text-[8px] font-bold uppercase">Persona</span>
          </button>
          <button onClick={() => setActiveTab(AppTab.HISTORY)} className={`flex-1 py-3 flex flex-col items-center gap-1 ${activeTab === AppTab.HISTORY ? 'text-indigo-400' : 'text-gray-500'}`}>
            <i className="fa-solid fa-clock-rotate-left text-xl"></i>
            <span className="text-[8px] font-bold uppercase">History</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

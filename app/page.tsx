'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [step, setStep] = useState<'welcome' | 'preferences' | 'upload' | 'results'>('welcome');
  const [userTrack, setUserTrack] = useState<'Beginner' | 'Experienced'>('Beginner');
  const [preferences, setPreferences] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);
          
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], "compressed_menu.jpg", { type: 'image/jpeg' }));
            } else {
              resolve(file); 
            }
          }, 'image/jpeg', 0.8);
        };
        img.onerror = () => reject(new Error('Failed to load image for compression.'));
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPG, PNG, or WEBP).');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File is too large. Please select an image under 10MB.');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const compressedFile = await compressImage(selectedFile);
      const base64Image = await fileToBase64(compressedFile);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          track: userTrack,
          preferences: preferences
        }),
        signal: abortController.signal
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Received an invalid response from the server.');
      }

      if (!response.ok) throw new Error(data.error || 'Failed to analyze the menu.');

      setChatMessages([{ role: 'mari', content: data.analysis }]);
      setStep('results');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return; 
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    
    const newChatHistory = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newChatHistory);
    setLoading(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: userTrack,
          chatHistory: newChatHistory 
        }),
        signal: abortController.signal
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Received an invalid response from the server.');
      }

      if (!response.ok) throw new Error(data.error || 'Failed to get a response.');

      setChatMessages(prev => [...prev, { role: 'mari', content: data.analysis }]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setChatMessages(prev => [...prev, { role: 'mari', content: 'Sorry, I had trouble processing that. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const restartIntake = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort(); 
    setStep('welcome');
    setPreferences('');
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl); 
    setPreviewUrl(null);
    setChatMessages([]);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <header className="flex justify-center items-center py-6 border-b border-gray-200 mb-10 bg-white shadow-sm">
        <button onClick={restartIntake} aria-label="Restart Intake" className="flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-transparent border-none outline-none">
          <div className="w-10 h-10 text-[#075A75]">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M50 10C50 10 85 20 85 50C85 65 80 80 50 90C20 80 15 65 15 50C15 20 50 10 50 10Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M35 50C35 50 42 40 50 45C58 50 65 40 65 50C65 57 60 63 50 63C40 63 35 57 35 50Z" fill="currentColor"/>
              <path d="M50 25V35" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              <path d="M45 30H55" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-extrabold text-[#075A75] leading-none">Mari</h1>
            <span className="text-sm text-gray-600 font-medium tracking-wide mt-1">the Concierge</span>
          </div>
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        {step === 'welcome' && (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-10 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Welcome. I'm Mari.</h2>
              <p className="text-gray-600 font-medium text-lg">Your personal AI cannabis concierge.</p>
            </div>

            <div className="text-gray-700 space-y-6">
              <p className="leading-relaxed">
                Navigating a dispensary menu can feel like a guessing game, whether it's your first time or your fiftieth. I'm here to take the guesswork out of finding the perfect product. You tell me how you want to feel, and I'll do the heavy lifting to find exactly what you need.
              </p>
              
              <div className="space-y-4">
                <p className="font-bold text-gray-900 text-lg">Here is what you can expect:</p>
                <ol className="list-decimal pl-5 space-y-4 marker:text-[#075A75] marker:font-bold">
                  <li className="pl-2">
                    <strong className="text-gray-900">Share your goals:</strong> Tell me what kind of relief, vibe, or feeling you're looking for in your own words.
                  </li>
                  <li className="pl-2">
                    <strong className="text-gray-900">Drop a menu:</strong> Upload a screenshot or photo of any local dispensary menu. The more details, the better—menus showing full lab results or terpene profiles will give you the most accurate matches.
                  </li>
                  <li className="pl-2">
                    <strong className="text-gray-900">Get your matches:</strong> I’ll instantly read the menu, rank the top 3 best options for you, and explain exactly why their specific effects and terpenes match your goals.
                  </li>
                </ol>
              </div>

              <p className="pt-4 font-medium text-center text-gray-800">
                Ready to find your perfect match? Select your experience level below so I know exactly how to guide our conversation today:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => { setUserTrack('Beginner'); setStep('preferences'); }}
                className="p-5 border-2 border-gray-200 hover:border-[#075A75] hover:bg-teal-50/50 rounded-xl text-left transition font-semibold text-gray-800 flex items-center justify-between group"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">🌿</span> 
                  I'm exploring or new to this
                </span>
                <span className="text-[#075A75] transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button
                onClick={() => { setUserTrack('Experienced'); setStep('preferences'); }}
                className="p-5 border-2 border-gray-200 hover:border-[#075A75] hover:bg-teal-50/50 rounded-xl text-left transition font-semibold text-gray-800 flex items-center justify-between group"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span> 
                  I know what I like, looking for specific matches
                </span>
                <span className="text-[#075A75] transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-8 text-center px-4">
              Must be 21+ to use. Recommendations provided by Mari are for informational purposes only and do not constitute medical advice.
            </p>
          </div>
        )}

        {step === 'preferences' && (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Tell me what you're looking for.</h2>
            <p className="text-sm text-gray-600">
              {userTrack === 'Beginner' 
                ? "In your own words, what kind of feeling or relief are you hoping to find today? Do you prefer smoking, edibles, or aren't sure?" 
                : "Describe your ideal effects, preferred consumption methods, and any specific terpene profiles you're hunting for."}
            </p>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Type your thoughts here..."
              className="w-full h-32 p-4 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#075A75] focus:outline-none resize-none"
            />
            <button
              onClick={() => setStep('upload')}
              disabled={!preferences.trim()}
              className="w-full py-3 bg-[#075A75] hover:bg-[#05455a] text-white font-semibold rounded-xl shadow transition disabled:opacity-50"
            >
              Continue to Menu Upload →
            </button>
          </div>
        )}

        {step === 'upload' && (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 text-center">Upload Your Dispensary Menu</h2>
            <form onSubmit={handleInitialSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#075A75] transition-colors relative">
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  id="menu-upload"
                  disabled={loading}
                />
                <label htmlFor="menu-upload" className={`cursor-pointer flex flex-col items-center ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg object-contain mb-4 shadow" />
                  ) : (
                    <div className="w-12 h-12 bg-teal-50 text-[#075A75] rounded-full flex items-center justify-center mb-3" aria-hidden="true">📸</div>
                  )}
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedFile ? selectedFile.name : 'Click to upload menu photo'}
                  </span>
                </label>
              </div>
              
              <div aria-live="polite">
                {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
              </div>

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="w-full py-3 bg-[#075A75] hover:bg-[#05455a] text-white font-semibold rounded-xl shadow transition disabled:opacity-50"
              >
                {loading ? 'Mari is analyzing and ranking...' : 'Get My Rankings'}
              </button>
            </form>
          </div>
        )}

        {step === 'results' && (
          <div className="bg-white rounded-2xl shadow-md flex flex-col h-[75vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="font-bold text-gray-800">Your Session with Mari</h2>
              <button onClick={restartIntake} className="text-xs text-[#075A75] font-semibold hover:underline">↺ Start Over</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6" aria-live="polite">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#075A75] text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none whitespace-pre-wrap leading-relaxed'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none text-sm text-gray-500 italic">Mari is typing...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t bg-white rounded-b-2xl">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Mari a follow-up question..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#075A75] text-sm"
                  disabled={loading}
                  aria-label="Chat input"
                />
                <button type="submit" disabled={loading || !chatInput.trim()} className="px-5 bg-[#075A75] text-white rounded-xl font-semibold hover:bg-[#05455a] disabled:opacity-50 transition">
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
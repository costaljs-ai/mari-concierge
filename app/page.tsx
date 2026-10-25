'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  // Navigation / Step state for the conversational intake
  const [step, setStep] = useState<'welcome' | 'experience' | 'preferences' | 'upload' | 'results'>('welcome');
  
  // User profile states
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [desiredEffect, setDesiredEffect] = useState('Balanced & Relaxed');
  const [consumptionMethod, setConsumptionMethod] = useState('Any / All');

  // File and API analysis states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or snap a picture of a menu first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('experienceLevel', experienceLevel);
      formData.append('reason', reason);
      formData.append('desiredEffect', desiredEffect);
      formData.append('consumptionMethod', consumptionMethod);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze the menu.');
      }

      setResult(data);
      setStep('results');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restartIntake = () => {
    setStep('welcome');
    setExperienceLevel('');
    setReason('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Centered, Clickable Branding Header */}
      <header className="flex justify-center items-center py-6 border-b border-gray-200 mb-10 bg-white shadow-sm">
        <Link href="/" onClick={restartIntake} className="flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02] cursor-pointer">
          {/* Integrated Guide Motif Icon */}
          <div className="w-10 h-10 text-[#075A75]">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10C50 10 85 20 85 50C85 65 80 80 50 90C20 80 15 65 15 50C15 20 50 10 50 10Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M35 50C35 50 42 40 50 45C58 50 65 40 65 50C65 57 60 63 50 63C40 63 35 57 35 50Z" fill="currentColor"/>
              <path d="M50 25V35" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              <path d="M45 30H55" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          
          {/* Branding Text */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-[#075A75] leading-none">
              Mari
            </h1>
            <span className="text-sm text-gray-600 font-medium tracking-wide mt-1">
              the Concierge
            </span>
          </div>
        </Link>
      </header>

      {/* Main Interactive Flow Container */}
      <div className="max-w-xl mx-auto px-4">
        
        {/* STEP 1: WELCOME / PURPOSE */}
        {step === 'welcome' && (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome, I'm Mari.
            </h2>
            <p className="text-gray-600 text-sm">
              What brings you here today? Let's tailor your experience.
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { setReason('Explore & Learn / New'); setStep('experience'); }}
                className="p-4 border-2 border-gray-200 hover:border-[#075A75] hover:bg-teal-50/50 rounded-xl text-left transition font-semibold text-gray-800 flex items-center justify-between"
              >
                <span>🌿 I'm exploring or new to this</span>
                <span className="text-[#075A75]">→</span>
              </button>

              <button
                onClick={() => { setReason('Curated Recommendations / Experienced'); setStep('experience'); }}
                className="p-4 border-2 border-gray-200 hover:border-[#075A75] hover:bg-teal-50/50 rounded-xl text-left transition font-semibold text-gray-800 flex items-center justify-between"
              >
                <span>⚡ I know what I like, looking for specific matches</span>
                <span className="text-[#075A75]">→</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE LEVEL ROUTING */}
        {step === 'experience' && (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <button onClick={() => setStep('welcome')} className="text-sm text-gray-500 hover:text-gray-800">
                ← Back
              </button>
              <span className="text-xs font-bold text-[#075A75] uppercase tracking-wider">Step 2 of 4</span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 text-center">
              How would you describe your experience level?
            </h2>

            <div className="space-y-3">
              {['Beginner (Looking for gentle, low dose guidance)', 'Intermediate (Casual consumer)', 'Connoisseur (Seeking top-shelf profiles & potencies)'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { setExperienceLevel(lvl); setStep('preferences'); }}
                  className="w-full p-3.5 border-2 border-gray-200 hover:border-[#075A75] hover:bg-teal-50/50 rounded-xl text-left text-sm font-medium transition text-gray-800"
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: PREFERENCES */}
        {step === 'preferences' && (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <button onClick={() => setStep('experience')} className="text-sm text-gray-500 hover:text-gray-800">
                ← Back
              </button>
              <span className="text-xs font-bold text-[#075A75] uppercase tracking-wider">Step 3 of 4</span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 text-center">
              What kind of effect & method are you looking for?
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Desired Effect</label>
                <select 
                  value={desiredEffect} 
                  onChange={(e) => setDesiredEffect(e.target.value)}
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#075A75] focus:border-[#075A75]"
                >
                  <option value="Balanced & Relaxed">Balanced & Relaxed</option>
                  <option value="Energetic & Uplifted">Energetic & Uplifted</option>
                  <option value="Deep Sleep & Pain Relief">Deep Sleep & Pain Relief</option>
                  <option value="Creative & Focused">Creative & Focused</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Method</label>
                <select 
                  value={consumptionMethod} 
                  onChange={(e) => setConsumptionMethod(e.target.value)}
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#075A75] focus:border-[#075A75]"
                >
                  <option value="Any / All">Any / All</option>
                  <option value="Flower">Flower</option>
                  <option value="Vapes & Carts">Vapes & Carts</option>
                  <option value="Edibles">Edibles</option>
                  <option value="Concentrates">Concentrates</option>
                </select>
              </div>

              <button
                onClick={() => setStep('upload')}
                className="w-full py-3 bg-[#075A75] hover:bg-[#05455a] text-white font-semibold rounded-xl shadow transition"
              >
                Continue to Menu Upload →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: MENU UPLOAD & SUBMIT */}
        {step === 'upload' && (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <button onClick={() => setStep('preferences')} className="text-sm text-gray-500 hover:text-gray-800">
                ← Back
              </button>
              <span className="text-xs font-bold text-[#075A75] uppercase tracking-wider">Step 4 of 4</span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 text-center">
              Upload Your Dispensary Menu
            </h2>
            <p className="text-gray-600 text-sm text-center">
              Snap a photo or upload a screenshot of the menu so Mari can analyze it against your preferences.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#075A75] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="menu-upload"
                />
                <label htmlFor="menu-upload" className="cursor-pointer flex flex-col items-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Menu Preview"
                      className="max-h-48 rounded-lg object-contain mb-4 shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-teal-50 text-[#075A75] rounded-full flex items-center justify-center mb-3">
                      📸
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedFile ? selectedFile.name : 'Click to upload or snap a menu photo'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WEBP</span>
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="w-full py-3 px-4 bg-[#075A75] hover:bg-[#05455a] text-white font-semibold rounded-xl shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Mari is analyzing your menu...' : 'Get My Personalized Recommendations'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 5: RESULTS */}
        {step === 'results' && result && (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">Mari's Recommendations</h2>
              <button
                onClick={restartIntake}
                className="text-sm text-[#075A75] font-semibold hover:underline"
              >
                ↺ Start Over
              </button>
            </div>

            <div className="prose text-gray-700 space-y-4">
              {typeof result.analysis === 'string' ? (
                <p className="whitespace-pre-wrap">{result.analysis}</p>
              ) : (
                <div>{JSON.stringify(result.analysis, null, 2)}</div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Custom user preference states
  const [desiredEffect, setDesiredEffect] = useState('Balanced & Relaxed');
  const [consumptionMethod, setConsumptionMethod] = useState('Any / All');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');

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
      formData.append('desiredEffect', desiredEffect);
      formData.append('consumptionMethod', consumptionMethod);
      formData.append('experienceLevel', experienceLevel);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze the menu.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Centered, Clickable Branding Header */}
      <header className="flex justify-center items-center py-6 border-b border-gray-200 mb-10 bg-white shadow-sm">
        <Link href="/" onClick={resetForm} className="flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02] cursor-pointer">
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

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4">
        {!result ? (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
              Find Your Perfect Match
            </h2>
            <p className="text-gray-600 text-sm mb-6 text-center">
              Upload a dispensary menu photo and tell Mari what kind of experience you are looking for.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Preferences Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Desired Effect</label>
                  <select 
                    value={desiredEffect} 
                    onChange={(e) => setDesiredEffect(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#075A75] focus:border-[#075A75]"
                  >
                    <option value="Balanced & Relaxed">Balanced & Relaxed</option>
                    <option value="Energetic & Uplifted">Energetic & Uplifted</option>
                    <option value="Deep Sleep & Pain Relief">Deep Sleep & Pain Relief</option>
                    <option value="Creative & Focused">Creative & Focused</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Method</label>
                  <select 
                    value={consumptionMethod} 
                    onChange={(e) => setConsumptionMethod(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#075A75] focus:border-[#075A75]"
                  >
                    <option value="Any / All">Any / All</option>
                    <option value="Flower">Flower</option>
                    <option value="Vapes & Carts">Vapes & Carts</option>
                    <option value="Edibles">Edibles</option>
                    <option value="Concentrates">Concentrates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience</label>
                  <select 
                    value={experienceLevel} 
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#075A75] focus:border-[#075A75]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Connoisseur">Connoisseur</option>
                  </select>
                </div>
              </div>

              {/* File Upload Box */}
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
                {loading ? 'Mari is analyzing the menu...' : 'Get Recommendations'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">Mari's Recommendations</h2>
              <button
                onClick={resetForm}
                className="text-sm text-[#075A75] font-semibold hover:underline"
              >
                ← Scan Another Menu
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
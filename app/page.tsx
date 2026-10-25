"use client";
import React, { useState } from "react";
import { SlidersHorizontal, Upload, Sparkles, AlertTriangle, CheckCircle2, RefreshCw, Flame, Leaf, ArrowRight, ArrowLeft, Image as ImageIcon, ShieldCheck, MessageSquareQuote } from "lucide-react";

export default function WeedSommelierApp() {
  const [currentStep, setCurrentStep] = useState<"step1" | "step2" | "step3" | "dashboard">("step1");

  // Onboarding Form State (Clean & Blank for production)
  const [experienceLevel, setExperienceLevel] = useState<"experienced" | "brand_new">("experienced");
  const [intent, setIntent] = useState("");
  
  const [medicalConditions, setMedicalConditions] = useState("");
  const [lookingForwardTo, setLookingForwardTo] = useState("");

  const [lovedItem1, setLovedItem1] = useState("");
  const [lovedItem2, setLovedItem2] = useState("");
  const [dislikedItem, setDislikedItem] = useState("");

  const [finalPreferencesText, setFinalPreferencesText] = useState("");

  // File & Live API State
  const [uploadedFileObj, setUploadedFileObj] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileObj(file);
      setUploadedFileName(file.name);
    }
  };

  const handleScanMenu = async () => {
    if (!uploadedFileObj) {
      alert("Please upload a menu screenshot first!");
      return;
    }

    setIsScanning(true);
    setApiError(null);
    setScanResult(null);

    const userProfile = {
      experienceLevel,
      intent: intent || "Looking for a balanced wellness experience.",
      medicalConditions: experienceLevel === "brand_new" ? medicalConditions : null,
      lookingForwardTo: experienceLevel === "brand_new" ? lookingForwardTo : null,
      preferences: experienceLevel === "experienced" ? { lovedItem1, lovedItem2, dislikedItem } : null,
      finalNotes: finalPreferencesText
    };

    const formData = new FormData();
    formData.append("image", uploadedFileObj);
    formData.append("profile", JSON.stringify(userProfile));

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze menu.");

      setScanResult(data);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#2C3E35] font-sans selection:bg-[#075A75] selection:text-white">
      <header className="border-b border-[#E5E0D5] bg-[#FAF8F5]/85 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#075A75] text-[#FAF8F5] p-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-md shadow-[#075A75]/10">
            <Leaf className="w-5 h-5" />
            <span className="tracking-tight text-sm uppercase font-black">The Mari Concierge</span>
          </div>
          <span className="text-xs text-[#6B7C73] hidden sm:inline-block border-l border-[#E5E0D5] pl-3 font-medium">
            Personalized for the best experience 🌿✨
          </span>
        </div>
        <div className="flex items-center gap-3">
          {currentStep === "dashboard" && (
            <button 
              onClick={() => setCurrentStep("step1")}
              className="text-xs bg-[#EFECE6] hover:bg-[#E5E0D5] text-[#2C3E35] px-3.5 py-2 rounded-xl border border-[#E5E0D5] transition flex items-center gap-1.5 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-tune Profile
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {currentStep !== "dashboard" ? (
          <div className="bg-[#FAF8F5] border border-[#E5E0D5] rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#EFECE6]">
              <div 
                className="h-full bg-[#075A75] transition-all duration-300 rounded-r-full"
                style={{ width: currentStep === "step1" ? "33%" : currentStep === "step2" ? "66%" : "100%" }}
              ></div>
            </div>

            {currentStep === "step1" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2 pb-4 border-b border-[#E5E0D5]">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#075A75]">Welcome to The Mari Concierge</span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C3E35]">
                    Find your perfect match, tailored to your desired outcome and preferences.
                  </h1>
                  <p className="text-sm text-[#6B7C73] leading-relaxed">
                    Answer a few quick questions, upload a screenshot of the dispensary menu you’re looking at, and Mari will give you a detailed breakdown of what to expect and how well it fits your vibe.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
                    <div className="bg-[#F7F5F0] border border-[#E5E0D5] p-2.5 rounded-xl text-xs text-[#2C3E35] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#075A75] text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                      <span>Share your vibe</span>
                    </div>
                    <div className="bg-[#F7F5F0] border border-[#E5E0D5] p-2.5 rounded-xl text-xs text-[#2C3E35] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#075A75] text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                      <span>Upload your menu</span>
                    </div>
                    <div className="bg-[#F7F5F0] border border-[#E5E0D5] p-2.5 rounded-xl text-xs text-[#2C3E35] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#075A75] text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                      <span>Get your match</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#075A75] block">What brings you in today? (Your Intent & Vibe)</label>
                    <textarea
                      rows={3}
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#E5E0D5] rounded-2xl p-4 text-sm text-[#2C3E35] focus:outline-none focus:border-[#075A75] transition shadow-inner"
                      placeholder="e.g., Unwinding after work, relieving sore joints, or looking for a joyful weekend vibe..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#075A75] block">Are you brand new to cannabis or experienced?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setExperienceLevel("experienced")}
                        className={`p-3.5 rounded-2xl border text-xs font-bold transition text-center ${
                          experienceLevel === "experienced"
                            ? "bg-[#075A75]/15 border-[#075A75] text-[#075A75] shadow-sm"
                            : "bg-[#F7F5F0] border-[#E5E0D5] text-[#6B7C73] hover:border-[#D5CFBE]"
                        }`}
                      >
                        I have experience
                      </button>
                      <button
                        type="button"
                        onClick={() => setExperienceLevel("brand_new")}
                        className={`p-3.5 rounded-2xl border text-xs font-bold transition text-center ${
                          experienceLevel === "brand_new"
                            ? "bg-[#075A75]/15 border-[#075A75] text-[#075A75] shadow-sm"
                            : "bg-[#F7F5F0] border-[#E5E0D5] text-[#6B7C73] hover:border-[#D5CFBE]"
                        }`}
                      >
                        I am brand new
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setCurrentStep("step2")}
                    className="bg-[#075A75] hover:bg-[#05465c] text-[#FAF8F5] font-semibold px-7 py-3 rounded-2xl text-sm transition flex items-center gap-2 shadow-md shadow-[#075A75]/20"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === "step2" && (
              <div className="space-y-6 animate-fadeIn">
                {experienceLevel === "experienced" ? (
                  <>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#075A75]">Step 2 of 3</span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C3E35] mt-1">Calibrate Your Vibes</h1>
                      <p className="text-sm text-[#6B7C73] mt-1.5">
                        Tell us about <strong>2 things you've loved</strong> and <strong>1 thing you didn't</strong> to help us personalize even more!
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-[#075A75] block mb-1">💚 Loved Item #1</label>
                        <input
                          type="text"
                          value={lovedItem1}
                          onChange={(e) => setLovedItem1(e.target.value)}
                          className="w-full bg-[#F7F5F0] border border-[#E5E0D5] rounded-xl p-3.5 text-sm text-[#2C3E35] focus:outline-none focus:border-[#075A75] transition shadow-inner"
                          placeholder="e.g., A savory garlic vape that melted my body tension"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#075A75] block mb-1">💚 Loved Item #2</label>
                        <input
                          type="text"
                          value={lovedItem2}
                          onChange={(e) => setLovedItem2(e.target.value)}
                          className="w-full bg-[#F7F5F0] border border-[#E5E0D5] rounded-xl p-3.5 text-sm text-[#2C3E35] focus:outline-none focus:border-[#075A75] transition shadow-inner"
                          placeholder="e.g., A sweet creamy dessert strain with great mood lift"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#A25E55] block mb-1">❌ Not My Vibe (1 thing you didn't enjoy)</label>
                        <input
                          type="text"
                          value={dislikedItem}
                          onChange={(e) => setDislikedItem(e.target.value)}
                          className="w-full bg-[#F7F5F0] border border-[#E5E0D5] rounded-xl p-3.5 text-sm text-[#2C3E35] focus:outline-none focus:border-[#A25E55] transition shadow-inner"
                          placeholder="e.g., Sharp pine-sol strain that gave me anxiety"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#075A75]">Step 2 of 3 (New Explorer Guidance)</span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C3E35] mt-1">Welcome to Your Wellness Journey</h1>
                      <p className="text-sm text-[#6B7C73] mt-1.5">
                        As your personal pharmacist-style guide, Mari is here to help you start slow, find comfortable settings, and explore safely.
                      </p>
                    </div>

                    <div className="space-y-4 bg-[#F7F5F0] border border-[#E5E0D5] rounded-2xl p-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#075A75] block">What medical conditions or symptoms are you trying to help medicate?</label>
                        <input
                          type="text"
                          value={medicalConditions}
                          onChange={(e) => setMedicalConditions(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl p-3.5 text-sm text-[#2C3E35] focus:outline-none focus:border-[#075A75] transition shadow-inner"
                          placeholder="e.g., Chronic pain, sleep trouble, or mild anxiety..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#075A75] block">What are you looking forward to experiencing?</label>
                        <input
                          type="text"
                          value={lookingForwardTo}
                          onChange={(e) => setLookingForwardTo(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl p-3.5 text-sm text-[#2C3E35] focus:outline-none focus:border-[#075A75] transition shadow-inner"
                          placeholder="e.g., Gentle physical relaxation in a cozy setting..."
                        />
                      </div>

                      <div className="p-3 bg-[#075A75]/10 border border-[#075A75]/30 rounded-xl text-xs text-[#075A75] font-medium leading-relaxed">
                        💡 <strong>Pharmacist Tip:</strong> Always start small (low dose) and consume in comfortable, familiar settings.
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep("step1")}
                    className="bg-[#EFECE6] hover:bg-[#E5E0D5] text-[#2C3E35] font-medium px-5 py-3 rounded-2xl text-sm transition flex items-center gap-2 border border-[#E5E0D5]"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setCurrentStep("step3")}
                    className="bg-[#075A75] hover:bg-[#05465c] text-[#FAF8F5] font-semibold px-7 py-3 rounded-2xl text-sm transition flex items-center gap-2 shadow-md shadow-[#075A75]/20"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === "step3" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#075A75]">Step 3 of 3</span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C3E35] mt-1">Anything else you want us to know?</h1>
                  <p className="text-sm text-[#6B7C73] mt-1.5">
                    Please describe your preferred ingestion method and anything you are concerned about or want to avoid in your experience.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#075A75] block">Open Preferences & Final Details</label>
                  <textarea
                    rows={6}
                    value={finalPreferencesText}
                    onChange={(e) => setFinalPreferencesText(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#E5E0D5] rounded-2xl p-4 text-sm text-[#2C3E35] focus:outline-none focus:border-[#075A75] transition shadow-inner"
                    placeholder="e.g., Preferred ingestion method: Dry herb vaporizer. Please avoid heavy couch-lock or racy heart rates..."
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep("step2")}
                    className="bg-[#EFECE6] hover:bg-[#E5E0D5] text-[#2C3E35] font-medium px-5 py-3 rounded-2xl text-sm transition flex items-center gap-2 border border-[#E5E0D5]"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setCurrentStep("dashboard")}
                    className="bg-[#075A75] hover:bg-[#05465c] text-[#FAF8F5] font-semibold px-7 py-3 rounded-2xl text-sm transition flex items-center gap-2 shadow-md shadow-[#075A75]/20"
                  >
                    <Sparkles className="w-4 h-4" /> Meet Mari & Upload Menu <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#FAF8F5] border border-[#E5E0D5] rounded-3xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-[#075A75] bg-[#075A75]/15 px-2.5 py-1 rounded-md border border-[#075A75]/30">Mari's Concierge Active</span>
                  <span className="text-xs text-[#6B7C73]">Experience: {experienceLevel === "brand_new" ? "New Explorer" : "Experienced"}</span>
                </div>
                <h2 className="text-base font-bold text-[#2C3E35] mt-2">"{intent ? intent.slice(0, 70) + '...' : 'Custom Wellness Profile Active'}"</h2>
              </div>
              <button 
                onClick={() => setCurrentStep("step1")}
                className="bg-[#EFECE6] hover:bg-[#E5E0D5] text-[#2C3E35] px-4 py-2.5 rounded-xl text-xs font-medium border border-[#E5E0D5] transition shadow-sm"
              >
                Edit Preferences
              </button>
            </div>

            <div className="bg-[#FAF8F5] border border-[#E5E0D5] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#2C3E35] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#075A75]" /> Upload Dispensary Menu or Jar Label
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7C73] mt-1">
                  Drop your screenshot below. Mari will instantly parse batch lab COAs and give you a budtender script!
                </p>
              </div>

              <div className="border-2 border-dashed border-[#D5CFBE] hover:border-[#075A75] bg-[#F7F5F0] rounded-2xl p-6 text-center transition relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-[#FAF8F5] rounded-full shadow-sm border border-[#E5E0D5]">
                    <ImageIcon className="w-6 h-6 text-[#075A75]" />
                  </div>
                  {uploadedFileName ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#075A75]">Uploaded: {uploadedFileName}</p>
                      <p className="text-xs text-[#6B7C73]">Click or drag a new image to replace</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#2C3E35]">Click to upload menu screenshot or drag & drop here</p>
                      <p className="text-xs text-[#6B7C73]">PNG, JPG, HEIC up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {apiError && (
                <div className="bg-[#A25E55]/10 border border-[#A25E55]/30 rounded-xl p-4 text-xs text-[#A25E55]">
                  <strong>API Error:</strong> {apiError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleScanMenu}
                  disabled={isScanning}
                  className="bg-[#075A75] hover:bg-[#05465c] disabled:opacity-50 text-[#FAF8F5] font-bold px-7 py-3 rounded-2xl text-sm transition flex items-center gap-2 shadow-md shadow-[#075A75]/20"
                >
                  {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isScanning ? "Mari is Analyzing Lab COAs..." : "Run Mari's Analysis"}
                </button>
              </div>

              {scanResult && (
                <div className="space-y-4 pt-6 border-t border-[#E5E0D5] animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#075A75]">Mari's Live Analysis</span>
                    <span className="text-xs text-[#6B7C73]">{scanResult.snapshot}</span>
                  </div>

                  {scanResult.top_matches?.map((match: any, idx: number) => (
                    <div key={idx} className="bg-[#FAF8F5] border border-[#075A75]/40 rounded-2xl p-5 relative overflow-hidden shadow-sm space-y-3">
                      <div className="absolute top-0 right-0 bg-[#075A75] text-[#FAF8F5] text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                        {match.match_score} ({match.confidence})
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] uppercase px-2.5 py-0.5 rounded-md bg-[#075A75]/15 text-[#075A75] font-bold">#{match.rank || idx + 1} Pick</span>
                          <h4 className="font-extrabold text-[#2C3E35] text-base">{match.name} <span className="text-xs font-normal text-[#6B7C73]">({match.brand})</span></h4>
                        </div>
                        <p className="text-xs text-[#4A5D52] leading-relaxed">
                          <strong>Why Mari recommends this:</strong> {match.why_it_fits}
                        </p>
                      </div>

                      {/* Budtender Script Box */}
                      {match.budtender_script && (
                        <div className="bg-[#075A75]/10 border border-[#075A75]/30 rounded-xl p-3 flex items-start gap-2.5">
                          <MessageSquareQuote className="w-4 h-4 text-[#075A75] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[11px] font-bold text-[#075A75] uppercase tracking-wide block">Budtender Script / Counter Check:</span>
                            <p className="text-xs text-[#2C3E35] italic mt-0.5">"{match.budtender_script}"</p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        {match.thc && <span className="text-[11px] bg-[#F7F5F0] border border-[#E5E0D5] px-2.5 py-1 rounded-md text-[#2C3E35] font-medium">THC: {match.thc}</span>}
                        {match.terpenes && <span className="text-[11px] bg-[#F7F5F0] border border-[#E5E0D5] px-2.5 py-1 rounded-md text-[#2C3E35] font-medium">Terpenes: {match.terpenes}</span>}
                        {match.lineage && <span className="text-[11px] bg-[#075A75]/10 border border-[#075A75]/30 px-2.5 py-1 rounded-md text-[#075A75] font-medium">Lineage: {match.lineage}</span>}
                      </div>
                    </div>
                  ))}

                  {scanResult.red_flag && (
                    <div className="bg-[#A25E55]/10 border border-[#A25E55]/30 rounded-2xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#A25E55] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-[#A25E55]">Mari's Gentle Warning: Skip "{scanResult.red_flag.strain}"</h5>
                        <p className="text-xs text-[#8A4F46] mt-0.5">{scanResult.red_flag.reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="max-w-3xl mx-auto px-4 py-6 text-center text-[11px] text-[#8C9C93] border-t border-[#E5E0D5] mt-12 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#075A75] shrink-0" />
        <span>
          <strong>Disclaimer:</strong> The Mari Concierge is an AI terpene and preference research assistant, not a licensed medical provider or pharmacist. Always consult your healthcare professional regarding treatment plans.
        </span>
      </footer>
    </main>
  );
}
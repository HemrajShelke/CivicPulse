import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { useIssueStore } from '../store/issueStore';
import { Camera, Mic, MapPin, UploadCloud, CheckCircle, Sparkles, FileText, Send, Trash2, ArrowRight, Video, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import ResolutionCelebration from '../components/ResolutionCelebration';

export default function Report() {
  const { user, incrementReports } = useAuthStore();
  const { reportIssue } = useIssueStore();
  const navigate = useNavigate();

  // Form states
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [voice, setVoice] = useState<string | null>(null);
  const [address, setAddress] = useState('Sector 4, HSR Layout, Bengaluru, Karnataka');
  const [latitude, setLatitude] = useState(12.9121);
  const [longitude, setLongitude] = useState(77.6441);

  // Flow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedDetails, setAnalyzedDetails] = useState<any | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  // File refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Hardware/Media Integration States
  const [isRecording, setIsRecording] = useState(false);
  const [speechLang, setSpeechLang] = useState('en-IN');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const baseDescRef = useRef('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isPolishing, setIsPolishing] = useState(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let rec: any = null;
    if (SpeechRecognition) {
      rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = speechLang;

      rec.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          const chunk = event.results[i][0].transcript || '';
          if (fullTranscript && !fullTranscript.endsWith(' ') && !chunk.startsWith(' ')) {
            fullTranscript += ' ';
          }
          fullTranscript += chunk;
        }
        setLiveTranscript(fullTranscript);
        setDescription(baseDescRef.current ? baseDescRef.current + " " + fullTranscript : fullTranscript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }

    return () => {
      if (rec) {
        try {
          rec.stop();
        } catch (e) {
          // Ignore stop errors if already stopped
        }
      }
    };
  }, [speechLang]);

  // Handle Speech Toggle
  const toggleRecording = () => {
    if (isRecording) {
      recognition?.stop();
      setIsRecording(false);
    } else {
      if (!recognition) {
        alert("Speech Recognition is not supported by your browser. Try Google Chrome or Safari!");
        return;
      }
      baseDescRef.current = description;
      setLiveTranscript('');
      setIsRecording(true);
      recognition.lang = speechLang;
      recognition.start();
    }
  };

  // AI Polish Description
  const handlePolishDescription = async () => {
    if (!description || description.trim() === "") return;
    setIsPolishing(true);
    try {
      const response = await fetch("/api/gemini/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: description,
          language: speechLang
        })
      });
      const data = await response.json();
      if (data.success && data.polishedText) {
        setDescription(data.polishedText);
      }
    } catch (error) {
      console.error("Error polishing description:", error);
    } finally {
      setIsPolishing(false);
    }
  };

  // Handle Camera Toggle
  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Could not access your device's camera. Try uploading an existing image instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Geolocation auto-detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`Ward Location: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          setAddress(`Ward Location: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to fetch location. Please grant location access or input the details manually.");
        setIsLocating(false);
      }
    );
  };

  // Handle image select / drop
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  // Analyze report with Gemini
  const handleAnalyzeReport = async () => {
    if (!description && !image) return;
    setIsAnalyzing(true);
    setAnalyzedDetails(null);

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          image
        })
      });
      const data = await response.json();
      if (data.success) {
        setAnalyzedDetails(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Confirm and submit report to DB
  const handleConfirmSubmit = async () => {
    if (!analyzedDetails) return;

    const payload = {
      title: analyzedDetails.title,
      description: analyzedDetails.description,
      category: analyzedDetails.category,
      severity: analyzedDetails.severity,
      department: analyzedDetails.department,
      address,
      lat: latitude,
      lng: longitude,
      reporterName: user?.name || "Civic Hero",
      reporterEmail: user?.email || "hero@civicpulse.in",
      ward: user?.ward || "General Ward",
      image,
      voice
    };

    const res = await reportIssue(payload);
    if (res.success) {
      incrementReports();
      setCelebrate(true);
      setTimeout(() => {
        setCelebrate(false);
        navigate('/dashboard');
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#050d0a] text-text-primary pt-24 pb-16 relative">
      <Navbar />

      {celebrate && <ResolutionCelebration />}

      <div className="max-w-4xl mx-auto px-6 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-[#00FF88] text-xs font-mono font-bold uppercase tracking-widest">SWACHH AI RADAR REPORT</span>
          <h1 className="text-3xl md:text-4xl font-grotesk font-extrabold text-text-primary mt-2">
            File an Issue
          </h1>
          <p className="text-text-secondary text-xs max-w-md mx-auto mt-2">
            Upload a photo or enter details. Our agentic Gemini pipeline will classify, verify, and routing protocols automatically.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Image & Details Input (Span 7) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Image Upload Box / Camera */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono tracking-widest text-[#00FF88] uppercase font-bold">1. ATTACH EVIDENCE (DRAG & DROP OR LIVE SNAPSHOT)</label>
                {!isCameraActive && !image && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); startCamera(); }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#1D9E75]/20 hover:bg-[#00FF88]/20 border border-[#1D9E75]/40 hover:border-[#00FF88] text-[10px] font-mono font-bold text-[#00FF88] rounded-lg transition-all"
                  >
                    <Video size={11} />
                    OPEN LIVE CAMERA
                  </button>
                )}
              </div>
              
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => { if (!isCameraActive) fileInputRef.current?.click(); }}
                className={`border-2 border-dashed rounded-3xl min-h-[220px] flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
                  image 
                    ? 'border-[#00FF88]/40 bg-[#0c2217]/20' 
                    : isCameraActive
                      ? 'border-[#00FF88] bg-black'
                      : 'border-[#1D9E75]/25 bg-[#061410]/50 hover:border-[#1D9E75]/60 hover:bg-[#0c2217]/10'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={onFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                {isCameraActive ? (
                  <div className="w-full h-full flex flex-col items-center relative" onClick={(e) => e.stopPropagation()}>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full max-h-52 object-cover rounded-t-2xl"
                    />
                    <div className="p-3 bg-black/90 w-full flex justify-center gap-4 border-t border-[#1D9E75]/20">
                      <button
                        type="button"
                        onClick={captureSnapshot}
                        className="px-4 py-2 bg-[#00FF88] text-black font-grotesk font-extrabold text-[11px] rounded-xl uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#00FF88]/80 transition-all"
                      >
                        <Camera size={13} />
                        Capture Snap
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2 bg-[#FF2D55] text-white font-grotesk font-bold text-[11px] rounded-xl uppercase tracking-wider hover:bg-[#FF2D55]/80 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : image ? (
                  <div className="relative w-full h-full p-4 flex items-center justify-center">
                    <img src={image} alt="Preview" className="max-h-52 max-w-full rounded-2xl object-contain border border-[#1D9E75]/30" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImage(null); }}
                      className="absolute top-6 right-6 p-1.5 bg-[#FF2D55] text-white rounded-full hover:bg-[#FF2D55]/80 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center mx-auto border border-[#1D9E75]/20 text-[#00FF88]">
                      <Camera size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-grotesk font-bold text-text-primary">Click to take photo or upload</p>
                      <p className="text-text-tertiary text-[10px] mt-1">Drag & drop image files, or snap direct evidence photo</p>
                    </div>
                    {cameraError && (
                      <p className="text-[#FF2D55] text-[10px] font-mono mt-2">{cameraError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Multilingual Description Box */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono tracking-widest text-[#00FF88] uppercase font-bold">2. CITIZEN COMPLAINT STATEMENT</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem... Speak / write in English, Hindi, Tamil, Marathi etc. (e.g. Severe garbage dumping behind the school causing mosquitoes)"
                rows={4}
                className="w-full bg-[#061410]/50 rounded-2xl p-4 text-xs text-text-primary placeholder-text-tertiary border border-[#1D9E75]/20 focus:border-[#00FF88]/40 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Real Web Speech Assistant */}
            <div className="bg-[#0c2217]/40 border border-[#1D9E75]/25 p-5 rounded-3xl space-y-3 shadow-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-[#FF2D55]/20 text-[#FF2D55] border border-[#FF2D55]/30' : 'bg-[#534AB7]/15 text-[#00FF88] border border-[#534AB7]/25'}`}>
                    {isRecording ? (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D55] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF2D55]"></span>
                      </span>
                    ) : (
                      <Mic size={18} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-grotesk font-extrabold text-xs text-text-primary">Native Speech Assistant</h4>
                    <p className="text-text-tertiary text-[10px]">Record a speech report in local languages</p>
                  </div>
                </div>

                {/* Speech Language selector */}
                <select
                  value={speechLang}
                  onChange={(e) => setSpeechLang(e.target.value)}
                  className="bg-[#061410] border border-[#1D9E75]/20 rounded-lg px-2 py-1 text-[10px] font-mono text-text-secondary focus:border-[#00FF88] outline-none"
                >
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">Hindi (हिंदी)</option>
                  <option value="ta-IN">Tamil (தமிழ்)</option>
                  <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
                  <option value="mr-IN">Marathi (मराठी)</option>
                </select>
              </div>

              {!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) && (
                <div className="p-3 bg-[#BA7517]/10 border border-[#BA7517]/30 rounded-2xl text-[10px] text-[#BA7517] leading-relaxed">
                  ⚠️ <b>Microphone Speech API Limited in this browser / device view</b>. Type manually or click the "Demo voice input" button below to see how our Gemini backend translates local scripts (like Hindi, Kannada, Tamil) into formal English complaints instantly!
                </div>
              )}

              {isRecording && (
                <div className="flex items-center justify-center gap-1.5 py-2">
                  <span className="text-[10px] font-mono text-[#FF2D55] font-extrabold tracking-widest animate-pulse">LISTENING LIVE... SPEAK CLEARLY</span>
                  <div className="flex gap-1 h-3 items-end">
                    {[1, 2, 3, 4, 5].map(i => (
                      <motion.div 
                        key={i} 
                        className="w-0.5 bg-[#FF2D55] rounded-full"
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {liveTranscript && (
                <div className="p-3 bg-[#050d0a]/80 border border-[#00FF88]/20 rounded-xl font-mono text-[11px] text-[#00FF88] leading-relaxed max-h-24 overflow-y-auto">
                  <span className="text-[9px] text-text-tertiary block mb-1 uppercase font-bold">Live Transcription Preview:</span>
                  "{liveTranscript}"
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={toggleRecording}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                    isRecording 
                      ? 'bg-[#FF2D55]/20 border-[#FF2D55] text-white hover:bg-[#FF2D55]/30' 
                      : 'bg-[#534AB7]/20 border-[#534AB7]/40 hover:border-[#00FF88] hover:text-[#00FF88] text-[#00FF88]'
                  }`}
                >
                  <Mic size={12} />
                  {isRecording ? "Stop Recording" : "Start Voice Report"}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setDescription("HSR Layout Sector 4 opposite park road storm drainage is blocked with heavy plastic debris and waterlogging is starting.");
                    setVoice("simulated_voice_recording");
                  }}
                  className="px-4 py-2 border border-[#1D9E75]/35 hover:border-[#00FF88] bg-[#050d0a]/60 text-[10px] font-mono font-semibold text-text-tertiary hover:text-[#00FF88] rounded-xl transition-all"
                >
                  Demo voice input
                </button>
              </div>

              {description && description.trim().length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  type="button"
                  onClick={handlePolishDescription}
                  disabled={isPolishing || isRecording}
                  className="w-full mt-1.5 py-2.5 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 border border-[#00FF88]/30 hover:border-[#00FF88] text-[10px] font-mono font-bold text-[#00FF88] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isPolishing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
                      Gemini Polishing Speech & Translating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} className="animate-pulse" />
                      AI Clean-up & Translate Voice Report (En)
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {/* Address Location Coordinates fields with Geolocation */}
            <div className="glass rounded-3xl p-5 border border-[#1D9E75]/15 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1D9E75]/10 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#00FF88]" />
                  <span className="text-[10px] font-mono tracking-widest text-text-tertiary uppercase font-bold">Local Coordinates Projection</span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="px-2.5 py-1 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 border border-[#00FF88]/30 hover:border-[#00FF88] text-[9px] font-mono font-bold text-[#00FF88] rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isLocating ? (
                    <>
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      PINPOINTING...
                    </>
                  ) : (
                    <>
                      <MapPin size={10} />
                      AUTO-DETECT MY LOCATION
                    </>
                  )}
                </button>
              </div>
              
              <div className="space-y-1">
                <span className="text-[9px] text-text-tertiary font-mono">ADDRESS LOCATION</span>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#050d0a]/40 rounded-xl px-3 py-2 text-xs text-text-primary border border-[#1D9E75]/10 focus:border-[#00FF88]/40 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-text-tertiary font-mono">LATITUDE</span>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full bg-[#050d0a]/40 rounded-xl px-3 py-2 text-xs text-text-primary font-mono border border-[#1D9E75]/10 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-text-tertiary font-mono">LONGITUDE</span>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full bg-[#050d0a]/40 rounded-xl px-3 py-2 text-xs text-text-primary font-mono border border-[#1D9E75]/10 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Analyze Trigger CTA */}
            <button
              onClick={handleAnalyzeReport}
              disabled={isAnalyzing || (!description && !image)}
              className="w-full py-4 bg-[#1D9E75] hover:bg-[#00FF88] hover:text-black font-grotesk font-bold uppercase tracking-wider text-xs rounded-2xl text-white btn-glow flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ANALYZING COMPLAINT SHAPE...
                </>
              ) : (
                <>
                  <Sparkles size={14} className="animate-pulse" />
                  INITIATE AI ANALYSIS
                </>
              )}
            </button>
          </div>

          {/* Right Block: Gemini Structured Outputs (Span 5) */}
          <div className="md:col-span-5">
            <AnimatePresence mode="wait">
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-strong rounded-3xl p-6 border border-[#1D9E75]/30 flex flex-col justify-center items-center text-center space-y-4 min-h-[300px]"
                >
                  <div className="w-10 h-10 rounded-2xl border border-[#1D9E75]/35 border-t-[#00FF88] animate-spin flex items-center justify-center text-[#00FF88]" />
                  <div>
                    <h4 className="font-grotesk font-extrabold text-sm text-text-primary uppercase tracking-wide">GEMINI MULTIMODAL INTAKE</h4>
                    <p className="text-text-tertiary text-[10px] mt-1 max-w-xs leading-relaxed">
                      Waking up the Gemini vision model. Categorizing complaint, assessing safety rating, recommending municipal departments, and writing SLA accountability targets...
                    </p>
                  </div>
                </motion.div>
              )}

              {analyzedDetails && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-strong rounded-3xl p-6 border border-[#00FF88]/40 shadow-2xl space-y-6"
                >
                  {/* Title Bar */}
                  <div className="flex items-center gap-2 border-b border-[#1D9E75]/10 pb-4">
                    <Sparkles size={16} className="text-[#00FF88]" />
                    <h3 className="font-grotesk font-extrabold text-sm uppercase tracking-wider text-text-primary">Gemini Radar Outputs</h3>
                  </div>

                  {/* Extracted Card fields */}
                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <span className="text-[9px] text-text-tertiary font-mono uppercase block">TITLE SUGGESTION</span>
                      <p className="text-text-primary font-bold font-grotesk mt-0.5 text-sm">{analyzedDetails.title}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] text-text-tertiary font-mono uppercase block">CATEGORY</span>
                        <span className="inline-block bg-[#1D9E75]/15 border border-[#1D9E75]/25 text-[#00FF88] px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold">
                          {analyzedDetails.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-tertiary font-mono uppercase block">SEVERITY RATING</span>
                        <span className="inline-block bg-[#FF2D55]/15 border border-[#FF2D55]/25 text-[#FF2D55] px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase">
                          {analyzedDetails.severity}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-text-tertiary font-mono uppercase block">MUNICIPAL TARGET DEPT.</span>
                      <p className="text-text-secondary font-semibold font-mono mt-0.5">{analyzedDetails.department}</p>
                    </div>

                    <div>
                      <span className="text-[9px] text-text-tertes-tertiary text-text-tertiary font-mono uppercase block">ESTIMATED SLA TIME</span>
                      <p className="text-[#BA7517] font-bold font-mono mt-0.5">{analyzedDetails.estimatedSLA || 'T+24h Left'}</p>
                    </div>

                    <div className="p-3.5 bg-[#0c2217]/50 rounded-2xl border border-[#1D9E75]/15 text-text-secondary italic leading-relaxed text-[11px] relative">
                      <span className="text-[8px] font-mono font-bold text-[#00FF88] uppercase block not-italic mb-1">Mascot Note from Navi</span>
                      "{analyzedDetails.commentFromNavi}"
                    </div>
                  </div>

                  {/* Submit Final Confirmation */}
                  <button
                    onClick={handleConfirmSubmit}
                    className="w-full py-3.5 bg-gradient-to-r from-[#1D9E75] to-[#00FF88] text-black font-grotesk font-extrabold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#00FF88]/10 hover:shadow-[#00FF88]/30 transition-all"
                  >
                    CONFIRM & FILE REPORT
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}

              {!analyzedDetails && !isAnalyzing && (
                <div className="glass rounded-3xl p-8 border border-[#1D9E75]/15 text-center flex flex-col justify-center items-center min-h-[300px] space-y-3">
                  <UploadCloud size={32} className="text-[#1D9E75]" />
                  <h4 className="font-grotesk font-bold text-xs uppercase text-text-primary tracking-wide">Analysis Awaiting</h4>
                  <p className="text-text-tertiary text-[10px] max-w-xs leading-relaxed mx-auto">
                    Evidence details submitted will be visualized and parsed here. Tap "Initiate AI Analysis" on the left to begin compiling municipal headers!
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Loader2, AlertCircle, CheckCircle, Leaf, Volume2, VolumeX, Square } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface DiseaseResult {
  plantNameEnglish: string;
  plantNameHindi: string;
  scientificName: string;
  disease: string;
  diseaseHindi: string;
  confidence: string;
  severity: string;
  treatment: string;
  treatmentHindi: string;
  prevention: string;
  preventionHindi: string;
  ttsTextEnglish?: string;
  ttsTextHindi?: string;
}

export const CropScanner: React.FC = () => {
  const { language } = useLanguage();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraReady(false);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device/browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      setShowCamera(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Camera error:', error);
      let errorMessage = 'Failed to access camera.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError' || error.message?.includes('not supported')) {
        errorMessage = 'Camera not supported. Try uploading an image instead.';
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleVideoLoaded = () => {
    setIsCameraReady(true);
    toast.success('Camera ready');
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsCameraReady(false);
    setCameraError(null);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('Camera not fully loaded. Please wait.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(imageData);
      stopCamera();
      toast.success('Image captured successfully!');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxSize = 1024;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedImage = canvas.toDataURL('image/jpeg', 0.85);
            setImagePreview(compressedImage);
            toast.success('Image uploaded');
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeCrop = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      console.log('Sending image for analysis...');
      const { data, error } = await supabase.functions.invoke('analyze-crop', {
        body: { image: imagePreview }
      });

      if (error) throw error;

      console.log('Analysis result:', data);
      setResult(data.analysis);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze crop. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setResult(null);
    stopCamera();
    stopAudio();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTTSText = () => {
    if (!result) return '';
    
    // Use Hindi TTS for Hindi, Marathi, or Punjabi; otherwise English
    const useHindi = language === 'hi' || language === 'mr' || language === 'pa';
    
    if (useHindi && result.ttsTextHindi) {
      return result.ttsTextHindi;
    }
    if (result.ttsTextEnglish) {
      return result.ttsTextEnglish;
    }
    
    // Fallback: Generate TTS-friendly text from other fields
    const plantName = useHindi ? result.plantNameHindi : result.plantNameEnglish;
    const disease = useHindi ? result.diseaseHindi : result.disease;
    const treatment = useHindi ? result.treatmentHindi : result.treatment;
    
    if (useHindi) {
      return `यह ${plantName} है। स्थिति: ${disease}। गंभीरता: ${result.severity}। उपचार: ${treatment}`;
    }
    return `This is ${plantName}. Condition: ${disease}. Severity: ${result.severity}. Treatment: ${treatment}`;
  };

  const playAudio = async () => {
    if (!result) return;
    
    const text = getTTSText();
    if (!text) {
      toast.error('No text available for speech');
      return;
    }

    setIsLoadingAudio(true);
    
    try {
      const useHindi = language === 'hi' || language === 'mr' || language === 'pa';
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, language: useHindi ? 'hi' : 'en' }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlaying(false);
        };
        
        audio.onerror = () => {
          setIsPlaying(false);
          toast.error('Failed to play audio');
        };
        
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Failed to generate speech');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopAudio();
    };
  }, []);

  if (showCamera) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Camera</h2>
          <Button variant="ghost" size="icon" onClick={stopCamera}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            muted
            onLoadedMetadata={handleVideoLoaded}
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {!isCameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span className="ml-2 text-white">Starting camera...</span>
            </div>
          )}
        </div>
        
        <Button 
          onClick={captureImage} 
          className="w-full"
          size="lg"
          disabled={!isCameraReady}
        >
          <Camera className="w-5 h-5 mr-2" />
          {isCameraReady ? 'Capture Photo' : 'Waiting for camera...'}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Position your crop clearly in frame for best results
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {!imagePreview ? (
        <>
          <Card className="p-6 bg-gradient-nature border-0 text-white">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-80" />
              <h3 className="font-semibold text-lg mb-2">Scan Your Crop</h3>
              <p className="text-sm opacity-90 mb-6">
                Identify plants and detect crop diseases with AI
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={startCamera}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Open Camera
                </Button>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                  className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-foreground">How it works</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Take a photo or upload an image of your crop</p>
              <p>2. AI identifies the plant and checks for diseases</p>
              <p>3. Get plant name in English & Hindi with diagnosis</p>
            </div>
          </Card>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Analysis</h2>
            <Button variant="ghost" size="icon" onClick={reset}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Card className="p-4">
            <img 
              src={imagePreview} 
              alt="Crop" 
              className="w-full rounded-lg mb-4"
            />
            
            {!result && !isAnalyzing && (
              <Button 
                onClick={analyzeCrop}
                className="w-full"
                size="lg"
              >
                Analyze Crop
              </Button>
            )}

            {isAnalyzing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Analyzing image...</span>
              </div>
            )}
          </Card>

          {result && (
            <div className="space-y-4">
              {/* Listen Button - TTS */}
              <Card className="p-4 bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {language === 'hi' || language === 'mr' || language === 'pa' 
                        ? 'विश्लेषण सुनें' 
                        : 'Listen to Analysis'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {language === 'hi' || language === 'mr' || language === 'pa'
                        ? 'AI द्वारा पढ़ा गया सारांश'
                        : 'AI-read summary of findings'}
                    </p>
                  </div>
                  <Button
                    onClick={toggleAudio}
                    disabled={isLoadingAudio}
                    variant={isPlaying ? "destructive" : "default"}
                    size="lg"
                    className="min-w-[120px]"
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isPlaying ? (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5 mr-2" />
                        Listen
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Plant Identification Card */}
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Leaf className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">Plant Identified</h3>
                    <p className="text-xs text-muted-foreground mb-2">पौधे की पहचान</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">English</p>
                        <p className="font-semibold text-foreground">{result.plantNameEnglish || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">हिंदी</p>
                        <p className="font-semibold text-foreground">{result.plantNameHindi || 'अज्ञात'}</p>
                      </div>
                    </div>
                    
                    {result.scientificName && result.scientificName !== 'N/A' && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Scientific: {result.scientificName}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Disease Analysis Card */}
              <Card className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  {result.severity === 'Healthy' ? (
                    <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{result.disease}</h3>
                    {result.diseaseHindi && (
                      <p className="text-sm text-muted-foreground mb-2">{result.diseaseHindi}</p>
                    )}
                    <p className="text-sm text-muted-foreground mb-2">
                      Confidence: {result.confidence}
                    </p>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      result.severity === 'Healthy' 
                        ? 'bg-success/10 text-success' 
                        : result.severity === 'Mild' 
                        ? 'bg-warning/10 text-warning'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {result.severity}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 text-foreground">Treatment / उपचार</h4>
                  <p className="text-sm text-muted-foreground mb-2">{result.treatment}</p>
                  {result.treatmentHindi && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{result.treatmentHindi}</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 text-foreground">Prevention / रोकथाम</h4>
                  <p className="text-sm text-muted-foreground mb-2">{result.prevention}</p>
                  {result.preventionHindi && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{result.preventionHindi}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={toggleAudio}
                    disabled={isLoadingAudio}
                    variant="secondary"
                    className="flex-1"
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : isPlaying ? (
                      <VolumeX className="w-4 h-4 mr-2" />
                    ) : (
                      <Volume2 className="w-4 h-4 mr-2" />
                    )}
                    {isPlaying ? 'Stop' : 'Listen'}
                  </Button>
                  <Button 
                    onClick={reset}
                    variant="outline"
                    className="flex-1"
                  >
                    Scan Another
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

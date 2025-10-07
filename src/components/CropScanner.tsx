import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DiseaseResult {
  disease: string;
  confidence: string;
  severity: string;
  treatment: string;
  prevention: string;
}

export const CropScanner: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
      toast.success('Camera started');
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setImagePreview(imageData);
        stopCamera();
        toast.success('Image captured');
      }
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
        setImagePreview(event.target?.result as string);
        toast.success('Image uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeCrop = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-crop', {
        body: { image: imagePreview }
      });

      if (error) throw error;

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (showCamera) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Camera</h2>
          <Button variant="ghost" size="icon" onClick={stopCamera}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="w-full h-auto"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <Button 
          onClick={captureImage} 
          className="w-full"
          size="lg"
        >
          <Camera className="w-5 h-5 mr-2" />
          Capture Photo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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
                Detect crop diseases instantly with AI-powered analysis
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
              <p>2. Our AI will analyze the image for diseases</p>
              <p>3. Get instant diagnosis and treatment recommendations</p>
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
            <Card className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                {result.severity === 'Healthy' ? (
                  <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{result.disease}</h3>
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

              <div>
                <h4 className="font-semibold mb-2 text-foreground">Treatment</h4>
                <p className="text-sm text-muted-foreground">{result.treatment}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-foreground">Prevention</h4>
                <p className="text-sm text-muted-foreground">{result.prevention}</p>
              </div>

              <Button 
                onClick={reset}
                variant="outline"
                className="w-full"
              >
                Scan Another Crop
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

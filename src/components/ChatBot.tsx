import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  isSpeaking?: boolean;
}

// Check for browser support
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const ChatBot: React.FC = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t('askAnything'),
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Default to Indian English, supports Hindi too
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setInputMessage(transcript);
        
        // If final result, send the message
        if (event.results[0].isFinal) {
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use voice input.",
            variant: "destructive",
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const toggleListening = () => {
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        // Set language to auto-detect (supports multiple Indian languages)
        recognitionRef.current.lang = 'hi-IN'; // Hindi
        recognitionRef.current?.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now. You can speak in English, Hindi, or other languages.",
        });
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Error",
          description: "Could not start voice input. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const speakMessage = (messageId: string, content: string) => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    // Stop any currently playing speech
    window.speechSynthesis.cancel();

    if (speakingMessageId === messageId) {
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(messageId);

    try {
      // Detect language from content
      const hasHindi = /[\u0900-\u097F]/.test(content);
      const hasPunjabi = /[\u0A00-\u0A7F]/.test(content);
      const hasMarathi = /[\u0900-\u097F]/.test(content);
      
      let langCode = 'en-IN'; // Default to Indian English
      if (hasPunjabi) {
        langCode = 'pa-IN'; // Punjabi
      } else if (hasHindi || hasMarathi) {
        langCode = 'hi-IN'; // Hindi (also works for Marathi Devanagari script)
      }

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = langCode;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      // Get available voices and try to find a matching one
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => voice.lang.startsWith(langCode.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => {
        setSpeakingMessageId(null);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setSpeakingMessageId(null);
        toast({
          title: "Speech Error",
          description: "Could not speak the message. Please try again.",
          variant: "destructive",
        });
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error generating speech:', error);
      setSpeakingMessageId(null);
      toast({
        title: "Error",
        description: "Could not generate speech. Please try again.",
        variant: "destructive",
      });
    }
  };

  const quickQuestions = [
    t('bestTimeRice'),
    t('preventPests'),
    t('currentWeather'),
    t('soilHealthTips')
  ];

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get user location if available
      let userLat = null;
      let userLon = null;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: locationData } = await supabase
          .from('user_locations')
          .select('latitude, longitude')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (locationData) {
          userLat = locationData.latitude;
          userLon = locationData.longitude;
        }
      }

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: content.trim(),
          userId: user?.id,
          userLat,
          userLon
        }
      });

      if (error) {
        throw error;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">{t('aiAssistant')}</h2>
      </div>

      {/* Chat Messages */}
      <Card className="p-4 h-96 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            {message.isBot && (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isBot
                  ? 'bg-muted text-foreground'
                  : 'bg-primary text-white'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content.split('\n').map((line, idx) => (
                  <p key={idx} className={`${line.startsWith('•') ? 'pl-1 my-1' : 'my-2'}`}>
                    {line}
                  </p>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {message.isBot && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 ml-2 ${speakingMessageId === message.id ? 'text-primary' : ''}`}
                    onClick={() => speakMessage(message.id, message.content)}
                    title={speakingMessageId === message.id ? "Stop speaking" : "Speak this message"}
                  >
                    {speakingMessageId === message.id ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            {!message.isBot && (
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Quick Questions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 text-foreground">{t('quickQuestions')}</h3>
        <div className="space-y-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="w-full text-left p-3 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
              disabled={isLoading}
            >
              "{question}"
            </button>
          ))}
        </div>
      </Card>

      {/* Voice Status Indicator */}
      {isListening && (
        <Card className="p-3 bg-primary/10 border-primary">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">Listening... Speak now</span>
          </div>
        </Card>
      )}

      {/* Message Input */}
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleListening}
            disabled={isLoading}
            className="flex-shrink-0"
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t('askAboutFarming')}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          🎤 Click the mic to speak in English, Hindi, or other languages
        </p>
      </Card>
    </div>
  );
};

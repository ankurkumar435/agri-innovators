import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight, Droplets, Sun, Wind, Thermometer, Bug, Leaf } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FarmerTip {
  id: string;
  icon: React.ElementType;
  category: string;
  title: string;
  description: string;
  conditions?: string[];
}

const allTips: FarmerTip[] = [
  {
    id: 'irrigation-morning',
    icon: Droplets,
    category: 'Irrigation',
    title: 'Water Early Morning',
    description: 'Irrigate crops between 5-7 AM to minimize evaporation and allow foliage to dry before evening, reducing disease risk.',
    conditions: ['sunny', 'clear', 'hot']
  },
  {
    id: 'heat-protection',
    icon: Thermometer,
    category: 'Heat Management',
    title: 'Protect from Heat Stress',
    description: 'Apply mulch around plants to keep roots cool. Consider shade nets for sensitive crops during peak afternoon hours.',
    conditions: ['hot', 'sunny']
  },
  {
    id: 'rain-preparation',
    icon: Droplets,
    category: 'Rain Prep',
    title: 'Prepare for Rain',
    description: 'Ensure proper drainage in fields. Avoid fertilizer application before heavy rain to prevent nutrient runoff.',
    conditions: ['rain', 'cloudy', 'overcast']
  },
  {
    id: 'pest-monitoring',
    icon: Bug,
    category: 'Pest Control',
    title: 'Monitor for Pests',
    description: 'Warm, humid conditions favor pest activity. Inspect leaves undersides and stems for early signs of infestation.',
    conditions: ['humid', 'warm', 'cloudy']
  },
  {
    id: 'wind-spraying',
    icon: Wind,
    category: 'Spraying',
    title: 'Check Wind Before Spraying',
    description: 'Avoid pesticide or fertilizer spraying when wind exceeds 10 km/h to prevent drift and ensure even coverage.',
    conditions: ['windy']
  },
  {
    id: 'sunny-harvest',
    icon: Sun,
    category: 'Harvesting',
    title: 'Ideal Harvest Conditions',
    description: 'Sunny, dry weather is perfect for harvesting grains and vegetables. Harvest in the morning after dew evaporates.',
    conditions: ['sunny', 'clear']
  },
  {
    id: 'soil-moisture',
    icon: Leaf,
    category: 'Soil Care',
    title: 'Check Soil Moisture',
    description: 'Test soil moisture 4-6 inches deep. Water when soil feels dry at this depth, not based on surface appearance.',
    conditions: ['any']
  },
  {
    id: 'crop-rotation',
    icon: Leaf,
    category: 'Planning',
    title: 'Plan Crop Rotation',
    description: 'Rotate crops each season to prevent soil nutrient depletion and break pest/disease cycles naturally.',
    conditions: ['any']
  },
  {
    id: 'organic-matter',
    icon: Leaf,
    category: 'Soil Health',
    title: 'Add Organic Matter',
    description: 'Incorporate compost or green manure to improve soil structure, water retention, and beneficial microbe activity.',
    conditions: ['any']
  },
  {
    id: 'frost-protection',
    icon: Thermometer,
    category: 'Cold Protection',
    title: 'Frost Prevention',
    description: 'Cover sensitive crops with fabric or plastic before nightfall. Water soil in the afternoon to release heat at night.',
    conditions: ['cold', 'frost']
  }
];

export const FarmerTipsCard: React.FC = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [displayedTips, setDisplayedTips] = useState<FarmerTip[]>([]);

  useEffect(() => {
    // Shuffle and select 5 tips for display
    const shuffled = [...allTips].sort(() => Math.random() - 0.5);
    setDisplayedTips(shuffled.slice(0, 5));
  }, []);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % displayedTips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + displayedTips.length) % displayedTips.length);
  };

  // Auto-rotate tips every 8 seconds
  useEffect(() => {
    if (displayedTips.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % displayedTips.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [displayedTips.length]);

  if (displayedTips.length === 0) {
    return null;
  }

  const currentTip = displayedTips[currentTipIndex];
  const TipIcon = currentTip.icon;

  return (
    <Card className="bg-gradient-earth border-0 text-white p-4 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="font-semibold">Farmer Tips</h3>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={prevTip}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Previous tip"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs opacity-75 min-w-[3rem] text-center">
            {currentTipIndex + 1} / {displayedTips.length}
          </span>
          <button 
            onClick={nextTip}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Next tip"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TipIcon className="w-5 h-5 text-yellow-300" />
          <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
            {currentTip.category}
          </span>
        </div>
        
        <h4 className="font-semibold text-lg">{currentTip.title}</h4>
        
        <p className="text-sm opacity-90 leading-relaxed">
          {currentTip.description}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {displayedTips.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTipIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentTipIndex 
                ? 'bg-white w-4' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to tip ${index + 1}`}
          />
        ))}
      </div>
    </Card>
  );
};

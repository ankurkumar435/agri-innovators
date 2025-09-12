import React from 'react';
import { Cloud, CloudRain, Sun, Droplets, Wind } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const WeatherCard: React.FC = () => {
  const weatherData = {
    current: {
      temp: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      icon: Cloud
    },
    forecast: [
      { day: 'Today', temp: 28, icon: Cloud },
      { day: 'Tomorrow', temp: 26, icon: CloudRain },
      { day: 'Fri', temp: 30, icon: Sun },
      { day: 'Sat', temp: 29, icon: Cloud },
    ]
  };

  const CurrentIcon = weatherData.current.icon;

  return (
    <Card className="p-4 bg-gradient-sky border-0 text-white">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Weather Forecast</h3>
            <p className="text-sm opacity-90">Current conditions</p>
          </div>
          <CurrentIcon className="w-8 h-8" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{weatherData.current.temp}°C</div>
            <div className="text-sm opacity-90">{weatherData.current.condition}</div>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              <span>{weatherData.current.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4" />
              <span>{weatherData.current.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-2 border-t border-white/20">
          {weatherData.forecast.map((day) => {
            const DayIcon = day.icon;
            return (
              <div key={day.day} className="text-center">
                <div className="text-xs opacity-90">{day.day}</div>
                <DayIcon className="w-5 h-5 mx-auto my-1" />
                <div className="text-sm font-medium">{day.temp}°</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
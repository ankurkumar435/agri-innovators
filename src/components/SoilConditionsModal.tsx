import React, { useState, useEffect } from 'react';
import { X, Mountain, Droplets, Leaf, FlaskConical, RefreshCw, AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SoilConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NutrientData {
  value: number;
  unit: string;
  status: string;
  statusHindi: string;
  color: string;
  ideal: string;
  description?: string;
}

interface SoilData {
  success: boolean;
  location: {
    state: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  lastUpdated: string;
  soilProfile: {
    type: string;
    typeHindi: string;
    color: string;
    texture: string;
    fertility: string;
    fertilityHindi: string;
    waterRetention: string;
    drainage: string;
  };
  primaryNutrients: {
    pH: NutrientData;
    organicCarbon: NutrientData;
    nitrogen: NutrientData;
    phosphorus: NutrientData;
    potassium: NutrientData;
  };
  secondaryNutrients: {
    sulphur: NutrientData;
  };
  micronutrients: {
    zinc: NutrientData;
    iron: NutrientData;
    copper: NutrientData;
    manganese: NutrientData;
    boron: NutrientData;
  };
  recommendations: {
    suitableCrops: string[];
    suitableCropsHindi: string[];
    fertilizers: { name: string; nameHindi: string; dosage: string }[];
  };
  dataSource: string;
}

export const SoilConditionsModal: React.FC<SoilConditionsModalProps> = ({ isOpen, onClose }) => {
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSoilData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Get user's location
      const { data: locationData, error: locationError } = await supabase
        .from('user_locations')
        .select('latitude, longitude, city, region, country')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (locationError) throw locationError;

      const state = locationData?.region || 'Maharashtra';
      const city = locationData?.city || 'Mumbai';
      const latitude = locationData?.latitude || 19.076;
      const longitude = locationData?.longitude || 72.877;

      const { data, error: fetchError } = await supabase.functions.invoke('soil-conditions', {
        body: { state, city, latitude, longitude }
      });

      if (fetchError) throw fetchError;
      
      setSoilData(data);
    } catch (err: any) {
      console.error('Error fetching soil data:', err);
      setError(err.message || 'Failed to fetch soil conditions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSoilData();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const getStatusIcon = (color: string) => {
    switch (color) {
      case 'green':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'yellow':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'red':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'red':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const NutrientCard = ({ name, nameHindi, data }: { name: string; nameHindi: string; data: NutrientData }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        {getStatusIcon(data.color)}
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{nameHindi}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">
          {data.value} {data.unit}
        </p>
        <Badge className={`text-xs ${getStatusBadgeColor(data.color)}`}>
          {data.status}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-earth text-white">
          <div className="flex items-center gap-3">
            <Mountain className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Soil Conditions</h2>
              <p className="text-sm opacity-90">मृदा की स्थिति</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchSoilData}
              disabled={loading}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
              <p className="text-muted-foreground">Analyzing soil conditions...</p>
              <p className="text-sm text-muted-foreground">मृदा की स्थिति का विश्लेषण...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={fetchSoilData} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {soilData && !loading && (
            <>
              {/* Location Info */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {soilData.location.city}, {soilData.location.state}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Data Source: {soilData.dataSource} | Last Updated: {new Date(soilData.lastUpdated).toLocaleString('en-IN')}
                </p>
              </Card>

              {/* Soil Profile */}
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-primary" />
                  Soil Profile / मृदा प्रोफाइल
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Soil Type / मृदा प्रकार</p>
                    <p className="text-sm font-medium text-foreground">{soilData.soilProfile.type}</p>
                    <p className="text-xs text-muted-foreground">{soilData.soilProfile.typeHindi}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Color / रंग</p>
                    <p className="text-sm font-medium text-foreground">{soilData.soilProfile.color}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Texture / बनावट</p>
                    <p className="text-sm font-medium text-foreground">{soilData.soilProfile.texture}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Fertility / उर्वरता</p>
                    <p className="text-sm font-medium text-foreground">{soilData.soilProfile.fertility}</p>
                    <p className="text-xs text-muted-foreground">{soilData.soilProfile.fertilityHindi}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Water Retention / जल धारण</p>
                    <p className="text-sm font-medium text-foreground">{soilData.soilProfile.waterRetention}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Drainage / जल निकासी</p>
                    <p className="text-sm font-medium text-foreground">{soilData.soilProfile.drainage}</p>
                  </div>
                </div>
              </Card>

              {/* Primary Nutrients (NPK) */}
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-primary" />
                  Primary Nutrients (NPK) / प्राथमिक पोषक तत्व
                </h3>
                <div className="space-y-2">
                  <NutrientCard name="pH Level" nameHindi="पीएच स्तर" data={soilData.primaryNutrients.pH} />
                  <NutrientCard name="Organic Carbon" nameHindi="जैविक कार्बन" data={soilData.primaryNutrients.organicCarbon} />
                  <NutrientCard name="Nitrogen (N)" nameHindi="नाइट्रोजन" data={soilData.primaryNutrients.nitrogen} />
                  <NutrientCard name="Phosphorus (P)" nameHindi="फॉस्फोरस" data={soilData.primaryNutrients.phosphorus} />
                  <NutrientCard name="Potassium (K)" nameHindi="पोटैशियम" data={soilData.primaryNutrients.potassium} />
                </div>
              </Card>

              {/* Micronutrients */}
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  Micronutrients / सूक्ष्म पोषक तत्व
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <NutrientCard name="Sulphur (S)" nameHindi="सल्फर" data={soilData.secondaryNutrients.sulphur} />
                  <NutrientCard name="Zinc (Zn)" nameHindi="जिंक" data={soilData.micronutrients.zinc} />
                  <NutrientCard name="Iron (Fe)" nameHindi="लोहा" data={soilData.micronutrients.iron} />
                  <NutrientCard name="Copper (Cu)" nameHindi="तांबा" data={soilData.micronutrients.copper} />
                  <NutrientCard name="Manganese (Mn)" nameHindi="मैंगनीज" data={soilData.micronutrients.manganese} />
                  <NutrientCard name="Boron (B)" nameHindi="बोरान" data={soilData.micronutrients.boron} />
                </div>
              </Card>

              {/* Suitable Crops */}
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  Suitable Crops / उपयुक्त फसलें
                </h3>
                <div className="flex flex-wrap gap-2">
                  {soilData.recommendations.suitableCrops.map((crop, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {crop} / {soilData.recommendations.suitableCropsHindi[index]}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Fertilizer Recommendations */}
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-primary" />
                  Fertilizer Recommendations / उर्वरक सिफारिशें
                </h3>
                <div className="space-y-2">
                  {soilData.recommendations.fertilizers.map((fertilizer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">{fertilizer.name}</p>
                        <p className="text-xs text-muted-foreground">{fertilizer.nameHindi}</p>
                      </div>
                      <Badge variant="outline">{fertilizer.dosage}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

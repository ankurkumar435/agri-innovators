import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, MapPin, Ruler } from 'lucide-react';
import { computePolygonAreaAcres } from '@/hooks/useFarmerFields';

interface LatLng { lat: number; lng: number }

interface FieldMapPickerProps {
  initialPolygon?: LatLng[];
  initialCenter?: LatLng;
  onChange: (polygon: LatLng[]) => void;
}

const GMAPS_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
const CHANNEL = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

let mapsLoader: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if ((window as any).google?.maps?.drawing) return Promise.resolve();
  if (mapsLoader) return mapsLoader;
  mapsLoader = new Promise((resolve, reject) => {
    (window as any).__initGMap = () => resolve();
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=drawing,geometry&loading=async&callback=__initGMap&channel=${CHANNEL}`;
    s.async = true;
    s.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(s);
  });
  return mapsLoader;
}

export const FieldMapPicker: React.FC<FieldMapPickerProps> = ({ initialPolygon, initialCenter, onChange }) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const drawingMgrRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [livePolygon, setLivePolygon] = useState<LatLng[]>(initialPolygon || []);
  const [vertexCount, setVertexCount] = useState<number>(initialPolygon?.length || 0);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapEl.current) return;
        const google = (window as any).google;
        const center = initialCenter || (initialPolygon?.[0]) || { lat: 20.5937, lng: 78.9629 };
        const map = new google.maps.Map(mapEl.current, {
          center,
          zoom: initialPolygon ? 17 : 5,
          mapTypeId: 'hybrid',
          tilt: 0,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            mapTypeIds: ['hybrid', 'satellite', 'roadmap'],
          },
        });
        mapRef.current = map;

        const setPolygon = (path: LatLng[]) => {
          if (polygonRef.current) polygonRef.current.setMap(null);
          const poly = new google.maps.Polygon({
            paths: path,
            editable: true,
            draggable: false,
            fillColor: '#22c55e',
            fillOpacity: 0.35,
            strokeColor: '#16a34a',
            strokeWeight: 2,
          });
          poly.setMap(map);
          polygonRef.current = poly;

          const emit = () => {
            const arr = poly.getPath().getArray().map((p: any) => ({ lat: p.lat(), lng: p.lng() }));
            onChange(arr);
          };
          google.maps.event.addListener(poly.getPath(), 'set_at', emit);
          google.maps.event.addListener(poly.getPath(), 'insert_at', emit);
          google.maps.event.addListener(poly.getPath(), 'remove_at', emit);
          emit();
        };

        if (initialPolygon && initialPolygon.length >= 3) {
          setPolygon(initialPolygon);
        }

        const drawingMgr = new google.maps.drawing.DrawingManager({
          drawingMode: initialPolygon ? null : google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.POLYGON],
          },
          polygonOptions: {
            fillColor: '#22c55e',
            fillOpacity: 0.35,
            strokeColor: '#16a34a',
            strokeWeight: 2,
            editable: true,
          },
        });
        drawingMgr.setMap(map);
        drawingMgrRef.current = drawingMgr;

        google.maps.event.addListener(drawingMgr, 'polygoncomplete', (poly: any) => {
          drawingMgr.setDrawingMode(null);
          const path = poly.getPath().getArray().map((p: any) => ({ lat: p.lat(), lng: p.lng() }));
          poly.setMap(null);
          setPolygon(path);
        });

        // Try to center on user's current GPS if no polygon yet
        if (!initialPolygon && !initialCenter && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              map.setZoom(18);
            },
            () => {},
            { enableHighAccuracy: true, timeout: 8000 }
          );
        }

        setReady(true);
      })
      .catch((e) => setError(e.message));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearPolygon = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    onChange([]);
    if (drawingMgrRef.current) {
      const google = (window as any).google;
      drawingMgrRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapRef.current.setZoom(18);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (!GMAPS_KEY) {
    return (
      <div className="p-4 text-sm text-destructive">
        Google Maps key missing. Connect Google Maps Platform in project settings.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden border border-border" style={{ height: 360 }}>
        <div ref={mapEl} className="w-full h-full" />
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={useMyLocation}>
          <MapPin className="w-4 h-4 mr-1" /> My location
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={clearPolygon}>
          <Trash2 className="w-4 h-4 mr-1" /> Clear & redraw
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Tap points on the satellite map to outline your field. Drag vertices to adjust.
      </p>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FieldMapPicker } from '@/components/FieldMapPicker';
import { COMMON_CROPS, GROWTH_STAGES, computeCentroid, computePolygonAreaAcres, FarmerField, FarmerFieldInput } from '@/hooks/useFarmerFields';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: FarmerField | null;
  onSave: (input: FarmerFieldInput, id?: string) => Promise<void>;
}

export const FieldEditorDialog: React.FC<Props> = ({ open, onOpenChange, existing, onSave }) => {
  const { toast } = useToast();
  const [polygon, setPolygon] = useState<{ lat: number; lng: number }[]>([]);
  const [name, setName] = useState('');
  const [crop, setCrop] = useState<string>('');
  const [stage, setStage] = useState<string>('');
  const [sowingDate, setSowingDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPolygon(existing?.polygon || []);
      setName(existing?.name || '');
      setCrop(existing?.crop || '');
      setStage(existing?.growth_stage || '');
      setSowingDate(existing?.sowing_date || '');
      setHarvestDate(existing?.expected_harvest_date || '');
      setNotes(existing?.notes || '');
    }
  }, [open, existing]);

  const area = computePolygonAreaAcres(polygon);

  const handleSave = async () => {
    if (!name.trim()) { toast({ title: 'Enter a field name', variant: 'destructive' }); return; }
    if (polygon.length < 3) { toast({ title: 'Draw a field on the map', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const center = computeCentroid(polygon);
      await onSave({
        name: name.trim(),
        polygon,
        area_acres: Number(area.toFixed(3)),
        center_lat: center.lat,
        center_lng: center.lng,
        crop: crop || null,
        growth_stage: stage || null,
        sowing_date: sowingDate || null,
        expected_harvest_date: harvestDate || null,
        notes: notes || null,
      }, existing?.id);
      toast({ title: existing ? 'Field updated' : 'Field saved' });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit field' : 'Add a new field'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <FieldMapPicker
            initialPolygon={existing?.polygon}
            initialCenter={existing ? { lat: existing.center_lat, lng: existing.center_lng } : undefined}
            onChange={setPolygon}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium">Field name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. North field" />
            </div>

            <div>
              <label className="text-sm font-medium">Crop</label>
              <Select value={crop} onValueChange={setCrop}>
                <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                <SelectContent>
                  {COMMON_CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Growth stage</label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                <SelectContent>
                  {GROWTH_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Sowing date</label>
              <Input type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Expected harvest</label>
              <Input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>

            <div className="col-span-2 flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Calculated area</span>
              <span className="font-semibold">{area.toFixed(2)} acres</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save field'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

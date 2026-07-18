import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Edit, Trash2, Sprout, Leaf, Ruler, Locate } from 'lucide-react';
import { useFarmerFields, FarmerField, computePolygonAreaAcres } from '@/hooks/useFarmerFields';
import { FieldEditorDialog } from '@/components/FieldEditorDialog';
import { useActiveLocation } from '@/hooks/useActiveLocation';
import { useToast } from '@/hooks/use-toast';

export const MyFieldsCard: React.FC = () => {
  const { fields, loading, addField, updateField, deleteField } = useFarmerFields();
  const { activeFieldId, pinToField, clearPin } = useActiveLocation();
  const { toast } = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<FarmerField | null>(null);

  const openNew = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (f: FarmerField) => { setEditing(f); setEditorOpen(true); };

  const handleSave = async (input: any, id?: string) => {
    if (id) await updateField(id, input);
    else await addField(input);
  };

  const handleDelete = async (f: FarmerField) => {
    if (!confirm(`Delete field "${f.name}"?`)) return;
    try {
      await deleteField(f.id);
      if (activeFieldId === f.id) clearPin();
      toast({ title: 'Field deleted' });
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    }
  };

  const handlePin = async (f: FarmerField) => {
    try {
      await pinToField(f);
      toast({
        title: 'Location set to field',
        description: `Weather, soil, pest alerts and AI advice now use "${f.name}" (${Number(f.area_acres).toFixed(2)} acres).`,
      });
    } catch (e: any) {
      toast({ title: 'Could not set location', description: e.message, variant: 'destructive' });
    }
  };

  const handleUnpin = () => {
    clearPin();
    toast({ title: 'Switched back to GPS location' });
  };

  const totalAcres = fields.reduce((s, f) => s + Number(f.area_acres || 0), 0);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" /> My Fields
          </h3>
          <p className="text-xs text-muted-foreground">
            {fields.length} field{fields.length !== 1 ? 's' : ''} · {totalAcres.toFixed(2)} acres total
          </p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="w-4 h-4 mr-1" /> Add field
        </Button>
      </div>

      {activeFieldId && (
        <div className="mb-3 p-2 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-between gap-2">
          <p className="text-xs text-primary flex items-center gap-1">
            <Locate className="w-3.5 h-3.5" /> Using a field as your location
          </p>
          <Button size="sm" variant="ghost" onClick={handleUnpin} className="h-7 text-xs">
            Use GPS instead
          </Button>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>}

      {!loading && fields.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No fields yet. Tap "Add field" to draw your first field on the satellite map.
        </div>
      )}

      <div className="space-y-2">
        {fields.map((f) => {
          const isActive = activeFieldId === f.id;
          const acres = Number(f.area_acres) || computePolygonAreaAcres(f.polygon || []);
          return (
            <div
              key={f.id}
              className={`p-3 rounded-lg border bg-card ${isActive ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{f.name}</p>
                    {isActive && (
                      <Badge className="text-[10px] h-4 px-1.5">Active location</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      <Ruler className="w-3 h-3 mr-1" />
                      {acres.toFixed(2)} acres
                    </Badge>
                    {f.crop && <Badge variant="outline" className="text-xs"><Leaf className="w-3 h-3 mr-1" />{f.crop}</Badge>}
                    {f.growth_stage && <Badge variant="outline" className="text-xs">{f.growth_stage}</Badge>}
                    <Badge variant="outline" className="text-xs">
                      {(f.polygon?.length || 0)} boundary points
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Centroid: {f.center_lat.toFixed(4)}°, {f.center_lng.toFixed(4)}°
                  </p>
                  {(f.sowing_date || f.expected_harvest_date) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {f.sowing_date && <>Sown: {f.sowing_date}</>}
                      {f.sowing_date && f.expected_harvest_date && ' · '}
                      {f.expected_harvest_date && <>Harvest: {f.expected_harvest_date}</>}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(f)} title="Edit field & boundary">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(f)} title="Delete field">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <Button
                  size="sm"
                  variant={isActive ? 'secondary' : 'outline'}
                  className="w-full"
                  onClick={() => (isActive ? handleUnpin() : handlePin(f))}
                >
                  <Locate className="w-4 h-4 mr-1" />
                  {isActive ? 'Currently used as location — switch to GPS' : 'Use this field as my location'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <FieldEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        existing={editing}
        onSave={handleSave}
      />
    </Card>
  );
};


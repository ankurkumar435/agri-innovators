import React, { useState } from 'react';
import { Plus, Clock, MapPin, Check, Play, Pause, Trash2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFarmerActivities, CreateActivityInput } from '@/hooks/useFarmerActivities';

const statusConfig = {
  pending: { 
    icon: Pause, 
    color: 'bg-muted text-muted-foreground',
    label: 'Pending'
  },
  active: { 
    icon: Play, 
    color: 'bg-primary/20 text-primary',
    label: 'In Progress'
  },
  completed: { 
    icon: Check, 
    color: 'bg-green-500/20 text-green-600',
    label: 'Completed'
  }
};

export function TodayActivities() {
  const { activities, loading, createActivity, deleteActivity, toggleStatus } = useFarmerActivities();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateActivityInput>({
    title: '',
    description: '',
    location: '',
    scheduled_time: '08:00'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    await createActivity(formData);
    setFormData({ title: '', description: '', location: '', scheduled_time: '08:00' });
    setIsDialogOpen(false);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Today's Activities</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Morning Field Inspection"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Check irrigation system"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., North Field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time *</label>
                  <Input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Add Activity</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {activities.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-3">No activities scheduled for today</p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add your first activity
          </Button>
        </Card>
      ) : (
        activities.map((activity) => {
          const StatusIcon = statusConfig[activity.status].icon;
          
          return (
            <Card 
              key={activity.id} 
              className={`p-4 border-l-4 transition-all ${
                activity.status === 'completed' 
                  ? 'border-l-green-500 opacity-75' 
                  : activity.status === 'active'
                  ? 'border-l-primary'
                  : 'border-l-muted-foreground'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${activity.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {activity.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[activity.status].color}`}>
                      {statusConfig[activity.status].label}
                    </span>
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(activity.scheduled_time)}
                    </span>
                    {activity.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {activity.location}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleStatus(activity.id)}
                  >
                    <StatusIcon className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteActivity(activity.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

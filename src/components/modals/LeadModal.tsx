import { useState, useEffect } from 'react';
import { useCRM, Lead } from '@/context/CRMContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, DollarSign, Target } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  leadId?: string | null;
}

const leadStatuses = ['New', 'Contacted', 'Converted', 'Lost'] as const;

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  customerId,
  leadId,
}) => {
  const { leads, addLead, updateLead, loading } = useCRM();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'New' as Lead['status'],
    value: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!leadId;
  const lead = isEditing ? leads.find(l => l._id === leadId) : null;

  useEffect(() => {
    if (isOpen) {
      if (lead) {
        setFormData({
          title: lead.title,
          description: lead.description || '',
          status: lead.status,
          value: lead.value,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'New',
          value: 0,
        });
      }
      setErrors({});
    }
  }, [isOpen, lead]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (formData.value < 0) {
      newErrors.value = 'Value must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isEditing && leadId) {
        await updateLead(leadId, formData);
      } else {
        await addLead({
          ...formData,
          customerId,
        });
      }
      onClose();
    } catch (error) {
      // Error is handled by the CRM context
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'text-blue-600';
      case 'Contacted': return 'text-yellow-600';
      case 'Converted': return 'text-green-600';
      case 'Lost': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Lead' : 'Add Lead'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the lead information below.'
              : 'Add a new lead for this customer. Required fields are marked with *'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-danger">*</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="title"
                type="text"
                placeholder="Enter lead title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`pl-10 ${errors.title ? 'border-danger' : ''}`}
              />
            </div>
            {errors.title && (
              <p className="text-sm text-danger">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter lead description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-danger">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger className={errors.status ? 'border-danger' : ''}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {leadStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center space-x-2">
                      <Target className={`h-4 w-4 ${getStatusColor(status)}`} />
                      <span>{status}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-danger">{errors.status}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter lead value"
                value={formData.value || ''}
                onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                className={`pl-10 ${errors.value ? 'border-danger' : ''}`}
              />
            </div>
            {errors.value && (
              <p className="text-sm text-danger">{errors.value}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="crm-hero-gradient"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>{isEditing ? 'Updating...' : 'Adding...'}</span>
                </div>
              ) : (
                isEditing ? 'Update Lead' : 'Add Lead'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
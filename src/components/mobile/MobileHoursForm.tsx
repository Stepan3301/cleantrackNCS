import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { dateUtils } from '@/lib/utils/date';

interface MobileHoursFormProps {
  onSubmit: (data: HoursFormData) => void;
  initialDate?: string;
  isLoading?: boolean;
}

interface HoursFormData {
  date: string;
  hours: number;
  location: string;
  description: string;
}

export const MobileHoursForm: React.FC<MobileHoursFormProps> = ({
  onSubmit,
  initialDate,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<HoursFormData>({
    date: initialDate || dateUtils.getCurrentDateString(),
    hours: 0,
    location: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.hours || formData.hours <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    }

    if (formData.hours > 24) {
      newErrors.hours = 'Hours cannot exceed 24';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof HoursFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mobile-form space-y-6">
      <div className="mobile-form-group">
        <label className="mobile-form-label flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className={`mobile-form-input ${errors.date ? 'border-red-500' : ''}`}
          max={dateUtils.getCurrentDateString()}
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date}</p>
        )}
      </div>

      <div className="mobile-form-group">
        <label className="mobile-form-label flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Hours Worked
        </label>
        <input
          type="number"
          value={formData.hours || ''}
          onChange={(e) => handleInputChange('hours', parseFloat(e.target.value) || 0)}
          className={`mobile-form-input ${errors.hours ? 'border-red-500' : ''}`}
          placeholder="Enter hours worked"
          min="0"
          max="24"
          step="0.5"
        />
        {errors.hours && (
          <p className="text-red-500 text-sm mt-1">{errors.hours}</p>
        )}
      </div>

      <div className="mobile-form-group">
        <label className="mobile-form-label flex items-.center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className={`mobile-form-input ${errors.location ? 'border-red-500' : ''}`}
          placeholder="Enter work location"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location}</p>
        )}
      </div>

      <div className="mobile-form-group">
        <label className="mobile-form-label flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="mobile-form-input mobile-form-textarea"
          placeholder="Describe the work performed (optional)"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="mobile-button mobile-button-primary w-full"
      >
        {isLoading ? 'Submitting...' : 'Submit Hours'}
      </Button>
    </form>
  );
}; 
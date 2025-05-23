import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface HoursEntryFormProps {
  date?: Date;
  hoursWorked?: number;
  setHoursWorked?: (value: number) => void;
  location?: string;
  setLocation?: (value: string) => void;
  description?: string;
  setDescription?: (value: string) => void;
  onSubmit: (hours: number, location: string, description?: string) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  onDescriptionChange?: (value: string) => void;
}

const HoursEntryForm: React.FC<HoursEntryFormProps> = ({
  date,
  hoursWorked,
  setHoursWorked,
  location: locationProp,
  setLocation,
  description: descriptionProp,
  setDescription,
  onSubmit,
  onCancel,
  isSubmitting,
  readOnly = false,
  loading = false,
  onDescriptionChange,
}) => {
  // Use strings for all form inputs initially
  const [formData, setFormData] = useState({
    hours: hoursWorked?.toString() || '',
    location: locationProp || '',
    description: descriptionProp || ''
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({
    hours: '',
    location: ''
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Call specific setter functions if provided
    if (name === 'hours' && setHoursWorked) {
      setHoursWorked(Number(value) || 0);
    } else if (name === 'location' && setLocation) {
      setLocation(value);
    } else if (name === 'description') {
      if (setDescription) {
        setDescription(value);
      }
      if (onDescriptionChange) {
        onDescriptionChange(value);
      }
    }
  };

  // Validate the form data
  const validateForm = () => {
    const newErrors = {
      hours: '',
      location: ''
    };
    
    let isValid = true;
    
    // Validate hours
    if (!formData.hours.trim()) {
      newErrors.hours = 'Hours is required';
      isValid = false;
    } else {
      const hoursNum = Number(formData.hours);
      if (isNaN(hoursNum)) {
        newErrors.hours = 'Hours must be a valid number';
        isValid = false;
      } else if (hoursNum <= 0 || hoursNum > 24) {
        newErrors.hours = 'Hours must be between 0 and 24';
        isValid = false;
      }
    }
    
    // Validate location
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    // Convert hours to number and submit
    const hoursNum = Number(formData.hours);
    
    // Debug logging to see what's being submitted
    console.log('Submitting hours:', {
      hours: hoursNum,
      location: formData.location.trim(),
      description: formData.description.trim() || undefined
    });
    
    // Call the onSubmit handler with properly typed values
    onSubmit(
      hoursNum, 
      formData.location.trim(),
      formData.description.trim() || undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hours">Hours Worked</Label>
        <Input
          id="hours"
          name="hours"
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={formData.hours}
          onChange={handleChange}
          placeholder="Enter hours worked"
          required
          className={errors.hours ? "border-red-500" : ""}
          aria-invalid={!!errors.hours}
          disabled={readOnly}
        />
        {errors.hours && (
          <p className="text-sm font-medium text-red-500">{errors.hours}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter location"
          required
          className={errors.location ? "border-red-500" : ""}
          aria-invalid={!!errors.location}
          disabled={readOnly}
        />
        {errors.location && (
          <p className="text-sm font-medium text-red-500">{errors.location}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what you worked on"
          rows={3}
          className="resize-none"
          disabled={readOnly}
        />
      </div>
      
      <div className="flex gap-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        
        <Button 
          type="submit" 
          disabled={loading || isSubmitting || readOnly || !formData.hours || !formData.location}
          className={onCancel ? "flex-1" : "w-full"}
        >
          {loading || isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Hours'
          )}
        </Button>
      </div>
    </form>
  );
};

export default HoursEntryForm;

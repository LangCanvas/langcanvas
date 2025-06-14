
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedFormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'textarea' | 'number';
  placeholder?: string;
  description?: string;
  error?: string;
  warning?: string;
  success?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
}

const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  description,
  error,
  warning,
  success,
  required,
  rows = 3,
  className
}) => {
  const hasError = !!error;
  const hasWarning = !!warning;
  const hasSuccess = success && !hasError && !hasWarning;

  const getFieldState = () => {
    if (hasError) return 'error';
    if (hasWarning) return 'warning';
    if (hasSuccess) return 'success';
    return 'default';
  };

  const fieldState = getFieldState();

  const getFieldClasses = () => {
    const baseClasses = "transition-all duration-200";
    switch (fieldState) {
      case 'error':
        return cn(baseClasses, "border-red-500 focus:ring-red-500 focus:border-red-500");
      case 'warning':
        return cn(baseClasses, "border-orange-500 focus:ring-orange-500 focus:border-orange-500");
      case 'success':
        return cn(baseClasses, "border-green-500 focus:ring-green-500 focus:border-green-500");
      default:
        return baseClasses;
    }
  };

  const renderField = () => {
    const commonProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
      placeholder,
      className: cn(getFieldClasses(), className)
    };

    switch (type) {
      case 'textarea':
        return <Textarea {...commonProps} rows={rows} />;
      case 'number':
        return <Input {...commonProps} type="number" />;
      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label className={cn(
          "text-sm font-medium",
          hasError && "text-red-700",
          hasWarning && "text-orange-700",
          hasSuccess && "text-green-700"
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {hasSuccess && <CheckCircle2 className="w-4 h-4 text-green-500" />}
      </div>
      
      {renderField()}
      
      {description && (
        <p className="text-xs text-gray-600">{description}</p>
      )}
      
      {(error || warning) && (
        <div className={cn(
          "flex items-start space-x-2 text-xs",
          hasError && "text-red-600",
          hasWarning && "text-orange-600"
        )}>
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{error || warning}</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedFormField;

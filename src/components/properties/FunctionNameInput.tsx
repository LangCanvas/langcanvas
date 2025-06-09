
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FunctionNameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const FunctionNameInput: React.FC<FunctionNameInputProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="function-name">Function Name</Label>
      <Input
        id="function-name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., check_user_role"
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <p className="text-xs text-gray-500">
        Python function name (snake_case). Skeleton will be generated automatically.
      </p>
    </div>
  );
};

export default FunctionNameInput;

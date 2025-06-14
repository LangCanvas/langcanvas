
import { useState, useEffect, useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

interface ValidationRule {
  field: string;
  validator: (value: any, node: EnhancedNode) => { isValid: boolean; message?: string; warning?: string };
}

interface ValidationResult {
  [field: string]: {
    isValid: boolean;
    error?: string;
    warning?: string;
  };
}

export const useRealTimeFormValidation = (node: EnhancedNode, rules: ValidationRule[]) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback((field: string, value: any) => {
    const rule = rules.find(r => r.field === field);
    if (!rule) return { isValid: true };

    return rule.validator(value, node);
  }, [rules, node]);

  const validateAllFields = useCallback(() => {
    setIsValidating(true);
    const results: ValidationResult = {};

    rules.forEach(rule => {
      const fieldValue = getFieldValue(node, rule.field);
      const result = rule.validator(fieldValue, node);
      results[rule.field] = result;
    });

    setValidationResult(results);
    setIsValidating(false);
  }, [rules, node]);

  const getFieldValue = (node: EnhancedNode, field: string): any => {
    const fieldParts = field.split('.');
    let value: any = node;
    
    for (const part of fieldParts) {
      value = value?.[part];
    }
    
    return value;
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      validateAllFields();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [validateAllFields]);

  const getFieldValidation = (field: string) => {
    return validationResult[field] || { isValid: true };
  };

  const isFormValid = Object.values(validationResult).every(result => result.isValid);

  return {
    validateField,
    validateAllFields,
    getFieldValidation,
    isValidating,
    isFormValid,
    validationResult
  };
};

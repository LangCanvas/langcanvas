
// Python keywords that cannot be used as function names
const PYTHON_KEYWORDS = [
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import',
  'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while',
  'with', 'yield'
];

export const validatePythonFunctionName = (name: string): { isValid: boolean; error?: string } => {
  // Check if empty
  if (!name.trim()) {
    return { isValid: false, error: 'Function name cannot be empty' };
  }

  // Check snake_case pattern (letters, numbers, underscores, must start with letter or underscore)
  const snakeCaseRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!snakeCaseRegex.test(name)) {
    return { isValid: false, error: 'Function name must use snake_case (letters, numbers, underscores only, cannot start with number)' };
  }

  // Check if it's a Python keyword
  if (PYTHON_KEYWORDS.includes(name)) {
    return { isValid: false, error: `'${name}' is a Python keyword and cannot be used as a function name` };
  }

  // Check length (reasonable limit)
  if (name.length > 50) {
    return { isValid: false, error: 'Function name is too long (maximum 50 characters)' };
  }

  return { isValid: true };
};

export const formatToPythonSnakeCase = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
};

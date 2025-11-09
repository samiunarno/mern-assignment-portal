
export const validateStudentSubmissionFile = (file: File): string | null => {
  // Check 1: File type must be PDF.
  // The 'accept=".pdf"' on the input element helps, but this is a fallback.
  if (file.type !== 'application/pdf') {
    return 'Invalid file type. Only PDF files are accepted.';
  }

  // Check 2: Filename must end with '.pdf' (case-insensitive).
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return "Invalid filename. It must end with the '.pdf' extension.";
  }

  // Extract the name part of the filename.
  const nameWithoutExt = file.name.slice(0, file.name.length - 4);

  // Check 3: The name part cannot be empty.
  if (nameWithoutExt.length === 0) {
    return "Invalid filename. The name cannot be empty before the '.pdf' extension.";
  }

  // Check 4: The name part must contain only Chinese characters.
  const chineseCharRegex = /^[\u4E00-\u9FFF]+$/;
  if (!chineseCharRegex.test(nameWithoutExt)) {
    return 'Invalid filename. The name must contain only Chinese characters (e.g., 王小明). English letters, numbers, and spaces are not allowed.';
  }
  
  // All checks passed
  return null;
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};
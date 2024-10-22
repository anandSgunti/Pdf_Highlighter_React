import React, { ReactNode, useEffect, useState, useCallback } from "react";


import {GlobalWorkerOptions, getDocument, PDFDocumentProxy } from "pdfjs-dist";
import { pdfjs } from 'react-pdf';

// Set the worker source for PDF.js
GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


// Set the worker source for PDF.js
// pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;


const DEFAULT_BEFORE_LOAD = (progress: { loaded: number; total: number }) => (
  <div style={{ color: "black" }}>
    Loading {Math.floor((progress.loaded / progress.total) * 100)}%
  </div>
);

const DEFAULT_ERROR_MESSAGE = (error: Error) => (
  <div style={{ color: "black" }}>{error.message}</div>
);

interface PdfLoaderProps {
  document?: string | Uint8Array; // Document can be a URL or binary data
  beforeLoad?: (progress: { loaded: number; total: number }) => ReactNode;
  onError?: (error: Error) => ReactNode;
  onProgress?: (progressData: { loaded: number; total: number }) => void;
  children: (pdfDocument: PDFDocumentProxy) => ReactNode;
}
export type { PdfLoaderProps };
export const PdfLoader: React.FC<PdfLoaderProps> = ({
  document,
  beforeLoad = DEFAULT_BEFORE_LOAD,
  onError = DEFAULT_ERROR_MESSAGE,
  onProgress,
  children,
}) => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [loadingError, setLoadingError] = useState<Error | null>(null);
  const [file, setFile] = useState<Uint8Array | null>(null);
  const [doiUrl, setDoiUrl] = useState<string>("");

  // Function to load the document
  const loadDocument = useCallback(async () => {
    if (!document && !file && !doiUrl) return; // Prevents loading when no file or DOI

    setLoadingError(null);

    try {
      const pdfSource = file ? { data: file } : doiUrl || document; // Use the appropriate source
      const loadingTask = getDocument(pdfSource);

      if (onProgress) {
        loadingTask.onProgress = onProgress;
      }

      const loadedPdf = await loadingTask.promise; // Await the PDF loading
      setPdfDocument(loadedPdf); // Set the loaded PDF document
    } catch (error) {
      setLoadingError(error as Error); // Set the error state
      onError(error as Error); // Invoke the error handler
    }
  }, [document, file, doiUrl, onProgress, onError]);

  // Effect to reload the document when any input changes
  useEffect(() => {
    loadDocument(); // Call the loadDocument function
  }, [document, file, doiUrl, loadDocument]);

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result instanceof ArrayBuffer) {
          setFile(new Uint8Array(result)); // Convert ArrayBuffer to Uint8Array
          setDoiUrl(""); // Reset DOI input when a file is uploaded
        }
      };
      reader.readAsArrayBuffer(uploadedFile); // Read the file as ArrayBuffer
    }
  };

  // DOI/URL input change handler
  const handleDoiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setDoiUrl(value); // Set the DOI/URL state
    setFile(null); // Reset file if DOI is entered
  };

  return (
    <div>
      {/* PDF File Upload */}
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      
      {/* DOI or URL Input */}
      <input
        type="text"
        placeholder="Enter DOI or PDF URL"
        value={doiUrl}
        onChange={handleDoiChange}
        style={{ marginLeft: "10px" }}
      />

      {/* Loader and Error Display */}
      <div style={{ marginTop: "20px" }}>
        {loadingError ? (
          onError(loadingError) // Display error message
        ) : pdfDocument ? (
          children(pdfDocument) // Render children with loaded PDF
        ) : (
          beforeLoad({ loaded: 0, total: 100 }) // Show loading message
        )}
      </div>
    </div>
  );
};

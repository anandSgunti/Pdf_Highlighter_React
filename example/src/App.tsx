import React, { MouseEvent, useEffect, useRef, useState } from "react";
import CommentForm from "./CommentForm";
import ContextMenu, { ContextMenuProps } from "./ContextMenu";
import ExpandableTip from "./ExpandableTip";
import HighlightContainer from "./HighlightContainer";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import SidebarComponent from "./chatbot";

import {
  GhostHighlight,
  Highlight,
  PdfHighlighter,
  PdfHighlighterUtils,
  PdfLoader,
  Tip,
  ViewportHighlight,
} from "./react-pdf-highlighter-extended";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
import { CommentedHighlight } from "./types";

const TEST_HIGHLIGHTS = _testHighlights;
const PRIMARY_PDF_URL = "1 García-Carmona.pdf"; // This can be removed since we are focusing on file uploads only.

const getNextId = () => String(Math.random()).slice(2);
const toggleDocument = () => {}
const parseIdFromHash = () => {
  return document.location.hash.slice("#highlight-".length);
};

const resetHash = () => {
  document.location.hash = "";
};

const App = () => {
  const [highlights, setHighlights] = useState<Array<CommentedHighlight>>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuProps | null>(null);
  const [pdfScaleValue, setPdfScaleValue] = useState<number | undefined>(undefined);
  const [highlightPen, setHighlightPen] = useState<boolean>(false);
  const [file, setFile] = useState<Uint8Array | null>(null); // Stores uploaded file in Uint8Array format.

  // Refs for PdfHighlighter utilities
  const highlighterUtilsRef = useRef<PdfHighlighterUtils>();

  // Click listeners for context menu
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [contextMenu]);

  const handleContextMenu = (
    event: MouseEvent<HTMLDivElement>,
    highlight: ViewportHighlight<CommentedHighlight>
  ) => {
    event.preventDefault();

    setContextMenu({
      xPos: event.clientX,
      yPos: event.clientY,
      deleteHighlight: () => deleteHighlight(highlight),
      editComment: () => editComment(highlight),
    });
  };

  const addHighlight = (highlight: GhostHighlight, comment: string) => {
    console.log("Saving highlight", highlight);
    setHighlights([{ ...highlight, comment, id: getNextId() }, ...highlights]);
  };

  const deleteHighlight = (highlight: ViewportHighlight | Highlight) => {
    console.log("Deleting highlight", highlight);
    setHighlights(highlights.filter((h) => h.id !== highlight.id));
  };

  const editHighlight = (
    idToUpdate: string,
    edit: Partial<CommentedHighlight>
  ) => {
    console.log(`Editing highlight ${idToUpdate} with `, edit);
    setHighlights(
      highlights.map((highlight) =>
        highlight.id === idToUpdate ? { ...highlight, ...edit } : highlight
      )
    );
  };

  const resetHighlights = () => {
    setHighlights([]);
  };

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  // Open comment tip and update highlight with new user input
  const editComment = (highlight: ViewportHighlight<CommentedHighlight>) => {
    if (!highlighterUtilsRef.current) return;

    const editCommentTip: Tip = {
      position: highlight.position,
      content: (
        <CommentForm
          placeHolder={highlight.comment}
          onSubmit={(input) => {
            editHighlight(highlight.id, { comment: input });
            highlighterUtilsRef.current!.setTip(null);
            highlighterUtilsRef.current!.toggleEditInProgress(false);
          }}
        />
      ),
    };

    highlighterUtilsRef.current.setTip(editCommentTip);
    highlighterUtilsRef.current.toggleEditInProgress(true);
  };

  const scrollToHighlightFromHash = () => {
    const highlight = getHighlightById(parseIdFromHash());

    if (highlight && highlighterUtilsRef.current) {
      highlighterUtilsRef.current.scrollToHighlight(highlight);
    }
  };

  // Hash listeners for autoscrolling to highlights
  useEffect(() => {
    window.addEventListener("hashchange", scrollToHighlightFromHash);

    return () => {
      window.removeEventListener("hashchange", scrollToHighlightFromHash);
    };
  }, [scrollToHighlightFromHash]);

  const styles = {
    uploadButton: {
      display: 'inline-block',
      padding: '12px 25px', // Slightly increased padding for better spacing
      backgroundImage: 'linear-gradient(45deg, #0D74B9, #0CA789)', // MEDNET blue and green gradient
      color: '#fff', // White text
      borderRadius: '6px', // Rounded corners
      cursor: 'pointer',
      fontSize: '12px', // Increased font size for better readability
      fontWeight: '600', // Slightly thicker font weight
      letterSpacing: '0.5px', // Adds spacing between letters
      border: 'none',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
      transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease', // Smooth transition
  
      // Hover effect
      '&:hover': {
        backgroundImage: 'linear-gradient(45deg, #0CA789, #0D74B9)', // Reverse gradient on hover
        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', // Slightly larger shadow on hover
        transform: 'translateY(-2px)', // Lift the button slightly on hover
      },
  
      // Active effect
      '&:active': {
        backgroundColor: '#0A8D6E', // Darker green when pressed
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Reduce shadow when clicked
        transform: 'translateY(1px)', // Press effect by moving it down
      },
    },
    fileName: {
      fontSize: '16px',
      color: '#333',
      marginLeft: '15px', // Space between button and file name
      fontStyle: 'italic', // Italicize the file name for differentiation
    },

  
  
  }

  // Handle PDF upload from local machine
  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result instanceof ArrayBuffer) {
          setFile(new Uint8Array(result)); // Convert ArrayBuffer to Uint8Array and set it as the PDF file.
          setHighlights([]); // Reset highlights for the new PDF
        }
      };
      reader.readAsArrayBuffer(uploadedFile); // Read the file as ArrayBuffer
    }
  };

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        highlights={highlights}
        resetHighlights={resetHighlights}
        toggleDocument={toggleDocument}
        
      />
      <div
        style={{
          height: "100vh",
          width: "75vw",
          overflow: "hidden",
          position: "relative",
          flexGrow: 1,
        }}
      >
        <Toolbar
          setPdfScaleValue={(value) => setPdfScaleValue(value)}
          toggleHighlightPen={() => setHighlightPen(!highlightPen)}
        />
        <div style={{ padding: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input
            type="file"
            accept="application/pdf"
            id="pdf-upload"
            onChange={handlePdfUpload}
            style={{ display: 'none' }} // Hide the default file input
          />
          <label htmlFor="pdf-upload" style={styles.uploadButton}>
            Choose PDF
          </label>
          <label htmlFor="pdf-upload" style={styles.uploadButton}>
            Download
          </label>
            
        </div>
        {file && (
          <PdfLoader document={file}>
            {(pdfDocument) => (
              <PdfHighlighter
                enableAreaSelection={(event) => event.altKey}
                pdfDocument={pdfDocument}
                onScrollAway={resetHash}
                utilsRef={(_pdfHighlighterUtils) => {
                  highlighterUtilsRef.current = _pdfHighlighterUtils;
                }}
                pdfScaleValue={pdfScaleValue}
                textSelectionColor={highlightPen ? "rgba(255, 226, 143, 1)" : undefined}
                onSelection={highlightPen ? (selection) => addHighlight(selection.makeGhostHighlight(), "") : undefined}
                selectionTip={highlightPen ? undefined : <ExpandableTip addHighlight={addHighlight} />}
                highlights={highlights}
                style={{
                  height: "calc(100% - 41px)",
                }}
              >
                <HighlightContainer
                  editHighlight={editHighlight}
                  onContextMenu={handleContextMenu}
                />
              </PdfHighlighter>
            )}
          </PdfLoader>
        )}
      </div>
      <div>
        <SidebarComponent />
      </div>

      {contextMenu && <ContextMenu {...contextMenu} />}
    </div>

    
  );

  
};

export default App;

import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

// Tamanho de uma página A4 em px (aprox. 210mm x 297mm @ 96dpi)
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

export interface PDFBlock {
  id: string;
  content: React.ReactNode;
  height?: number;
  width?: number;
}

interface PDFPreviewProps {
  blocks: PDFBlock[];
  onBlocksChange?: (blocks: PDFBlock[]) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ blocks, onBlocksChange }) => {
  // Para simplificação, todos os blocos em uma página só inicialmente
  // (depois vamos dividir por altura)
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(blocks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onBlocksChange && onBlocksChange(reordered);
  };

  // CSS global para a pré-visualização (escopo .pdf-preview-root)
  React.useEffect(() => {
    const styleId = 'pdf-preview-global-style';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.innerHTML = `
      .pdf-preview-root * {
        box-sizing: border-box !important;
        max-width: 100% !important;
        overflow: hidden !important;
      }
      .pdf-preview-root .pdf-block {
        width: 100% !important;
        margin-bottom: 24px !important;
        position: relative;
        background: #fff;
      }
      .pdf-preview-root .pdf-block.overflow {
        border: 2px solid red !important;
      }
    `;
    return () => {
      style && style.remove();
    };
  }, []);

  return (
    <div className="pdf-preview-root" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
      <div
        style={{
          width: PAGE_WIDTH,
          minHeight: PAGE_HEIGHT,
          background: "white",
          boxShadow: "0 0 8px #0002",
          border: "2px solid #e5e7eb",
          borderRadius: 8,
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
          padding: 24,
        }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="pdf-page-1">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {blocks.map((block, idx) => {
                  // Detectar overflow
                  const isOverflow = (block.height && block.height > PAGE_HEIGHT - 48) || (block.width && block.width > PAGE_WIDTH - 48);
                  return (
                    <Draggable key={block.id} draggableId={block.id} index={idx}>
                      {(provided) => (
                        <ResizableBox
                          width={block.width || PAGE_WIDTH - 48}
                          height={block.height || 180}
                          minConstraints={[200, 80]}
                          maxConstraints={[PAGE_WIDTH - 48, PAGE_HEIGHT / 2]}
                          axis="both"
                          onResizeStop={(e, data) => {
                            if (onBlocksChange) {
                              const newBlocks = [...blocks];
                              newBlocks[idx] = {
                                ...newBlocks[idx],
                                width: data.size.width,
                                height: data.size.height,
                              };
                              onBlocksChange(newBlocks);
                            }
                          }}
                        >
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`pdf-block${isOverflow ? " overflow" : ""}`}
                            style={{
                              border: isOverflow ? "2px solid red" : "1px solid #d1d5db",
                              borderRadius: 6,
                              marginBottom: 16,
                              boxShadow: "0 1px 4px #0001",
                              padding: 16,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#f9fafb",
                              ...provided.draggableProps.style,
                            }}
                          >
                            {block.content}
                            {isOverflow && (
                              <div style={{
                                position: "absolute",
                                top: 4,
                                right: 8,
                                color: "red",
                                fontWeight: 600,
                                fontSize: 12,
                                background: "#fff",
                                padding: "2px 6px",
                                borderRadius: 4,
                                zIndex: 10,
                              }}>
                                Bloco maior que a página!
                              </div>
                            )}
                          </div>
                        </ResizableBox>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}; 
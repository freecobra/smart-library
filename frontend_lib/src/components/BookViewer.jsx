import React, { useState } from 'react';
import './BookViewer.css';

const BookViewer = ({ book, isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  if (!isOpen || !book) return null;

  const handleDownload = () => {
    if (book.digitalUrl) {
      const link = document.createElement('a');
      link.href = book.digitalUrl;
      link.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="book-viewer-overlay" onClick={onClose}>
      <div className="book-viewer-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="book-viewer-header">
          <div className="book-viewer-title">
            <i className="bi bi-book"></i>
            <div>
              <h3>{book.title}</h3>
              <p>by {book.author}</p>
            </div>
          </div>
          <div className="book-viewer-actions">
            <button className="viewer-btn" onClick={() => setZoom(Math.max(50, zoom - 10))}>
              <i className="bi bi-zoom-out"></i>
            </button>
            <span className="zoom-level">{zoom}%</span>
            <button className="viewer-btn" onClick={() => setZoom(Math.min(200, zoom + 10))}>
              <i className="bi bi-zoom-in"></i>
            </button>
            <button className="viewer-btn" onClick={handleDownload}>
              <i className="bi bi-download"></i> Download
            </button>
            <button className="viewer-btn close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="book-viewer-content">
          {book.digitalUrl ? (
            <div className="pdf-viewer-wrapper" style={{ transform: `scale(${zoom / 100})` }}>
              {book.isDemo ? (
                // Demo book preview
                <div className="demo-book-preview">
                  <div className="demo-book-cover">
                    <div className="demo-book-icon">{book.cover}</div>
                    <h2>{book.title}</h2>
                    <p className="demo-author">by {book.author}</p>
                    <div className="demo-category">{book.category}</div>
                  </div>
                  <div className="demo-book-content">
                    <h3>About this book</h3>
                    <p>{book.description}</p>
                    <div className="demo-stats">
                      <div className="demo-stat">
                        <i className="bi bi-star-fill"></i>
                        <span>{book.rating} Rating</span>
                      </div>
                      <div className="demo-stat">
                        <i className="bi bi-file-earmark-pdf"></i>
                        <span>PDF Format</span>
                      </div>
                    </div>
                    <div className="demo-notice">
                      <i className="bi bi-info-circle"></i>
                      <p>This is a demo book. In production, the actual PDF content would be displayed here using a PDF viewer library like react-pdf or pdf.js.</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Real book - embed PDF
                <iframe
                  src={book.digitalUrl}
                  title={book.title}
                  className="pdf-iframe"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              )}
            </div>
          ) : (
            <div className="no-digital-content">
              <i className="bi bi-file-earmark-x"></i>
              <h3>No Digital Content Available</h3>
              <p>This book does not have a digital version available for viewing.</p>
            </div>
          )}
        </div>

        {/* Footer with pagination */}
        {book.digitalUrl && !book.isDemo && (
          <div className="book-viewer-footer">
            <button className="viewer-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
              <i className="bi bi-chevron-left"></i> Previous
            </button>
            <span className="page-info">Page {currentPage}</span>
            <button className="viewer-btn" onClick={() => setCurrentPage(currentPage + 1)}>
              Next <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookViewer;

import React, { useState, useEffect, useRef } from 'react';
import './BookViewer.css';
import StarRating from './StarRating';

const BookViewer = ({ book, isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechParams, setSpeechParams] = useState({ pitch: 1, rate: 1, volume: 1 });

  // AI Chat State
  const [activeTab, setActiveTab] = useState('read'); // 'read' or 'ai'
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Reset state when a new book is opened
  useEffect(() => {
    if (isOpen && book) {
      setCurrentPage(1);
      setZoom(100);
    }
  }, [book?.id, isOpen]);

  // Stop speaking when closed
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // AI Chat Logic
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (book) {
      setChatMessages([
        { sender: 'ai', text: `Hello! I'm your AI assistant for "${book.title}". Ask me for a summary, key topics, or about the author!` }
      ]);
      setActiveTab('read');
    }
  }, [book]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const input = chatInput.toLowerCase();
    setChatInput('');

    // Simulated AI Logic
    setTimeout(() => {
      let response = "I'm focusing on this book's content. Could you rephrase?";

      if (input.includes('summary') || input.includes('summarize') || input.includes('about')) {
        response = book.description || `This book is titled "${book.title}" and falls under the ${book.category} category. It's a great resource for students.`;
      } else if (input.includes('author') || input.includes('wrote')) {
        response = `This book was written by ${book.author}.`;
      } else if (input.includes('category') || input.includes('genre') || input.includes('topic')) {
        response = `This book is categorized under ${book.category}.`;
      } else if (input.includes('hello') || input.includes('hi')) {
        response = "Hello! Ready to learn?";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: response }]);
    }, 600);
  };

  if (!isOpen || !book) return null;

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        // Read title, author, and description
        const text = book.description
          ? `${book.title} by ${book.author}. ${book.description}`
          : `${book.title} by ${book.author}. Category: ${book.category}.`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechParams.rate;
        utterance.pitch = speechParams.pitch;
        utterance.volume = speechParams.volume;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      alert("Text-to-Speech is not supported in this browser.");
    }
  };

  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.split('/api')[0];

    // Clean path: handle backslashes from Windows paths and ensure leading slash
    let cleanPath = path.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

    // Remove duplicate slashes if any
    cleanPath = cleanPath.replace(/\/+/g, '/');

    const finalUrl = `${baseUrl}${cleanPath}`;
    console.log('BookViewer loading:', finalUrl);
    return finalUrl;
  };

  const handleDownload = () => {
    if (book.digitalUrl) {
      const link = document.createElement('a');
      link.href = getFileUrl(book.digitalUrl);
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
            <div className="viewer-rating-container" style={{ marginRight: '1rem' }}>
              <StarRating bookId={book.id} showCount={true} />
            </div>

            {/* Tabs */}
            <div className="view-tabs" style={{ background: '#f1f5f9', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px', margin: '0 1rem' }}>
              <button
                onClick={() => setActiveTab('read')}
                style={{
                  background: activeTab === 'read' ? 'white' : 'transparent',
                  boxShadow: activeTab === 'read' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  color: activeTab === 'read' ? 'var(--ed-primary)' : '#64748b'
                }}>
                <i className="bi bi-book"></i> Read
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                style={{
                  background: activeTab === 'ai' ? 'white' : 'transparent',
                  boxShadow: activeTab === 'ai' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  color: activeTab === 'ai' ? '#8b5cf6' : '#64748b'
                }}>
                <i className="bi bi-robot"></i> AI Assistant
              </button>
            </div>

            <button
              className={`viewer-btn ${isSpeaking ? 'active-speech' : ''}`}
              onClick={handleSpeak}
              title={isSpeaking ? "Stop Reading" : "Read Description"}
              style={{ color: isSpeaking ? '#ef4444' : 'inherit' }}
            >
              <i className={`bi bi-${isSpeaking ? 'stop-circle-fill' : 'megaphone'}`}></i>
            </button>

            <button className="viewer-btn" onClick={() => setZoom(Math.max(50, zoom - 10))} title="Zoom Out">
              <i className="bi bi-zoom-out"></i>
            </button>
            <span className="zoom-level">{zoom}%</span>
            <button className="viewer-btn" onClick={() => setZoom(Math.min(200, zoom + 10))} title="Zoom In">
              <i className="bi bi-zoom-in"></i>
            </button>
            <button className="viewer-btn" onClick={() => setZoom(100)} title="Reset Zoom">
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
            <button className="viewer-btn" onClick={handleDownload} title="Download">
              <i className="bi bi-download"></i>
            </button>
            <button className="viewer-btn close-btn" onClick={onClose} title="Close">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="book-viewer-content">
          {activeTab === 'read' ? (
            book.digitalUrl ? (
              <div className="pdf-viewer-wrapper" style={{ overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
                {book.isDemo ? (
                  // Demo book preview
                  <div className="demo-book-preview" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
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
                    </div>
                  </div>
                ) : (
                  // Real book - embed PDF
                  <div className="pdf-container" style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f3f4f6'
                  }}>
                    <iframe
                      src={`${getFileUrl(book.digitalUrl)}#page=${currentPage}`}
                      title={book.title}
                      className="pdf-iframe"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      onError={(e) => {
                        console.error("Iframe failed to load", e);
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="iframe-fallback" style={{
                      display: 'none',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '2rem',
                      textAlign: 'center'
                    }}>
                      <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', color: '#f59e0b' }}></i>
                      <p>Preview could not be loaded inline.</p>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => window.open(getFileUrl(book.digitalUrl), '_blank')}>
                          <i className="bi bi-box-arrow-up-right"></i> Open in New Tab
                        </button>
                        <button className="btn btn-secondary" onClick={handleDownload}>
                          <i className="bi bi-download"></i> Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-digital-content">
                <i className="bi bi-file-earmark-x"></i>
                <h3>Preview Not Available</h3>
                <p>The PDF preview could not be loaded directly.</p>
                {book.digitalUrl && (
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                    onClick={handleDownload}
                  >
                    <i className="bi bi-download"></i> Download Book to Read
                  </button>
                )}
              </div>
            )
          ) : (
            // AI Chat Tab
            <div className="ai-chat-interface" style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? 'var(--ed-primary)' : '#f1f5f9',
                    color: msg.sender === 'user' ? 'white' : '#333',
                    padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '70%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {msg.sender === 'ai' && <i className="bi bi-robot" style={{ marginRight: '8px' }}></i>}
                    {msg.text}
                  </div>
                ))}
                <div ref={chatEndRef}></div>
              </div>
              <div className="chat-input-area" style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Ask about this book..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button onClick={handleSendChat} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Footer with pagination */}
        {book.digitalUrl && !book.isDemo && activeTab === 'read' && (
          <div className="book-viewer-footer">
            <button
              className="viewer-btn"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
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

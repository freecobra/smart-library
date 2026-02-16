import React, { useState, useEffect, useRef } from 'react';

const GlobalAIChat = ({ user, currentBook }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: `Hello ${user?.name?.split(' ')[0] || 'Scholar'}! I'm your SmartLib Assistant. Ask me how to find books, about our team, or for reading tips!` }
    ]);
    const [input, setInput] = useState('');
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // React to book changes
    useEffect(() => {
        if (currentBook) {
            setMessages(prev => [...prev, { sender: 'ai', text: `I see you opened "${currentBook.title}". Need a summary or analysis?` }]);
            if (!isOpen) setIsOpen(true); // Auto-open when book is opened (optional, maybe intrusive? sticking to just message)
            // actually let's not auto-open, just update state
        }
    }, [currentBook?.id]); // Only trigger if book ID changes

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        const lowerInput = input.toLowerCase();
        setInput('');

        setTimeout(() => {
            let response = "I'm still learning about the library. Ask me about 'search', 'upload', 'team', or 'recommendations'!";

            if (currentBook && (lowerInput.includes('summary') || lowerInput.includes('about') || lowerInput.includes('analyze') || lowerInput.includes('character') || lowerInput.includes('theme'))) {
                // Context-aware responses for the open book
                if (lowerInput.includes('summary') || lowerInput.includes('about')) {
                    response = currentBook.description || `"${currentBook.title}" is a fascinating book in the ${currentBook.category} genre.`;
                } else if (lowerInput.includes('author')) {
                    response = `"${currentBook.title}" was written by ${currentBook.author}.`;
                } else {
                    response = `That's an interesting question about "${currentBook.title}". As an AI, I suggest reading the introduction to understand the core themes better!`;
                }
            } else if (lowerInput.includes('search') || lowerInput.includes('find')) {
                response = "You can search for books using the bar at the top or the Search tab on the left. Try the new Voice Search microphone icon!";
            } else if (lowerInput.includes('team') || lowerInput.includes('created') || lowerInput.includes('maker')) {
                response = "SmartLib was built by an amazing team including Maniragaba Jean Willson, Uwase Sion, and others. Check the 'About' section in the sidebar!";
            } else if (lowerInput.includes('recommend') || lowerInput.includes('suggest')) {
                response = "Check out the 'Recommended for You' section on your dashboard or the new 'Recommendations' tab!";
            } else if (lowerInput.includes('upload') || lowerInput.includes('add')) {
                response = "To upload books, you need Librarian access. If you are a student, please request resources via the 'Study Resources' tab.";
            } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                response = "Hi there! Ready to read something new today?";
            }

            setMessages(prev => [...prev, { sender: 'ai', text: response }]);
        }, 600);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.5)',
                    cursor: 'pointer',
                    zIndex: 9998,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(45deg)' : 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = isOpen ? 'rotate(45deg) scale(1.1)' : 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = isOpen ? 'rotate(45deg)' : 'scale(1)'}
                title="SmartLib AI Assistant"
            >
                <i className={`bi bi-${isOpen ? 'plus' : 'robot'}`} style={{ fontSize: isOpen ? '2rem' : '1.5rem' }}></i>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '20px',
                    width: '350px',
                    height: '500px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="bi bi-robot"></i> SmartLib AI
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <i className="bi bi-dash-lg"></i>
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        overflowY: 'auto',
                        background: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.sender === 'user' ? '#6366f1' : 'white',
                                color: msg.sender === 'user' ? 'white' : '#334155',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                borderBottomRightRadius: msg.sender === 'user' ? '0' : '12px',
                                borderBottomLeftRadius: msg.sender === 'ai' ? '0' : '12px',
                                maxWidth: '85%',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={endRef}></div>
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '1rem',
                        background: 'white',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <input
                            type="text"
                            placeholder={currentBook ? "Ask about this book..." : "Ask me anything..."}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            style={{
                                flex: 1,
                                padding: '0.6rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                background: '#6366f1',
                                color: 'white',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                            onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                        >
                            <i className="bi bi-send-fill" style={{ fontSize: '1rem', marginLeft: '2px' }}></i>
                        </button>
                    </div>
                </div>
            )}
            <style>
                {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
            </style>
        </>
    );
};

export default GlobalAIChat;

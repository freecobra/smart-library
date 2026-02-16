import React, { useState, useEffect } from 'react';

const BookRecommendations = ({ bookId, onClose }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                let endpoint = `${apiUrl}/recommendations/personalized`;

                if (bookId) {
                    endpoint = `${apiUrl}/recommendations/similar/${bookId}?limit=4`;
                }

                const response = await fetch(endpoint);
                const data = await response.json();
                setRecommendations(data.recommendations || []);
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [bookId]);

    if (loading || recommendations.length === 0) return null;

    // Helper to get cover URL
    const getCoverUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.split('/api')[0];
        const cleanPath = path.replace(/\\/g, '/').replace(/^\/?/, '/');
        return `${baseUrl}${cleanPath}`;
    };

    return (
        <div className="book-recommendations" style={{
            padding: '1.5rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0'
        }}>
            <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <i className="bi bi-stars" style={{ color: '#8b5cf6' }}></i>
                {bookId ? 'You might also like' : 'Recommended for You'}
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1rem'
            }}>
                {recommendations.map(book => (
                    <div key={book.id} className="recommendation-card" style={{
                        background: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                        onClick={() => {
                            // Close current book and open this one (would need parent handler)
                            // For now, just log or maybe reload content?
                            // Ideally BookViewer should take a bookId instead of book object
                            console.log('Open book:', book.title);
                        }}
                    >
                        <div style={{
                            height: '100px',
                            background: book.coverImage ? `url(${getCoverUrl(book.coverImage)}) center/cover` : '#e2e8f0',
                            position: 'relative'
                        }}>
                            {book.digitalUrl && (
                                <span style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: 'rgba(37, 99, 235, 0.9)',
                                    color: 'white',
                                    fontSize: '0.6rem',
                                    padding: '2px 4px',
                                    borderRadius: '2px'
                                }}>PDF</span>
                            )}
                        </div>
                        <div style={{ padding: '0.75rem' }}>
                            <h4 style={{
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                marginBottom: '0.25rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>{book.title}</h4>
                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{book.author}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookRecommendations;

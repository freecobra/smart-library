import React, { useState, useEffect } from 'react';
import './StarRating.css';

const StarRating = ({ bookId, currentUserRating, onRate, readonly = false, showCount = false }) => {
    const [rating, setRating] = useState(currentUserRating || 0);
    const [hover, setHover] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);

    useEffect(() => {
        if (bookId && showCount) {
            fetchAverageRating();
        }
    }, [bookId]);

    const fetchAverageRating = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/ratings/book/${bookId}`);
            const data = await response.json();
            setAverageRating(data.average || 0);
            setRatingCount(data.count || 0);
        } catch (error) {
            console.error('Failed to fetch average rating:', error);
        }
    };

    const handleRating = async (value) => {
        if (readonly) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');

            const response = await fetch(`${apiUrl}/ratings/book/${bookId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating: value })
            });

            if (response.ok) {
                setRating(value);
                if (onRate) onRate(value);
                if (showCount) fetchAverageRating();
            }
        } catch (error) {
            console.error('Failed to rate book:', error);
        }
    };

    const displayRating = showCount ? averageRating : rating;

    return (
        <div className="star-rating-container">
            <div className="star-rating">
                {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                        <button
                            key={starValue}
                            type="button"
                            className={`star-button ${readonly ? 'readonly' : ''}`}
                            onClick={() => handleRating(starValue)}
                            onMouseEnter={() => !readonly && setHover(starValue)}
                            onMouseLeave={() => !readonly && setHover(0)}
                            disabled={readonly}
                        >
                            <i
                                className={`bi bi-star${(hover || displayRating) >= starValue ? '-fill' : ''
                                    }`}
                                style={{
                                    color: (hover || displayRating) >= starValue ? '#fbbf24' : '#d1d5db',
                                    fontSize: '1.25rem'
                                }}
                            />
                        </button>
                    );
                })}
            </div>
            {showCount && ratingCount > 0 && (
                <div className="rating-info">
                    <span className="rating-average">{averageRating.toFixed(1)}</span>
                    <span className="rating-count">({ratingCount} ratings)</span>
                </div>
            )}
            {!readonly && !showCount && (
                <span className="rating-label">
                    {rating > 0 ? `You rated: ${rating}/5` : 'Click to rate'}
                </span>
            )}
        </div>
    );
};

export default StarRating;

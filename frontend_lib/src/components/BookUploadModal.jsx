// BookUploadModal.jsx - Reusable Modal for Book Uploads
import React, { useState } from 'react';
import { bookAPI } from '../utils/api';
import './BookUploadModal.css';

const BookUploadModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        description: '',
        publicationYear: '',
        quantity: '1'
    });
    const [coverImage, setCoverImage] = useState(null);
    const [digitalFile, setDigitalFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === 'cover') {
            if (file && file.type.startsWith('image/')) {
                setCoverImage(file);
            } else {
                setError('Please select a valid image file');
            }
        } else if (type === 'digital') {
            if (file && file.type === 'application/pdf') {
                setDigitalFile(file);
            } else {
                setError('Please select a valid PDF file');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Create FormData
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    data.append(key, formData[key]);
                }
            });

            if (coverImage) {
                data.append('coverImage', coverImage);
            }
            if (digitalFile) {
                data.append('digitalFile', digitalFile);
            }

            // Upload book
            const response = await bookAPI.uploadBook(data);

            if (onSuccess) {
                onSuccess(response.book);
            }

            // Reset form
            setFormData({
                title: '',
                author: '',
                isbn: '',
                category: '',
                description: '',
                publicationYear: '',
                quantity: '1'
            });
            setCoverImage(null);
            setDigitalFile(null);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to upload book');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Book</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="book-upload-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Enter book title"
                            />
                        </div>

                        <div className="form-group">
                            <label>Author *</label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                required
                                placeholder="Enter author name"
                            />
                        </div>

                        <div className="form-group">
                            <label>ISBN</label>
                            <input
                                type="text"
                                name="isbn"
                                value={formData.isbn}
                                onChange={handleChange}
                                placeholder="Enter ISBN (optional)"
                            />
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select category</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Literature">Literature</option>
                                <option value="History">History</option>
                                <option value="Art">Art</option>
                                <option value="Business">Business</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Publication Year</label>
                            <input
                                type="number"
                                name="publicationYear"
                                value={formData.publicationYear}
                                onChange={handleChange}
                                placeholder="e.g., 2024"
                                min="1900"
                                max={new Date().getFullYear()}
                            />
                        </div>

                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                placeholder="e.g., 5"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter book description (optional)"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Cover Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'cover')}
                            />
                            {coverImage && <small className="file-name">✓ {coverImage.name}</small>}
                        </div>

                        <div className="form-group">
                            <label>Digital File (PDF)</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handleFileChange(e, 'digital')}
                            />
                            {digitalFile && <small className="file-name">✓ {digitalFile.name}</small>}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload Book'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookUploadModal;

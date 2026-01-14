import React, { useEffect, useState } from 'react';
import { uploadAttachment, fetchNotes } from '../api';

export default function Attachments() {
    const [file, setFile] = useState(null);
    const [noteId, setNoteId] = useState('');
    const [notes, setNotes] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const loadNotes = async () => {
        try {
            const res = await fetchNotes('');
            setNotes(res.data || []);
        } catch (err) {
            setMessage('Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotes();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!file || !noteId) {
            setMessage('❌ Select a note and a file');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setMessage('❌ Only image files (JPG, PNG, GIF, WebP) are allowed');
            setFile(null);
            return;
        }

        try {
            await uploadAttachment(file, noteId);
            setMessage('✅ Image uploaded successfully!');
            setFile(null);
            setNoteId('');
            await loadNotes();
        } catch (err) {
            setMessage('❌ ' + (err.data?.message || err.message));
        }
    };

    if (loading) return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>Loading notes...</div>;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>📎 Upload Attachments</h2>

            {notes.length === 0 ? (
                <div style={{
                    padding: '40px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#666'
                }}>
                    <p style={{ marginBottom: '10px', fontSize: '16px' }}>No notes available</p>
                    <p style={{ margin: 0, fontSize: '14px' }}>You need to create a note first before uploading attachments.</p>
                </div>
            ) : (
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#374151' }}>Select Note *</label>
                        <select
                            value={noteId}
                            onChange={e => setNoteId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = '#d1d5db'}
                        >
                            <option value="">-- Choose a note --</option>
                            {notes.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#374151' }}>Choose File *</label>
                        <div style={{
                            padding: '24px',
                            border: '2px dashed #d1d5db',
                            borderRadius: '8px',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            backgroundColor: '#f9fafb'
                        }}>
                            <input
                                type="file"
                                onChange={e => setFile(e.target.files[0])}
                                required
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="file-input"
                            />
                            <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                                <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 500, color: '#3b82f6' }}>🖼️ Click to choose or drag and drop</p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                    {file ? `Selected: ${file.name}` : 'Select an image (JPG, PNG, GIF, WebP)'}
                                </p>
                            </label>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="submit"
                            style={{
                                padding: '12px 32px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '15px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
                            onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
                        >
                            ⬆️ Upload File
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setFile(null);
                                setNoteId('');
                                setMessage('');
                            }}
                            style={{
                                padding: '12px 32px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '15px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => {
                                e.target.style.backgroundColor = '#e5e7eb';
                                e.target.style.borderColor = '#9ca3af';
                            }}
                            onMouseOut={e => {
                                e.target.style.backgroundColor = '#f3f4f6';
                                e.target.style.borderColor = '#d1d5db';
                            }}
                        >
                            Clear
                        </button>
                    </div>
                </form>
            )}
            {message && (
                <div style={{
                    marginTop: '24px',
                    fontWeight: 500,
                    padding: '16px',
                    backgroundColor: message.startsWith('✅') ? '#dcfce7' : '#fee2e2',
                    color: message.startsWith('✅') ? '#166534' : '#991b1b',
                    borderRadius: '6px',
                    border: `1px solid ${message.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`
                }}>
                    {message}
                </div>
            )}
        </div>
    );
}

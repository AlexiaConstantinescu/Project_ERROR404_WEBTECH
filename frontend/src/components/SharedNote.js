import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedNote } from '../api';

export default function SharedNote() {
    const { token } = useParams();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNote = async () => {
            try {
                const result = await getSharedNote(token);
                setNote(result.data);
            } catch (e) {
                setError(e.message || 'Failed to load shared note');
            } finally {
                setLoading(false);
            }
        };

        loadNote();
    }, [token]);

    if (loading) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                Loading shared note...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div
                    style={{
                        color: '#991b1b',
                        backgroundColor: '#fee2e2',
                        padding: '16px',
                        borderRadius: '6px',
                        maxWidth: '400px',
                        margin: '0 auto'
                    }}
                >
                    ❌ {error}
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                Note not found
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
            <div
                style={{
                    padding: '32px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
            >
                <h1 style={{ margin: '0 0 16px', fontSize: '32px', fontWeight: 700, color: '#1f2937' }}>
                    {note.title}
                </h1>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {note.subject && (
                        <span
                            style={{
                                padding: '6px 14px',
                                backgroundColor: note.subject.color || '#e0e7ff',
                                color: '#1f2937',
                                borderRadius: '16px',
                                fontSize: '13px',
                                fontWeight: 500
                            }}
                        >
                            📚 {note.subject.name}
                        </span>
                    )}
                    {note.tags && note.tags.map(t => (
                        <span
                            key={t.id}
                            style={{
                                padding: '6px 14px',
                                backgroundColor: '#e0e7ff',
                                color: '#3b82f6',
                                borderRadius: '16px',
                                fontSize: '13px',
                                fontWeight: 500
                            }}
                        >
                            🏷️ {t.name}
                        </span>
                    ))}
                </div>

                {note.content && (
                    <div
                        style={{
                            backgroundColor: '#f9fafb',
                            padding: '16px',
                            borderRadius: '6px',
                            marginBottom: '24px',
                            lineHeight: '1.6',
                            color: '#374151',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                        }}
                    >
                        {note.content}
                    </div>
                )}

                {note.attachments && note.attachments.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                            📷 Attachments
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {note.attachments.map(a => (
                                <a
                                    key={a.id}
                                    href={`${window.location.origin}/api/attachments/${a.id}/view`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        textDecoration: 'none'
                                    }}
                                >
                                    <img
                                        src={`${window.location.origin}/api/attachments/${a.id}/view`}
                                        alt={a.originalName}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '300px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'}
                                        onMouseOut={e => e.target.style.boxShadow = 'none'}
                                        title="Click to open full image"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div
                    style={{
                        marginTop: '32px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e5e7eb',
                        fontSize: '12px',
                        color: '#666'
                    }}
                >
                    📌 This is a shared note. Share links are public and can be accessed by anyone with the link.
                </div>
            </div>
        </div>
    );
}

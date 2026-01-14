import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchNotes, deleteNote, deleteAttachment, shareNote } from '../api';

export default function NotesList() {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        try {
            const res = await fetchNotes('');
            setNotes(res.data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this note?')) return;
        try {
            await deleteNote(id);
            setNotes(n => n.filter(x => x.id !== id));
        } catch (e) {
            setError(e.message);
        }
    };

    const handleShare = async (id) => {
        try {
            const result = await shareNote(id);
            const url = result.data.url;

            // Copy to clipboard
            await navigator.clipboard.writeText(url);

            alert('✅ Share link copied to clipboard!\n\n' + url);
        } catch (e) {
            alert('Error creating share link: ' + e.message);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>Loading notes...</div>;
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>📝 My Notes</h2>
                <Link
                    to="/notes/new"
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        display: 'inline-block'
                    }}
                    onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
                >
                    + New Note
                </Link>
            </div>

            {error && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    fontWeight: 500
                }}>
                    ❌ {error}
                </div>
            )}

            {notes.length === 0 ? (
                <div style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    color: '#666'
                }}>
                    <p style={{ fontSize: '16px', marginBottom: '10px' }}>No notes yet</p>
                    <Link to="/notes/new" style={{ color: '#3b82f6', textDecoration: 'none' }}>Create your first note →</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {notes.map(n => (
                        <div
                            key={n.id}
                            onClick={() => navigate(`/notes/${n.id}`)}
                            style={{
                                padding: '20px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                cursor: 'pointer'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = '#d1d5db';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <Link
                                        to={`/notes/${n.id}`}
                                        style={{
                                            fontSize: '18px',
                                            fontWeight: 600,
                                            color: '#1f2937',
                                            textDecoration: 'none',
                                            display: 'block',
                                            marginBottom: '8px'
                                        }}
                                        onMouseOver={e => e.target.style.color = '#3b82f6'}
                                        onMouseOut={e => e.target.style.color = '#1f2937'}
                                    >
                                        {n.title}
                                    </Link>
                                    {n.content && (
                                        <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                                            {n.content.substring(0, 100)}{n.content.length > 100 ? '...' : ''}
                                        </p>
                                    )}
                                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {n.subject && (
                                            <span style={{
                                                padding: '4px 12px',
                                                backgroundColor: n.subject.color || '#e0e7ff',
                                                color: '#1f2937',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 500
                                            }}>
                                                📚 {n.subject.name}
                                            </span>
                                        )}
                                        {n.tags && n.tags.map(t => (
                                            <span
                                                key={t.id}
                                                style={{
                                                    padding: '4px 12px',
                                                    backgroundColor: '#e0e7ff',
                                                    color: '#3b82f6',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 500
                                                }}
                                            >
                                                🏷️ {t.name}
                                            </span>
                                        ))}
                                    </div>
                                    {n.attachments && n.attachments.map(a => (
                                        <div
                                            key={a.id}
                                            style={{
                                                position: 'relative',
                                                display: 'inline-block',
                                                marginTop: '12px'
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
                                                    transition: 'all 0.2s',
                                                    display: 'block'
                                                }}
                                                onClick={() => window.open(`${window.location.origin}/api/attachments/${a.id}/view`, '_blank')}
                                                onMouseOver={e => e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'}
                                                onMouseOut={e => e.target.style.boxShadow = 'none'}
                                                title="Click to open full image"
                                            />
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Delete this image?')) {
                                                        try {
                                                            await deleteAttachment(a.id);
                                                            load();
                                                        } catch (e) {
                                                            alert('Error deleting image: ' + e.message);
                                                        }
                                                    }
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    padding: '4px 8px',
                                                    backgroundColor: '#dc2626',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s',
                                                    opacity: '0.9'
                                                }}
                                                onMouseOver={e => {
                                                    e.target.style.backgroundColor = '#991b1b';
                                                    e.target.style.opacity = '1';
                                                }}
                                                onMouseOut={e => {
                                                    e.target.style.backgroundColor = '#dc2626';
                                                    e.target.style.opacity = '0.9';
                                                }}
                                                title="Delete image"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleShare(n.id)}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#dbeafe',
                                            color: '#1e40af',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => {
                                            e.target.style.backgroundColor = '#bfdbfe';
                                            e.target.style.color = '#1e3a8a';
                                        }}
                                        onMouseOut={e => {
                                            e.target.style.backgroundColor = '#dbeafe';
                                            e.target.style.color = '#1e40af';
                                        }}
                                    >
                                        🔗 Share
                                    </button>
                                    <button
                                        onClick={() => handleDelete(n.id)}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#fee2e2',
                                            color: '#991b1b',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => {
                                            e.target.style.backgroundColor = '#fecaca';
                                            e.target.style.color = '#7f1d1d';
                                        }}
                                        onMouseOut={e => {
                                            e.target.style.backgroundColor = '#fee2e2';
                                            e.target.style.color = '#991b1b';
                                        }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

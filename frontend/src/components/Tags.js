import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTags, createTag, fetchNotes } from '../api';

export default function Tags() {
    const [tags, setTags] = useState([]);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState(null);
    const [tagNotes, setTagNotes] = useState([]);

    const loadTags = async () => {
        try {
            const res = await fetchTags();
            setTags(res.data || []);
        } catch (e) {
            setError('Failed to load tags');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTags();
    }, []);

    const handleSelectTag = async (tag) => {
        setSelectedTag(tag);
        try {
            const res = await fetchNotes('');
            const filtered = res.data.filter(note => note.tags && note.tags.some(t => t.id === tag.id));
            setTagNotes(filtered);
        } catch (e) {
            setTagNotes([]);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Tag name is required');
            return;
        }
        try {
            await createTag(name);
            setName('');
            await loadTags();
        } catch (e) {
            setError(e.data?.message || e.message || 'Failed to create tag');
        }
    };

    if (loading) return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>Loading tags...</div>;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>🏷️ Tags</h2>

            {error && <div style={{ color: '#dc2626', marginBottom: '16px', fontWeight: 500, padding: '12px 16px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>❌ {error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                    <form onSubmit={handleCreate} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Create New Tag</h3>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px', color: '#374151' }}>Tag Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g., Important, Review, etc."
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '14px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
                            onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
                        >
                            Create Tag
                        </button>
                    </form>

                    <div>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Your Tags ({tags.length})</h3>
                        {tags.length === 0 ? (
                            <p style={{ color: '#666', fontSize: '14px' }}>No tags yet. Create one above!</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {tags.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleSelectTag(t)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: selectedTag?.id === t.id ? '#3b82f6' : '#e0e7ff',
                                            color: selectedTag?.id === t.id ? 'white' : '#3b82f6',
                                            border: 'none',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => {
                                            if (selectedTag?.id !== t.id) {
                                                e.target.style.backgroundColor = '#c7d2fe';
                                            }
                                        }}
                                        onMouseOut={e => {
                                            if (selectedTag?.id !== t.id) {
                                                e.target.style.backgroundColor = '#e0e7ff';
                                            }
                                        }}
                                    >
                                        {t.name} ({t.notesCount || 0})
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                        {selectedTag ? `📝 Notes with "${selectedTag.name}"` : 'Select a tag to view notes'}
                    </h3>
                    {selectedTag && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {tagNotes.length === 0 ? (
                                <p style={{ color: '#666', fontSize: '14px' }}>No notes with this tag yet</p>
                            ) : (
                                tagNotes.map(n => (
                                    <Link
                                        key={n.id}
                                        to={`/notes/${n.id}`}
                                        style={{
                                            padding: '16px',
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            textDecoration: 'none',
                                            color: '#1f2937',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                        }}
                                    >
                                        <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px' }}>{n.title}</p>
                                        {n.content && <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{n.content.substring(0, 80)}{n.content.length > 80 ? '...' : ''}</p>}
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

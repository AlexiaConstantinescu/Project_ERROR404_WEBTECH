import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSubjects, createSubject, fetchNotes } from '../api';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [subjectNotes, setSubjectNotes] = useState([]);

    const loadSubjects = async () => {
        try {
            const res = await fetchSubjects();
            setSubjects(res.data || []);
        } catch (e) {
            setError('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubjects();
    }, []);

    const handleSelectSubject = async (subject) => {
        setSelectedSubject(subject);
        try {
            const res = await fetchNotes('');
            const filtered = res.data.filter(note => note.subjectId === subject.id);
            setSubjectNotes(filtered);
        } catch (e) {
            setSubjectNotes([]);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Subject name is required');
            return;
        }
        try {
            await createSubject(name, description, color);
            setName('');
            setDescription('');
            setColor('#3b82f6');
            await loadSubjects();
        } catch (e) {
            setError(e.data?.message || e.message || 'Failed to create subject');
        }
    };

    if (loading) return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>Loading subjects...</div>;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>📚 Subjects</h2>

            {error && <div style={{ color: '#dc2626', marginBottom: '16px', fontWeight: 500, padding: '12px 16px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>❌ {error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                    <div>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Your Subjects ({subjects.length})</h3>
                        {subjects.length === 0 ? (
                            <p style={{ color: '#666', fontSize: '14px' }}>No subjects yet. Create one below!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                                {subjects.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => handleSelectSubject(s)}
                                        style={{
                                            padding: '12px 16px',
                                            backgroundColor: selectedSubject?.id === s.id ? (s.color || '#3b82f6') : 'white',
                                            border: `2px solid ${s.color || '#3b82f6'}`,
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            textAlign: 'left'
                                        }}
                                        onMouseOver={e => {
                                            if (selectedSubject?.id !== s.id) {
                                                e.currentTarget.style.backgroundColor = (s.color || '#3b82f6') + '10';
                                            }
                                        }}
                                        onMouseOut={e => {
                                            if (selectedSubject?.id !== s.id) {
                                                e.currentTarget.style.backgroundColor = 'white';
                                            }
                                        }}
                                    >
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            color: selectedSubject?.id === s.id ? 'white' : '#1f2937'
                                        }}>
                                            {s.name}
                                        </div>
                                        {s.description && (
                                            <div style={{
                                                fontSize: '12px',
                                                fontWeight: 400,
                                                marginTop: '4px',
                                                color: selectedSubject?.id === s.id ? 'rgba(255, 255, 255, 0.85)' : '#6b7280'
                                            }}>
                                                {s.description}
                                            </div>
                                        )}
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: 400,
                                            marginTop: '2px',
                                            opacity: 0.8,
                                            color: selectedSubject?.id === s.id ? 'rgba(255, 255, 255, 0.9)' : 'inherit'
                                        }}>
                                            📝 {s.notesCount || 0} notes
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleCreate} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Create New Subject</h3>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px', color: '#374151' }}>Subject Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g., Mathematics, History, etc."
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
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px', color: '#374151' }}>Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Optional description..."
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    minHeight: '80px',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px', color: '#374151' }}>Color</label>
                            <input
                                type="color"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '44px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
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
                            Create Subject
                        </button>
                    </form>
                </div>

                <div>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                        {selectedSubject ? `📝 Notes in "${selectedSubject.name}"` : 'Select a subject to view notes'}
                    </h3>
                    {selectedSubject && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {subjectNotes.length === 0 ? (
                                <p style={{ color: '#666', fontSize: '14px' }}>No notes in this subject yet</p>
                            ) : (
                                subjectNotes.map(n => (
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
                                            e.currentTarget.style.borderColor = selectedSubject.color || '#3b82f6';
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                        }}
                                    >
                                        <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px' }}>{n.title}</p>
                                        {n.content && <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{n.content.substring(0, 80)}{n.content.length > 80 ? '...' : ''}</p>}
                                        {n.tags && n.tags.length > 0 && (
                                            <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                {n.tags.map(t => (
                                                    <span key={t.id} style={{ padding: '2px 8px', backgroundColor: '#e0e7ff', color: '#3b82f6', borderRadius: '12px', fontSize: '11px', fontWeight: 500 }}>
                                                        {t.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
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

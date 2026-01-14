import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createNote, updateNote, fetchNotes, fetchSubjects, fetchTags } from '../api';

export default function NoteEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const s = await fetchSubjects();
                setSubjects(s.data || []);
            } catch { }
            try {
                const t = await fetchTags();
                setTags(t.data || []);
            } catch { }
            if (id) {
                try {
                    const res = await fetchNotes('/' + id);
                    const note = res.data;
                    setTitle(note.title || '');
                    setContent(note.content || '');
                    setSelectedSubject(note.subjectId || '');
                    setSelectedTags((note.tags || []).map(x => x.id));
                } catch (e) { }
            }
        })();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        const payload = {
            title: title.trim(),
            content: content.trim() || null,
            subjectId: selectedSubject && selectedSubject !== '' ? selectedSubject : null,
            tagIds: selectedTags && selectedTags.length > 0 ? selectedTags : []
        };

        console.log('Payload being sent:', JSON.stringify(payload, null, 2));

        try {
            if (id) {
                await updateNote(id, payload);
            } else {
                await createNote(payload);
            }
            navigate('/');
        } catch (e) {
            console.error('Save error:', e);
            console.error('Error data:', e.data);
            let errorMsg = 'Save failed';
            if (e.data?.errors && Array.isArray(e.data.errors)) {
                errorMsg = e.data.errors.map(err => err.msg || err.message).join('; ');
            } else if (e.data?.message) {
                errorMsg = e.data.message;
            } else if (e.message) {
                errorMsg = e.message;
            }
            setError(errorMsg);
        }
    };

    const toggleTag = (tagId) => {
        setSelectedTags(prev => prev.includes(tagId) ? prev.filter(x => x !== tagId) : [...prev, tagId]);
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>
                {id ? '✏️ Edit Note' : '📝 New Note'}
            </h2>
            {error && (
                <div style={{
                    color: '#991b1b',
                    marginBottom: '24px',
                    fontWeight: 500,
                    padding: '12px 16px',
                    backgroundColor: '#fee2e2',
                    borderRadius: '6px'
                }}>
                    ❌ {error}
                </div>
            )}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#374151' }}>Title *</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Enter note title..."
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#374151' }}>Content</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Write your note content here..."
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            minHeight: '200px',
                            boxSizing: 'border-box',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#374151' }}>Subject</label>
                    <select
                        value={selectedSubject || ''}
                        onChange={e => setSelectedSubject(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit',
                            cursor: 'pointer'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    >
                        <option value="">-- Select a subject --</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '14px', color: '#374151' }}>Tags</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {tags.length === 0 ? (
                            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>No tags available. Create one on the Tags page.</p>
                        ) : (
                            tags.map(t => (
                                <label
                                    key={t.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px 14px',
                                        backgroundColor: selectedTags.includes(t.id) ? '#e0e7ff' : '#f3f4f6',
                                        border: `2px solid ${selectedTags.includes(t.id) ? '#3b82f6' : '#e5e7eb'}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTags.includes(t.id)}
                                        onChange={() => toggleTag(t.id)}
                                        style={{ marginRight: '8px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{t.name}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
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
                        {id ? '💾 Update Note' : '✅ Create Note'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
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
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getMyGroups, createGroup, searchUserByEmail, addMemberToGroup, removeMemberFromGroup } from '../api';

export default function StudyGroups() {
    const { user } = useAuth();
    const [groups, setGroups] = useState({ owned: [], member: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [addMemberEmail, setAddMemberEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const res = await getMyGroups();
            setGroups(res.data);
            setError('');
        } catch (e) {
            setError(e.message || 'Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!groupName.trim()) {
            setError('Group name is required');
            return;
        }

        try {
            await createGroup(groupName, groupDescription);
            setMessage('✅ Group created successfully!');
            setGroupName('');
            setGroupDescription('');
            setShowCreateForm(false);
            await loadGroups();
        } catch (e) {
            setError(e.data?.message || e.message || 'Failed to create group');
        }
    };

    const handleSearchUser = async () => {
        setError('');
        setSearchResult(null);

        if (!addMemberEmail.trim()) {
            setError('Email is required');
            return;
        }

        if (!addMemberEmail.endsWith('@stud.ase.ro')) {
            setError('Only @stud.ase.ro emails are allowed');
            return;
        }

        try {
            const res = await searchUserByEmail(addMemberEmail);
            setSearchResult(res.data);
        } catch (e) {
            setError(e.data?.message || 'User not found');
            setSearchResult(null);
        }
    };

    const handleAddMember = async () => {
        if (!selectedGroup || !searchResult) return;

        try {
            await addMemberToGroup(selectedGroup.id, searchResult.id);
            setMessage('✅ Member added successfully!');
            setAddMemberEmail('');
            setSearchResult(null);
            await loadGroups();
            setSelectedGroup(null);
        } catch (e) {
            setError(e.data?.message || e.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (groupId, userId) => {
        if (!window.confirm('Remove this member?')) return;

        try {
            await removeMemberFromGroup(groupId, userId);
            setMessage('✅ Member removed!');
            await loadGroups();
        } catch (e) {
            setError(e.message || 'Failed to remove member');
        }
    };

    if (loading) {
        return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>Loading study groups...</div>;
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>👥 Study Groups</h2>

            {error && <div style={{ color: '#991b1b', backgroundColor: '#fee2e2', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontWeight: 500 }}>❌ {error}</div>}
            {message && <div style={{ color: '#065f46', backgroundColor: '#d1fae5', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontWeight: 500 }}>✅ {message}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Left: List of groups */}
                <div>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>My Groups ({groups.owned.length + groups.member.length})</h3>

                    {groups.owned.length === 0 && groups.member.length === 0 ? (
                        <p style={{ color: '#666', fontSize: '14px' }}>No study groups yet. Create one below!</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                            {/* Owned groups */}
                            {groups.owned.map(g => (
                                <div
                                    key={g.id}
                                    onClick={() => setSelectedGroup(g)}
                                    style={{
                                        padding: '12px 16px',
                                        backgroundColor: selectedGroup?.id === g.id ? '#3b82f6' : 'white',
                                        color: selectedGroup?.id === g.id ? 'white' : '#1f2937',
                                        border: `2px solid #3b82f6`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => {
                                        if (selectedGroup?.id !== g.id) {
                                            e.currentTarget.style.backgroundColor = '#dbeafe';
                                        }
                                    }}
                                    onMouseOut={e => {
                                        if (selectedGroup?.id !== g.id) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                        }
                                    }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{g.name}</div>
                                    <div style={{ fontSize: '12px', fontWeight: 400, marginTop: '2px', opacity: 0.8 }}>👨‍💼 Owner • {g.members?.length || 0} members</div>
                                </div>
                            ))}

                            {/* Member groups */}
                            {groups.member.map(g => (
                                <div
                                    key={g.id}
                                    onClick={() => setSelectedGroup(g)}
                                    style={{
                                        padding: '12px 16px',
                                        backgroundColor: selectedGroup?.id === g.id ? '#10b981' : 'white',
                                        color: selectedGroup?.id === g.id ? 'white' : '#1f2937',
                                        border: `2px solid #10b981`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => {
                                        if (selectedGroup?.id !== g.id) {
                                            e.currentTarget.style.backgroundColor = '#d1fae5';
                                        }
                                    }}
                                    onMouseOut={e => {
                                        if (selectedGroup?.id !== g.id) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                        }
                                    }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{g.name}</div>
                                    <div style={{ fontSize: '12px', fontWeight: 400, marginTop: '2px', opacity: 0.8 }}>👤 Member • {g.members?.length || 0} members</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create group form */}
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                        {!showCreateForm ? (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                style={{
                                    width: '100%',
                                    padding: '12px 20px',
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
                                + Create New Group
                            </button>
                        ) : (
                            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Create New Study Group</h3>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px', color: '#374151' }}>Group Name</label>
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={e => setGroupName(e.target.value)}
                                        placeholder="e.g., Math Study Group"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px', color: '#374151' }}>Description (optional)</label>
                                    <textarea
                                        value={groupDescription}
                                        onChange={e => setGroupDescription(e.target.value)}
                                        placeholder="What is this group about?"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            minHeight: '80px',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
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
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            backgroundColor: '#e5e7eb',
                                            color: '#374151',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.target.style.backgroundColor = '#d1d5db'}
                                        onMouseOut={e => e.target.style.backgroundColor = '#e5e7eb'}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Right: Group details and member management */}
                <div>
                    {selectedGroup ? (
                        <>
                            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                                📋 {selectedGroup.name}
                            </h3>
                            {selectedGroup.description && (
                                <p style={{ margin: '0 0 16px', color: '#666', fontSize: '14px' }}>{selectedGroup.description}</p>
                            )}

                            {/* Members list */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>Members ({selectedGroup.members?.length || 0})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selectedGroup.members?.map(m => (
                                        <div
                                            key={m.id}
                                            style={{
                                                padding: '12px',
                                                backgroundColor: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#1f2937' }}>{m.name}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>{m.email}</p>
                                            </div>
                                            {selectedGroup.ownerId === m.id && (
                                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6', backgroundColor: '#dbeafe', padding: '4px 8px', borderRadius: '4px' }}>Owner</span>
                                            )}
                                            {selectedGroup.ownerId !== m.id && selectedGroup.ownerId === user?.id && (
                                                <button
                                                    onClick={() => handleRemoveMember(selectedGroup.id, m.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#fee2e2',
                                                        color: '#991b1b',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={e => e.target.style.backgroundColor = '#fecaca'}
                                                    onMouseOut={e => e.target.style.backgroundColor = '#fee2e2'}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add member form - only for group owner */}
                            {selectedGroup.ownerId === user?.id && (
                                <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                    <h4 style={{ margin: '16px 0 12px', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>Add Member</h4>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                        <input
                                            type="email"
                                            value={addMemberEmail}
                                            onChange={e => setAddMemberEmail(e.target.value)}
                                            placeholder="student@stud.ase.ro"
                                            style={{
                                                flex: 1,
                                                padding: '10px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                            onBlur={e => e.target.style.borderColor = '#d1d5db'}
                                        />
                                        <button
                                            onClick={handleSearchUser}
                                            style={{
                                                padding: '10px 16px',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap'
                                            }}
                                            onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
                                            onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
                                        >
                                            Search
                                        </button>
                                    </div>

                                    {searchResult && (
                                        <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '6px', marginBottom: '12px' }}>
                                            <p style={{ margin: '0 0 8px', fontWeight: 500, fontSize: '14px', color: '#1f2937' }}>{searchResult.name}</p>
                                            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#374151' }}>{searchResult.email}</p>
                                            <button
                                                onClick={handleAddMember}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={e => e.target.style.backgroundColor = '#059669'}
                                                onMouseOut={e => e.target.style.backgroundColor = '#10b981'}
                                            >
                                                Add to Group
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '40px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                            Select a group to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

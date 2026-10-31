import React, { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import {
  Mail, Building, Trash2, Search, ShieldCheck, MapPin,
  UserCheck, Users, HelpCircle, ArrowUpRight, Edit2, Check, X, Download
} from 'lucide-react';

const exportToCSV = (data, filename) => {
  const headers = ['Company', 'Location', 'Contact Person', 'Email', 'Date Added'];
  const rows = data.map(c => [
    c.company || '',
    c.location || '',
    c.person || '',
    c.email || '',
    c.dateAdded ? new Date(c.dateAdded).toLocaleDateString() : ''
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const ContactHub = () => {
  const { contacts, setContacts, removeContact } = useResume();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const filtered = contacts.filter(c =>
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.person || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const verified = filtered.filter(c => c.email && c.email.trim() !== '');
  const research = filtered.filter(c => !c.email || c.email.trim() === '');

  const startEdit  = (c) => { setEditingId(c.id); setEditForm({ ...c }); };
  const cancelEdit = () => { setEditingId(null); setEditForm(null); };
  const saveEdit   = () => {
    setContacts(prev => prev.map(c => c.id === editingId ? editForm : c));
    cancelEdit();
  };


  const LeadTable = ({ data, icon: Icon, label, emptyText, accentColor, badgeBg, badgeText, exportFilename }) => (
    <div style={{ marginBottom: '3rem' }}>
      {/* Section Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <Icon size={13} style={{ color: accentColor }} />
        <span style={{
          fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: accentColor
        }}>
          {label}
        </span>
        <span style={{
          fontSize: '10px', fontWeight: 700, padding: '1px 8px',
          borderRadius: '999px', background: badgeBg, color: badgeText
        }}>
          {data.length}
        </span>
        {data.length > 0 && (
          <button
            onClick={() => exportToCSV(data, exportFilename)}
            title={`Export ${label} to Excel/CSV`}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 12px', borderRadius: 8, border: '1.5px solid var(--glass-border)',
              background: 'white', cursor: 'pointer', fontSize: 10.5, fontWeight: 700,
              color: 'var(--text-secondary)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Download size={12} />
            Export CSV
          </button>
        )}
      </div>

      {/* Table Card */}
      <div style={{
        background: 'var(--bg-card, white)',
        border: '1.5px solid var(--glass-border)',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
            <thead>
              <tr style={{
                borderBottom: '1.5px solid var(--glass-border)',
                background: 'rgba(248,248,252,0.9)'
              }}>
                {['Company & Location', 'Contact Person', 'Email Address', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    padding: '12px 20px',
                    fontSize: '9.5px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    color: 'var(--text-muted)',
                    textAlign: i === 3 ? 'right' : 'left',
                    width: i === 0 ? '32%' : i === 1 ? '23%' : i === 2 ? '32%' : '13%'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{
                    padding: '48px 20px', textAlign: 'center',
                    fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em'
                  }}>
                    {emptyText}
                  </td>
                </tr>
              ) : data.map((contact, idx) => {
                const isEditing = editingId === contact.id;
                const isLast = idx === data.length - 1;
                return (
                  <tr key={contact.id} style={{
                    borderBottom: isLast ? 'none' : '1px solid var(--glass-border)',
                    background: isEditing ? 'rgba(79,70,229,0.04)' : 'transparent',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Company */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10, background: 'white',
                          border: '1px solid var(--border)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
                        }}>
                          <Building size={14} color="#6366f1" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                          {isEditing ? (
                            <>
                              <input
                                value={editForm.company}
                                onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                                style={{ fontSize: 13, fontWeight: 700, border: '1.5px solid #c7d2fe', borderRadius: 8, padding: '5px 10px', outline: 'none', marginBottom: 6, width: '100%' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <MapPin size={10} color="var(--text-muted)" />
                                <input
                                  value={editForm.location}
                                  onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                  style={{ fontSize: 11, border: '1px solid #e0e7ff', borderRadius: 6, padding: '3px 8px', outline: 'none', width: '100%' }}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.company}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <MapPin size={9} color="var(--text-muted)" />
                                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {contact.location}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Person */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserCheck size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        {isEditing
                          ? <input value={editForm.person || ''} onChange={e => setEditForm({ ...editForm, person: e.target.value })} placeholder="Name..." style={{ fontSize: 13, fontWeight: 600, border: '1.5px solid #c7d2fe', borderRadius: 8, padding: '5px 10px', outline: 'none', width: '100%' }} />
                          : <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{contact.person || '—'}</span>
                        }
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Mail size={13} color={contact.email ? '#6366f1' : '#fca5a5'} style={{ flexShrink: 0 }} />
                        {isEditing
                          ? <input value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="Add email address..." style={{ fontSize: 13, fontWeight: 600, border: '1.5px solid #c7d2fe', borderRadius: 8, padding: '5px 10px', outline: 'none', width: '100%' }} />
                          : <span style={{ fontSize: 13, fontWeight: contact.email ? 600 : 500, color: contact.email ? '#4f46e5' : '#f87171', fontStyle: contact.email ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {contact.email || 'Email missing — research required'}
                            </span>
                        }
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          <button onClick={saveEdit} className="btn btn-emerald" style={{ height: 32, padding: '0 14px', fontSize: 11, fontWeight: 700 }}>
                            <Check size={13} /> Save
                          </button>
                          <button onClick={cancelEdit} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="group-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, opacity: 0, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        >
                          {contact.email && (
                            <a href={`mailto:${contact.email}`} className="btn btn-primary" style={{ height: 32, padding: '0 12px', fontSize: 11, fontWeight: 700 }}>
                              <ArrowUpRight size={12} /> Reach Out
                            </a>
                          )}
                          <button onClick={() => startEdit(contact)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => removeContact(contact.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fee2e2', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca5a5' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <section className="no-print animate-fade-in" style={{ marginTop: '5rem', paddingBottom: '3rem' }}>

      {/* ── Hub Header ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="step-indicator step-indicator-violet">
              <Users size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>HR Outreach Hub</h2>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>
                Persistent lead tracking · {contacts.length} total {contacts.length === 1 ? 'lead' : 'leads'} saved
              </p>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search leads, companies..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                height: 40, paddingLeft: 36, paddingRight: 16, fontSize: 12,
                border: '1.5px solid var(--glass-border)', borderRadius: 10,
                background: 'white', outline: 'none', width: 300,
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)', color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Tables ── */}
      <LeadTable
        data={verified}
        icon={ShieldCheck}
        label="Verified Contacts"
        emptyText="No verified contacts — leads with emails will appear here."
        accentColor="#059669"
        badgeBg="#d1fae5"
        badgeText="#065f46"
        exportFilename="hr-verified-contacts.csv"
      />

      <LeadTable
        data={research}
        icon={HelpCircle}
        label="Research Queue — Missing Emails"
        emptyText="All leads have verified emails."
        accentColor="#e11d48"
        badgeBg="#ffe4e6"
        badgeText="#9f1239"
        exportFilename="hr-research-queue.csv"
      />

      {/* ── Footer ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderRadius: 14, marginTop: '1rem',
        border: '1.5px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(8px)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 0 3px rgba(52,211,153,0.3)' }} />
          Saved to local storage
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Verified</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#1e1b4b', lineHeight: 1 }}>{verified.length}</div>
          </div>
          <div style={{ width: 1, height: 36, background: 'var(--glass-border)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Pending</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#e11d48', lineHeight: 1 }}>{research.length}</div>
          </div>
        </div>
      </div>

      {/* hover-reveal actions fix */}
      <style>{`
        tr:hover .group-actions { opacity: 1 !important; }
      `}</style>
    </section>
  );
};

export default ContactHub;

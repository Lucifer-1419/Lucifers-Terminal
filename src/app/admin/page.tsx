'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, Activity, UserX, UserCheck } from 'lucide-react';

type Command = { id: string; commandName: string; expectedOutput: string; delayTime: number };
type User = { id: string; username: string; role: string; progress: number; tokens: number; tokenTarget: number; isRestricted: boolean; restrictionMessage: string | null; createdAt: string };
type Log = { id: string; command: string; isSuccess: boolean; user: { username: string }; createdAt: string };
type Task = { id: string; title: string; status: string; assignedTo: { username: string } };

export default function AdminDashboard() {
  const [tab, setTab] = useState<'users' | 'logs' | 'tasks' | 'commands'>('users');
  
  // Data States
  const [commands, setCommands] = useState<Command[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Form States
  const [cmdName, setCmdName] = useState('');
  const [output, setOutput] = useState('');
  const [delay, setDelay] = useState(500);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskUserId, setTaskUserId] = useState('');

  // Filtering & Modals
  const [logFilterUser, setLogFilterUser] = useState<string>('');
  const [restrictUser, setRestrictUser] = useState<User | null>(null);
  const [restrictMsg, setRestrictMsg] = useState('');

  useEffect(() => {
    if (tab === 'commands') fetchCommands();
    if (tab === 'users') fetchUsers();
    if (tab === 'logs') fetchLogs();
    if (tab === 'tasks') { fetchTasks(); fetchUsers(); }
  }, [tab]);

  const fetchCommands = async () => { const res = await fetch('/api/admin/commands'); if(res.ok) setCommands(await res.json()); };
  const fetchUsers = async () => { const res = await fetch('/api/admin/users'); if(res.ok) setUsers(await res.json()); };
  const fetchLogs = async () => { const res = await fetch('/api/admin/logs'); if(res.ok) setLogs(await res.json()); };
  const fetchTasks = async () => { const res = await fetch('/api/admin/tasks'); if(res.ok) setTasks(await res.json()); };

  const handleSaveCmd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/commands', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commandName: cmdName, expectedOutput: output, delayTime: delay }),
    });
    setCmdName(''); setOutput(''); setDelay(500);
    fetchCommands();
  };

  const handleTargetUpdate = async (userId: string, target: string) => {
    await fetch('/api/admin/users/target', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, target })
    });
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, password: newPassword }),
    });
    setNewUsername(''); setNewPassword('');
    fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to permanently delete this user? All their logs and data will be lost.")) {
      await fetch('/api/admin/users', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      fetchUsers();
    }
  };

  const handleSaveRestriction = async () => {
    if (!restrictUser) return;
    await fetch('/api/admin/users/restrict', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: restrictUser.id, 
        isRestricted: !restrictUser.isRestricted, 
        restrictionMessage: restrictUser.isRestricted ? null : (restrictMsg || "Your device is at limit of Token Generation, please consider upgrading the hardware")
      }),
    });
    setRestrictUser(null);
    fetchUsers();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: taskTitle, description: taskDesc, assignedToId: taskUserId }),
    });
    setTaskTitle(''); setTaskDesc(''); setTaskUserId('');
    fetchTasks();
  };

  const viewUserLogs = (username: string) => {
    setLogFilterUser(username);
    setTab('logs');
  };

  const filteredLogs = logFilterUser ? logs.filter(l => l.user.username === logFilterUser) : logs;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(239, 41, 41, 0.3)', paddingBottom: '16px' }}>
        {['users', 'logs', 'tasks', 'commands'].map(t => (
          <button 
            key={t}
            onClick={() => setTab(t as any)}
            style={{ 
              background: tab === t ? 'rgba(239, 41, 41, 0.1)' : 'transparent', 
              color: tab === t ? '#ef2929' : '#888',
              border: tab === t ? '1px solid #ef2929' : '1px solid #333', 
              padding: '8px 24px', borderRadius: '4px', textTransform: 'capitalize', cursor: 'pointer',
              fontWeight: tab === t ? 'bold' : 'normal', transition: 'all 0.2s'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="admin-grid">
          <div className="admin-panel">
            <h2 className="admin-panel-title">Deploy Operative</h2>
            <form onSubmit={handleCreateUser} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">System ID (Username)</label>
                <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="admin-input" required />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Passphrase</label>
                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="admin-input" required />
              </div>
              <button type="submit" className="admin-btn" style={{ background: '#ef2929', borderColor: '#ef2929' }}>Create User</button>
            </form>
          </div>
          
          <div className="admin-panel">
            <h2 className="admin-panel-title">Active Operatives</h2>
            <div className="admin-list" style={{ gap: '12px' }}>
              {users.map(u => (
                <div key={u.id} className="admin-list-item" style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: u.isRestricted ? '1px solid rgba(239,41,41,0.5)' : '1px solid #333', background: u.isRestricted ? 'rgba(239,41,41,0.05)' : 'rgba(0,0,0,0.3)' }}>
                  
                  {/* Top Row: User Info & Core Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{u.username}</span>
                      {u.role === 'ADMIN' && <span style={{ background: '#ef2929', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>ADMIN</span>}
                      {u.isRestricted && <span style={{ background: 'rgba(239,41,41,0.2)', color: '#ef2929', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #ef2929' }}>RESTRICTED</span>}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ color: '#888', fontSize: '12px' }}>Yield: <strong style={{ color: '#ceaa61', fontSize: '14px' }}>{u.tokens}</strong></span>
                      {u.role !== 'ADMIN' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#888', fontSize: '12px' }}>Target:</span>
                          <input 
                            type="number" 
                            defaultValue={u.tokenTarget} 
                            onBlur={(e) => handleTargetUpdate(u.id, e.target.value)}
                            className="admin-input" 
                            style={{ width: '60px', padding: '4px 6px', fontSize: '12px', background: '#000' }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  {u.role !== 'ADMIN' && (
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                      <button onClick={() => viewUserLogs(u.username)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        <Activity size={14} /> Telemetry
                      </button>
                      
                      <button onClick={() => { setRestrictUser(u); setRestrictMsg(u.restrictionMessage || ''); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: u.isRestricted ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 41, 41, 0.1)', border: u.isRestricted ? '1px solid #4ade80' : '1px solid #ef2929', color: u.isRestricted ? '#4ade80' : '#ef2929', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        {u.isRestricted ? <UserCheck size={14} /> : <UserX size={14} />} 
                        {u.isRestricted ? 'Lift Restriction' : 'Restrict'}
                      </button>
                      
                      <button onClick={() => handleDeleteUser(u.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #555', color: '#888', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {tab === 'logs' && (
        <div className="admin-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="admin-panel-title" style={{ marginBottom: 0 }}>
              {logFilterUser ? `Telemetry: ${logFilterUser}` : 'Global Real-Time Telemetry'}
            </h2>
            {logFilterUser && (
              <button onClick={() => setLogFilterUser('')} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                Clear Filter
              </button>
            )}
          </div>
          
          <div className="admin-list">
            {filteredLogs.map(log => (
              <div key={log.id} style={{ border: '1px solid #333', padding: '12px', display: 'flex', justifyContent: 'space-between', background: log.isSuccess ? 'rgba(0,255,0,0.02)' : 'rgba(255,0,0,0.02)' }}>
                <div>
                  <span style={{ color: '#555' }}>[{new Date(log.createdAt).toLocaleTimeString()}]</span> 
                  <strong style={{ color: '#ceaa61', marginLeft: '12px', width: '100px', display: 'inline-block' }}>{log.user.username}</strong>
                  <span style={{ color: '#333', margin: '0 8px' }}>|</span>
                  <code style={{ color: log.isSuccess ? '#4ade80' : '#f87171' }}>{log.command}</code>
                </div>
                <div style={{ color: log.isSuccess ? '#4ade80' : '#f87171', fontSize: '12px', fontWeight: 'bold' }}>
                  {log.isSuccess ? 'SUCCESS' : 'NOT FOUND'}
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: '24px' }}>No telemetry data found.</div>}
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="admin-grid">
          <div className="admin-panel">
            <h2 className="admin-panel-title">Assign Mission</h2>
            <form onSubmit={handleCreateTask} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Target Operative</label>
                <select value={taskUserId} onChange={e => setTaskUserId(e.target.value)} className="admin-input" required>
                  <option value="">Select an operative...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Mission Briefing</label>
                <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="admin-input" required />
              </div>
              <button type="submit" className="admin-btn">Dispatch Mission</button>
            </form>
          </div>
          <div className="admin-panel">
            <h2 className="admin-panel-title">Active Missions</h2>
            <div className="admin-list">
              {tasks.map(t => (
                <div key={t.id} className="admin-list-item">
                  <div style={{ color: 'white', fontWeight: 'bold' }}>{t.title}</div>
                  <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>Operative: <span style={{ color: '#ceaa61' }}>{t.assignedTo.username}</span> | Status: <span style={{ color: t.status === 'COMPLETED' ? '#4ade80' : '#fce94f' }}>{t.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Commands Tab */}
      {tab === 'commands' && (
        <div className="admin-grid">
          <div className="admin-panel">
            <h2 className="admin-panel-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Create Custom Command
              <a href="/commands_reference.txt" target="_blank" style={{ fontSize: '14px', color: '#ceaa61', textDecoration: 'underline' }}>View Built-in Cheat Sheet</a>
            </h2>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '16px' }}>Tip: Use <code>[delay:ms]</code> for streaming output. Example:<br/><code>[delay:500] Fetching...<br/>[delay:1000] Done.</code></p>
            <form onSubmit={handleSaveCmd} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Command Trigger</label>
                <input type="text" value={cmdName} onChange={e => setCmdName(e.target.value)} className="admin-input" placeholder="e.g. apt-get update" required />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Command Output</label>
                <textarea value={output} onChange={e => setOutput(e.target.value)} className="admin-textarea" placeholder="[delay:500] Hit:1 http://kali.download..." required />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Initial Processing Delay (ms)</label>
                <input type="number" value={delay} onChange={e => setDelay(Number(e.target.value))} className="admin-input" required />
              </div>
              <button type="submit" className="admin-btn">Save Command</button>
            </form>
          </div>
          <div className="admin-panel">
            <h2 className="admin-panel-title">Active Custom Commands</h2>
            <div className="admin-list">
              {commands.map(cmd => (
                <div key={cmd.id} className="admin-list-item">
                  <div className="admin-list-title">{cmd.commandName} <span className="admin-list-delay">{cmd.delayTime}ms</span></div>
                  <div className="admin-list-output">{cmd.expectedOutput}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Restriction Modal */}
      {restrictUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '32px', width: '400px', boxShadow: '0 10px 40px rgba(0,0,0,1)' }}>
            <h3 style={{ color: restrictUser.isRestricted ? '#4ade80' : '#ef2929', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} /> 
              {restrictUser.isRestricted ? 'Lift Hardware Restriction?' : 'Impose Hardware Restriction'}
            </h3>
            
            {!restrictUser.isRestricted ? (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#888', fontSize: '12px', marginBottom: '8px' }}>Custom Terminal Intercept Message</label>
                <textarea 
                  value={restrictMsg} 
                  onChange={(e) => setRestrictMsg(e.target.value)}
                  className="admin-textarea" 
                  style={{ width: '100%', minHeight: '80px', fontSize: '12px' }}
                  placeholder="Your device is at limit of Token Generation, please consider upgrading the hardware"
                />
              </div>
            ) : (
              <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '24px' }}>
                This will lift the restriction on <strong>{restrictUser.username}</strong>, allowing them to generate tokens again.
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setRestrictUser(null)}
                style={{ background: 'transparent', color: '#888', border: '1px solid #555', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveRestriction}
                style={{ background: restrictUser.isRestricted ? '#4ade80' : '#ef2929', color: restrictUser.isRestricted ? '#000' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {restrictUser.isRestricted ? 'Confirm Lift' : 'Confirm Restriction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

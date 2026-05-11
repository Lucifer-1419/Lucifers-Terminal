'use client';

import { useState, useEffect } from 'react';

type Command = { id: string; commandName: string; expectedOutput: string; delayTime: number };
type User = { id: string; username: string; role: string; progress: number; tokens: number; tokenTarget: number; createdAt: string };
type Log = { id: string; command: string; isSuccess: boolean; user: { username: string }; createdAt: string };
type Task = { id: string; title: string; status: string; assignedTo: { username: string } };

export default function AdminDashboard() {
  const [tab, setTab] = useState<'commands' | 'users' | 'tasks' | 'logs'>('logs');
  
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: taskTitle, description: taskDesc, assignedToId: taskUserId }),
    });
    setTaskTitle(''); setTaskDesc(''); setTaskUserId('');
    fetchTasks();
  };

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
        {['logs', 'users', 'tasks', 'commands'].map(t => (
          <button 
            key={t}
            onClick={() => setTab(t as any)}
            style={{ 
              background: tab === t ? '#2d2d2d' : 'transparent', 
              color: tab === t ? 'white' : '#888',
              border: '1px solid #333', padding: '8px 16px', borderRadius: '4px', textTransform: 'capitalize', cursor: 'pointer'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Logs Tab */}
      {tab === 'logs' && (
        <div className="admin-panel">
          <h2 className="admin-panel-title">Real-Time Command Telemetry</h2>
          <div className="admin-list">
            {logs.map(log => (
              <div key={log.id} style={{ border: '1px solid #333', padding: '12px', display: 'flex', justifyContent: 'space-between', background: log.isSuccess ? 'rgba(0,255,0,0.05)' : 'rgba(255,0,0,0.05)' }}>
                <div>
                  <span style={{ color: '#888' }}>[{new Date(log.createdAt).toLocaleTimeString()}]</span> 
                  <strong style={{ color: 'white', marginLeft: '8px' }}>{log.user.username}</strong>: 
                  <code style={{ marginLeft: '8px', color: log.isSuccess ? '#4ade80' : '#f87171' }}>{log.command}</code>
                </div>
                <div style={{ color: log.isSuccess ? '#4ade80' : '#f87171' }}>
                  {log.isSuccess ? 'SUCCESS' : 'NOT FOUND'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="admin-grid">
          <div className="admin-panel">
            <h2 className="admin-panel-title">Create User</h2>
            <form onSubmit={handleCreateUser} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Username</label>
                <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="admin-input" required />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Password</label>
                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="admin-input" required />
              </div>
              <button type="submit" className="admin-btn">Create User</button>
            </form>
          </div>
          <div className="admin-panel">
            <h2 className="admin-panel-title">Active Users</h2>
            <div className="admin-list">
              {users.map(u => (
                <div key={u.id} className="admin-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{u.username} <span style={{ color: '#888', fontSize: '12px', fontWeight: 'normal' }}>({u.role})</span></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: 'var(--term-dir)' }}>Progress: {u.progress}% | Tokens: <strong style={{ color: '#ceaa61' }}>{u.tokens}</strong></span>
                    {u.role !== 'ADMIN' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#888', fontSize: '12px' }}>Target:</span>
                        <input 
                          type="number" 
                          defaultValue={u.tokenTarget} 
                          onBlur={(e) => handleTargetUpdate(u.id, e.target.value)}
                          className="admin-input" 
                          style={{ width: '60px', padding: '2px 4px', fontSize: '12px' }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="admin-grid">
          <div className="admin-panel">
            <h2 className="admin-panel-title">Assign Task</h2>
            <form onSubmit={handleCreateTask} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Target User</label>
                <select value={taskUserId} onChange={e => setTaskUserId(e.target.value)} className="admin-input" required>
                  <option value="">Select a user...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Task Title</label>
                <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="admin-input" required />
              </div>
              <button type="submit" className="admin-btn">Assign Task</button>
            </form>
          </div>
          <div className="admin-panel">
            <h2 className="admin-panel-title">Assigned Tasks</h2>
            <div className="admin-list">
              {tasks.map(t => (
                <div key={t.id} className="admin-list-item">
                  <div style={{ color: 'white', fontWeight: 'bold' }}>{t.title}</div>
                  <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>Assigned to: {t.assignedTo.username} | Status: {t.status}</div>
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
              Create Mock Command
              <a href="/commands_reference.txt" target="_blank" style={{ fontSize: '14px', color: '#ceaa61', textDecoration: 'underline' }}>View Built-in Cheat Sheet</a>
            </h2>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '16px' }}>Tip: Use <code>[delay:ms]</code> for streaming output. Example:<br/><code>[delay:500] Fetching...<br/>[delay:1000] Done.</code></p>
            <form onSubmit={handleSaveCmd} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Command Trigger</label>
                <input type="text" value={cmdName} onChange={e => setCmdName(e.target.value)} className="admin-input" placeholder="e.g. apt-get update" required />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Mock Output</label>
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
            <h2 className="admin-panel-title">Active Mocks</h2>
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
    </div>
  );
}

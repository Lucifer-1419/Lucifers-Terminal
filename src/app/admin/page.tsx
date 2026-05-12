'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, Activity, UserX, UserCheck, LayoutDashboard, Users, TerminalSquare, Target, Cpu, Server, ArrowLeft } from 'lucide-react';

type Command = { id: string; commandName: string; expectedOutput: string; delayTime: number };
type User = { id: string; username: string; role: string; progress: number; tokens: number; tokenTarget: number; isRestricted: boolean; restrictionMessage: string | null; createdAt: string };
type Log = { id: string; command: string; isSuccess: boolean; user: { username: string }; createdAt: string };
type Task = { id: string; title: string; status: string; assignedTo: { username: string } };

export default function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'users' | 'logs' | 'tasks' | 'commands'>('overview');
  
  // Data States
  const [commands, setCommands] = useState<Command[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Detailed View States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form States
  const [cmdName, setCmdName] = useState('');
  const [output, setOutput] = useState('');
  const [delay, setDelay] = useState(500);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskUserId, setTaskUserId] = useState('');

  // Modals
  const [restrictUser, setRestrictUser] = useState<User | null>(null);
  const [restrictMsg, setRestrictMsg] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchLogs();
    fetchTasks();
    fetchCommands();
  }, []);

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
    // Update local selected user state if active
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, tokenTarget: parseInt(target) } : null);
    }
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
    if (confirm("Are you sure you want to permanently delete this operative? All their logs and data will be lost.")) {
      await fetch('/api/admin/users', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (selectedUser?.id === userId) setSelectedUser(null);
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
    
    // Update local states
    const newStatus = !restrictUser.isRestricted;
    const newMsg = restrictUser.isRestricted ? null : (restrictMsg || "Your device is at limit of Token Generation, please consider upgrading the hardware");
    
    if (selectedUser?.id === restrictUser.id) {
      setSelectedUser(prev => prev ? { ...prev, isRestricted: newStatus, restrictionMessage: newMsg } : null);
    }
    
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

  // KPI Calculations
  const totalTokens = users.reduce((acc, user) => acc + user.tokens, 0);
  const activeOperatives = users.filter(u => u.role !== 'ADMIN').length;
  const restrictedOperatives = users.filter(u => u.isRestricted).length;

  const NavItem = ({ id, icon: Icon, label }: { id: typeof tab, icon: any, label: string }) => (
    <button 
      onClick={() => { setTab(id); setSelectedUser(null); }}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
        background: tab === id && !selectedUser ? 'linear-gradient(90deg, rgba(239, 41, 41, 0.15) 0%, transparent 100%)' : 'transparent',
        borderLeft: tab === id && !selectedUser ? '3px solid #ef2929' : '3px solid transparent',
        color: tab === id && !selectedUser ? 'white' : '#888',
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontSize: '14px', fontWeight: tab === id && !selectedUser ? 'bold' : 'normal'
      }}
    >
      <Icon size={18} color={tab === id && !selectedUser ? '#ef2929' : '#888'} />
      {label}
    </button>
  );

  return (
    <div className="admin-layout">
      
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Server color="#ef2929" size={24} />
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>LUCIFER CORE</h1>
              <div style={{ fontSize: '10px', color: '#ceaa61', marginTop: '4px' }}>ADMINISTRATION PANEL</div>
            </div>
          </div>
        </div>

        <div className="admin-sidebar-nav">
          <NavItem id="overview" icon={LayoutDashboard} label="Global Overview" />
          <NavItem id="users" icon={Users} label="Operative Network" />
          <NavItem id="logs" icon={Activity} label="Global Telemetry" />
          <NavItem id="tasks" icon={Target} label="Mission Control" />
          <NavItem id="commands" icon={TerminalSquare} label="Command Logic" />
        </div>

        <div className="admin-sidebar-footer">
          SYSTEM STATUS: ONLINE<br/>
          ENCRYPTION: AES-256
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main">
        
        {/* OVERVIEW TAB */}
        {tab === 'overview' && !selectedUser && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 className="admin-panel-title">
              <Cpu color="#ceaa61" /> System Overview
            </h2>

            <div className="admin-kpi-grid">
              {[
                { label: 'Total Tokens Mined', value: totalTokens, color: '#ceaa61' },
                { label: 'Active Operatives', value: activeOperatives, color: '#4ade80' },
                { label: 'Restricted Systems', value: restrictedOperatives, color: '#ef2929' },
                { label: 'Total Telemetry Logs', value: logs.length, color: '#60a5fa' },
              ].map((kpi, i) => (
                <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            <div className="admin-content-grid">
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>Recent Telemetry</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {logs.slice(0, 5).map(log => (
                    <div key={log.id} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#555' }}>[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                      <span style={{ color: '#ceaa61', flex: 1, margin: '0 12px' }}>{log.user.username}</span>
                      <span style={{ color: log.isSuccess ? '#4ade80' : '#f87171' }}>{log.command}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>Active Missions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.slice(0, 5).map(t => (
                    <div key={t.id} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'white' }}>{t.title}</span>
                      <span style={{ background: t.status === 'COMPLETED' ? 'rgba(74,222,128,0.1)' : 'rgba(252,233,79,0.1)', color: t.status === 'COMPLETED' ? '#4ade80' : '#fce94f', padding: '2px 8px', borderRadius: '4px' }}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OPERATIVE PROFILE VIEW */}
        {selectedUser && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <button 
              onClick={() => setSelectedUser(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '24px', fontSize: '14px' }}
            >
              <ArrowLeft size={16} /> Back to Network
            </button>

            {/* Profile Header Card */}
            <div style={{ background: '#111', border: selectedUser.isRestricted ? '1px solid #ef2929' : '1px solid #222', borderRadius: '8px', padding: '32px', marginBottom: '24px', boxShadow: selectedUser.isRestricted ? '0 0 40px rgba(239,41,41,0.1)' : '0 4px 20px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
              {selectedUser.isRestricted && <div style={{ position: 'absolute', top: 0, right: 0, background: '#ef2929', color: 'white', padding: '4px 24px', fontSize: '10px', fontWeight: 'bold', transform: 'rotate(45deg) translate(20px, -20px)' }}>RESTRICTED</div>}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>OPERATIVE ID</div>
                  <h2 style={{ fontSize: '32px', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {selectedUser.username}
                    {selectedUser.role === 'ADMIN' && <span style={{ background: '#ef2929', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>ADMIN</span>}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>Deployed: {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                </div>

                {selectedUser.role !== 'ADMIN' && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => { setRestrictUser(selectedUser); setRestrictMsg(selectedUser.restrictionMessage || ''); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: selectedUser.isRestricted ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 41, 41, 0.1)', border: selectedUser.isRestricted ? '1px solid #4ade80' : '1px solid #ef2929', color: selectedUser.isRestricted ? '#4ade80' : '#ef2929', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                    >
                      {selectedUser.isRestricted ? <UserCheck size={16} /> : <UserX size={16} />} 
                      {selectedUser.isRestricted ? 'Lift Restriction' : 'Impose Restriction'}
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #555', color: '#888', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                    >
                      <Trash2 size={16} /> Terminate
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="admin-profile-stats">
                <div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Tokens Mined</div>
                  <div style={{ fontSize: '28px', color: '#ceaa61', fontWeight: 'bold' }}>{selectedUser.tokens}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Mission Progress</div>
                  <div style={{ fontSize: '28px', color: '#60a5fa', fontWeight: 'bold' }}>{selectedUser.progress}%</div>
                </div>
                {selectedUser.role !== 'ADMIN' && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Extraction Target</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="number" 
                        defaultValue={selectedUser.tokenTarget} 
                        onBlur={(e) => handleTargetUpdate(selectedUser.id, e.target.value)}
                        style={{ width: '80px', padding: '8px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '20px', fontWeight: 'bold' }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Specific Telemetry */}
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#60a5fa" /> Operative Telemetry
              </h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', background: '#050505', padding: '16px', borderRadius: '4px', border: '1px solid #1a1a1a' }}>
                {logs.filter(l => l.user.username === selectedUser.username).length === 0 ? (
                  <div style={{ color: '#555', textAlign: 'center', padding: '20px' }}>No command history found.</div>
                ) : (
                  logs.filter(l => l.user.username === selectedUser.username).map(log => (
                    <div key={log.id} style={{ fontSize: '13px', display: 'flex', gap: '16px' }}>
                      <span style={{ color: '#555', minWidth: '80px' }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
                      <span style={{ color: log.isSuccess ? '#4ade80' : '#f87171', minWidth: '60px' }}>{log.isSuccess ? '[OK]' : '[FAIL]'}</span>
                      <span style={{ color: '#ddd' }}>{log.command}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* USERS NETWORK TAB */}
        {tab === 'users' && !selectedUser && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <h2 className="admin-panel-title">
                <Users color="#60a5fa" /> Operative Network
              </h2>
            </div>

            <div className="admin-content-grid-alt">
              {/* Create User Form */}
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '24px', height: 'fit-content' }}>
                <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>Deploy New Operative</h3>
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>System ID</label>
                    <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '4px' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Passphrase</label>
                    <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '4px' }} required />
                  </div>
                  <button type="submit" style={{ background: '#ef2929', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' }}>Initialize Operative</button>
                </form>
              </div>

              {/* Users Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', alignContent: 'start' }}>
                {users.map(u => (
                  <div 
                    key={u.id} 
                    onClick={() => setSelectedUser(u)}
                    style={{ 
                      background: u.isRestricted ? 'rgba(239,41,41,0.05)' : '#111', 
                      border: u.isRestricted ? '1px solid rgba(239,41,41,0.3)' : '1px solid #222', 
                      borderRadius: '8px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = u.isRestricted ? '#ef2929' : '#60a5fa'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = u.isRestricted ? 'rgba(239,41,41,0.3)' : '#222'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '16px', color: 'white', fontWeight: 'bold' }}>{u.username}</div>
                        <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>{u.role}</div>
                      </div>
                      {u.isRestricted && <ShieldAlert size={16} color="#ef2929" />}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#888' }}>Tokens: <span style={{ color: '#ceaa61', fontWeight: 'bold' }}>{u.tokens}</span></span>
                      <span style={{ color: '#888' }}>Progress: <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{u.progress}%</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GLOBAL TELEMETRY TAB */}
        {tab === 'logs' && !selectedUser && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 className="admin-panel-title">
              <Activity color="#4ade80" /> Global Telemetry
            </h2>
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 150px 1fr', paddingBottom: '12px', borderBottom: '1px solid #222', color: '#888', fontSize: '12px', fontWeight: 'bold', marginBottom: '12px', minWidth: '500px' }}>
                  <div>TIMESTAMP</div>
                  <div>STATUS</div>
                  <div>OPERATIVE</div>
                  <div>COMMAND</div>
                </div>
                <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '500px' }}>
                  {logs.map(log => (
                    <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '120px 100px 150px 1fr', fontSize: '13px', alignItems: 'center', background: log.isSuccess ? 'rgba(74,222,128,0.02)' : 'rgba(239,41,41,0.02)', padding: '8px', borderRadius: '4px' }}>
                      <span style={{ color: '#555' }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
                      <span style={{ color: log.isSuccess ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{log.isSuccess ? 'SUCCESS' : 'FAILED'}</span>
                      <span style={{ color: '#ceaa61' }}>{log.user.username}</span>
                      <span style={{ color: '#ddd', fontFamily: 'monospace', wordBreak: 'break-all' }}>{log.command}</span>
                    </div>
                  ))}
                  {logs.length === 0 && <div style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No telemetry data captured.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MISSIONS TAB */}
        {tab === 'tasks' && !selectedUser && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 className="admin-panel-title">
              <Target color="#ceaa61" /> Mission Control
            </h2>
            <div className="admin-content-grid-alt">
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '24px', height: 'fit-content' }}>
                <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>Assign New Mission</h3>
                <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Target Operative</label>
                    <select value={taskUserId} onChange={e => setTaskUserId(e.target.value)} style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '4px' }} required>
                      <option value="">Select an operative...</option>
                      {users.filter(u => u.role !== 'ADMIN').map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Mission Briefing</label>
                    <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '4px' }} required />
                  </div>
                  <button type="submit" style={{ background: '#ceaa61', color: 'black', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' }}>Dispatch Mission</button>
                </form>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map(t => (
                  <div key={t.id} style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', color: 'white', fontWeight: 'bold', marginBottom: '6px' }}>{t.title}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>Operative: <span style={{ color: '#ceaa61' }}>{t.assignedTo.username}</span></div>
                    </div>
                    <span style={{ background: t.status === 'COMPLETED' ? 'rgba(74,222,128,0.1)' : 'rgba(252,233,79,0.1)', color: t.status === 'COMPLETED' ? '#4ade80' : '#fce94f', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM COMMANDS TAB */}
        {tab === 'commands' && !selectedUser && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 className="admin-panel-title">
              <TerminalSquare color="#f87171" /> Command Logic Core
            </h2>
            <div className="admin-content-grid-alt">
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '24px', height: 'fit-content' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '14px', color: '#888', margin: 0 }}>Register Command</h3>
                  <a href="/commands_reference.txt" target="_blank" style={{ fontSize: '12px', color: '#ceaa61', textDecoration: 'none' }}>Reference Guide ↗</a>
                </div>
                <form onSubmit={handleSaveCmd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Trigger Sequence</label>
                    <input type="text" value={cmdName} onChange={e => setCmdName(e.target.value)} style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '4px', fontFamily: 'monospace' }} placeholder="e.g. nmap" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Payload Output</label>
                    <textarea value={output} onChange={e => setOutput(e.target.value)} style={{ width: '100%', minHeight: '100px', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }} placeholder="[delay:500] Scanning..." required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Init Delay (ms)</label>
                    <input type="number" value={delay} onChange={e => setDelay(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '4px' }} required />
                  </div>
                  <button type="submit" style={{ background: '#f87171', color: 'black', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' }}>Inject Logic</button>
                </form>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {commands.map(cmd => (
                  <div key={cmd.id} style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '16px', color: '#f87171', fontWeight: 'bold', fontFamily: 'monospace' }}>{cmd.commandName}</span>
                      <span style={{ color: '#555', fontSize: '12px' }}>{cmd.delayTime}ms delay</span>
                    </div>
                    <div style={{ background: '#000', padding: '12px', borderRadius: '4px', border: '1px solid #1a1a1a', color: '#ddd', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {cmd.expectedOutput}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Modals */}
      {restrictUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '32px', width: '400px', boxShadow: '0 10px 40px rgba(0,0,0,1)' }}>
            <h3 style={{ color: restrictUser.isRestricted ? '#4ade80' : '#ef2929', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
              <ShieldAlert size={20} /> 
              {restrictUser.isRestricted ? 'Lift Hardware Restriction?' : 'Impose Hardware Restriction'}
            </h3>
            
            {!restrictUser.isRestricted ? (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#888', fontSize: '12px', marginBottom: '8px' }}>Custom Terminal Intercept Message</label>
                <textarea 
                  value={restrictMsg} 
                  onChange={(e) => setRestrictMsg(e.target.value)}
                  style={{ width: '100%', minHeight: '80px', padding: '12px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}
                  placeholder="Your device is at limit of Token Generation, please consider upgrading the hardware"
                />
              </div>
            ) : (
              <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '24px' }}>
                This will lift the restriction on <strong>{restrictUser.username}</strong>, allowing them to extract tokens again.
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setRestrictUser(null)} style={{ background: 'transparent', color: '#888', border: '1px solid #555', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveRestriction} style={{ background: restrictUser.isRestricted ? '#4ade80' : '#ef2929', color: restrictUser.isRestricted ? '#000' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                {restrictUser.isRestricted ? 'Confirm Lift' : 'Confirm Restriction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basic Keyframes for smooth tab switching and media queries */}
      <style dangerouslySetInnerHTML={{__html: `
        .admin-layout { display: flex; height: 100vh; background: #050505; color: #fff; font-family: monospace; flex-direction: row; }
        .admin-sidebar { width: 260px; border-right: 1px solid #222; display: flex; flex-direction: column; background: #0a0a0a; flex-shrink: 0; }
        .admin-sidebar-header { padding: 24px; border-bottom: 1px solid #222; margin-bottom: 16px; }
        .admin-sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; overflow-x: hidden; }
        .admin-sidebar-footer { padding: 24px; border-top: 1px solid #222; font-size: 10px; color: #555; }
        .admin-main { flex: 1; overflow-y: auto; padding: 40px; background: radial-gradient(circle at top right, #110505 0%, #050505 100%); }
        .admin-panel-title { font-size: 24px; margin-bottom: 32px; display: flex; align-items: center; gap: 12px; }
        .admin-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 40px; }
        .admin-content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .admin-content-grid-alt { display: grid; grid-template-columns: 1fr 3fr; gap: 32px; }
        .admin-profile-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px; padding-top: 32px; border-top: 1px solid #222; }

        @media (max-width: 1024px) {
          .admin-kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .admin-layout { flex-direction: column; }
          .admin-sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid #222; flex-direction: column; align-items: stretch; padding: 0; }
          .admin-sidebar-header { padding: 16px; border-bottom: 1px solid #222; margin: 0; display: flex; justify-content: center; }
          .admin-sidebar-nav { flex-direction: row; overflow-x: auto; flex: unset; padding: 0; white-space: nowrap; }
          .admin-sidebar-nav::-webkit-scrollbar { display: none; }
          .admin-sidebar-nav button { flex: 0 0 auto; padding: 12px 16px; font-size: 13px; border-left: none !important; border-bottom: 3px solid transparent; width: auto; justify-content: center; }
          .admin-sidebar-nav button[style*="border-left"] { border-bottom: 3px solid #ef2929 !important; background: linear-gradient(0deg, rgba(239, 41, 41, 0.15) 0%, transparent 100%) !important; }
          .admin-sidebar-footer { display: none; }
          
          .admin-main { padding: 16px; }
          .admin-kpi-grid { grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
          .admin-kpi-grid > div { padding: 16px; }
          .admin-content-grid { grid-template-columns: 1fr; gap: 16px; }
          .admin-content-grid-alt { grid-template-columns: 1fr; gap: 24px; }
          .admin-profile-stats { grid-template-columns: 1fr; gap: 16px; }
          .admin-panel-title { font-size: 20px; margin-bottom: 20px; }
        }

        @media (max-width: 480px) {
          .admin-kpi-grid { grid-template-columns: 1fr; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

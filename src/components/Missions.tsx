'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Target, CheckCircle, Clock } from 'lucide-react';

type Task = { id: string; title: string; description: string; status: string; createdAt: string };

export default function Missions({ id }: { id: string }) {
  const { closeApp, toggleMaximize, focusApp, windows, activeWindowId } = useAppStore();
  const windowState = windows.find(w => w.id === id);
  const isActive = activeWindowId === id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ lifetimeTokens: 0, todayTokens: 0, tokenTarget: 50 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/user/stats')
      ]);
      
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } finally {
      setLoading(false);
    }
  };

  if (!windowState) return null;

  return (
    <div 
      className={`xfce-window ${windowState.isMaximized ? 'xfce-window-maximized' : 'xfce-window-normal'}`}
      style={{ zIndex: windowState.zIndex, background: '#111', color: 'white' }}
      onClick={() => focusApp(id)}
    >
      {/* Title Bar */}
      <div className={`xfce-titlebar ${isActive ? '' : 'xfce-titlebar-inactive'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={14}/> Active Missions</div>
        <div className="window-controls">
          <div className="win-btn" onClick={() => toggleMaximize(id)}>_</div>
          <div className="win-btn" onClick={() => toggleMaximize(id)}>□</div>
          <div className="win-btn close" onClick={() => closeApp(id)}>×</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', fontFamily: 'var(--font-mono)' }}>
        
        {/* Token Dashboard */}
        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', padding: '16px', marginBottom: '24px' }}>
          <h2 style={{ color: '#ceaa61', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px', fontSize: '14px' }}>OPERATIVE STATUS</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>LIFETIME TOKENS</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{stats.lifetimeTokens}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>TODAY'S YIELD</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8ae234' }}>{stats.todayTokens}</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>DAILY TARGET</span>
            <span style={{ color: 'white' }}>{stats.todayTokens} / {stats.tokenTarget}</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${Math.min(100, (stats.todayTokens / Math.max(1, stats.tokenTarget)) * 100)}%`, 
              height: '100%', 
              background: '#8ae234',
              transition: 'width 0.5s ease-out'
            }}></div>
          </div>
        </div>

        <h2 style={{ color: 'var(--term-dir)', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Assigned Objectives</h2>
        
        {loading ? (
          <div style={{ color: '#888' }}>Establishing secure connection to handler...</div>
        ) : tasks.length === 0 ? (
          <div style={{ color: '#888' }}>No active missions assigned at this time.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tasks.map(task => (
              <div key={task.id} style={{ 
                border: '1px solid #333', 
                background: task.status === 'COMPLETED' ? 'rgba(0,255,0,0.05)' : 'rgba(255,255,255,0.05)',
                padding: '16px', borderRadius: '4px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontWeight: 'bold', color: task.status === 'COMPLETED' ? '#8ae234' : 'white', fontSize: '16px' }}>
                    {task.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: task.status === 'COMPLETED' ? '#8ae234' : '#fce94f' }}>
                    {task.status === 'COMPLETED' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                    {task.status}
                  </div>
                </div>
                <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.5' }}>{task.description}</p>
                {task.status === 'PENDING' && (
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#888' }}>
                    * Execute specific terminal commands to complete this objective.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

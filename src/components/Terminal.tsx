'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

interface Log {
  type: 'input' | 'output' | 'error' | 'system' | 'html';
  content: React.ReactNode | string;
}

export default function Terminal({ id }: { id: string }) {
  const { closeApp, toggleMaximize, focusApp, windows, activeWindowId } = useAppStore();
  const windowState = windows.find(w => w.id === id);
  const isActive = activeWindowId === id;
  
  const [logs, setLogs] = useState<Log[]>([
    { type: 'system', content: '┌──(root㉿kali)-[~]\n└─# Type "help" for a list of commands.' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnvSetup, setIsEnvSetup] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [isActive]);

  if (!windowState) return null;

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmd = input.trim();
    setInput('');
    
    setLogs(prev => [...prev, { 
      type: 'input', 
      content: (
        <span>
          <span style={{ color: 'var(--term-root)' }}>┌──(root㉿kali)</span>-<span>[</span><span style={{ color: 'var(--term-dir)' }}>~</span><span>]</span><br/>
          └─# {cmd}
        </span>
      )
    }]);
    
    setIsProcessing(true);

    if (cmd === 'clear') {
      setLogs([]);
      setIsProcessing(false);
      return;
    }

    if (cmd === './connect --host Lucifers_Server_v01' && !isEnvSetup) {
      setLogs(prev => [...prev, { type: 'html', content: '<span style="color: #ef2929;">[!] FATAL: Environment not configured. Run ./setup_env.sh first.</span>' }]);
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 10);
      return;
    }

    if (cmd.startsWith('./run_exploit.sh') && (!isEnvSetup || !isConnected)) {
      setLogs(prev => [...prev, { type: 'html', content: '<span style="color: #ef2929;">[!] FATAL: Pre-requisites not met. Ensure environment is configured and server is connected.</span>' }]);
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 10);
      return;
    }

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setLogs(prev => [...prev, { type: 'error', content: `[System Error]: ${data.error || 'Connection failed'}` }]);
        setIsProcessing(false);
        return;
      }

      if (data.output) {
        const lines = data.output.split('\n');
        for (const line of lines) {
          let text = line;
          let ms = 0;
          let isUpdate = false;
          
          if (text.includes('[update-line]')) {
            isUpdate = true;
            text = text.replace('[update-line]', '');
          }
          
          const match = text.match(/^\[delay:(\d+)\]\s*(.*)/);
          if (match) {
            ms = parseInt(match[1]);
            text = match[2];
          }

          if (ms > 0) {
            await new Promise(r => setTimeout(r, ms));
          }
          
            text = text
            .replace(/\[color:red\]/g, '<span style="color: #ef2929;">')
            .replace(/\[color:green\]/g, '<span style="color: #8ae234;">')
            .replace(/\[color:blue\]/g, '<span style="color: #729fcf;">')
            .replace(/\[color:yellow\]/g, '<span style="color: #fce94f;">')
            .replace(/\[color:cyan\]/g, '<span style="color: #34e2e2;">')
            .replace(/\[color:magenta\]/g, '<span style="color: #ad7fa8;">')
            .replace(/\[color:reset\]/g, '</span>');
          
          setLogs(prev => {
            if (isUpdate && prev.length > 0) {
              const newLogs = [...prev];
              newLogs[newLogs.length - 1] = { type: 'html', content: text };
              return newLogs;
            }
            return [...prev, { type: 'html', content: text }];
          });
        }

        if (cmd === './setup_env.sh') setIsEnvSetup(true);
        if (cmd === './connect --host Lucifers_Server_v01') setIsConnected(true);

      } else {
        // Handle command not found
        if (data.delayTime) await new Promise(r => setTimeout(r, data.delayTime));
        setLogs(prev => [...prev, { type: 'output', content: `bash: ${cmd}: command not found` }]);
      }
    } catch (err) {
      setLogs(prev => [...prev, { type: 'error', content: 'Connection failed.' }]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  return (
    <div 
      className={`xfce-window ${windowState.isMaximized ? 'xfce-window-maximized' : 'xfce-window-normal'}`}
      style={{ zIndex: windowState.zIndex }}
      onClick={() => focusApp(id)}
    >
      {/* Title Bar */}
      <div className={`xfce-titlebar ${isActive ? '' : 'xfce-titlebar-inactive'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>root@kali:~</div>
        <div className="window-controls">
          <div className="win-btn" onClick={() => toggleMaximize(id)}>_</div>
          <div className="win-btn" onClick={() => toggleMaximize(id)}>□</div>
          <div className="win-btn close" onClick={() => closeApp(id)}>×</div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="terminal-content" onClick={() => inputRef.current?.focus()}>
        {logs.map((log, i) => {
          if (log.type === 'html') {
            return <div key={i} className="term-line" dangerouslySetInnerHTML={{ __html: log.content as string }} />;
          }
          return (
            <div key={i} className="term-line">
              {log.content}
            </div>
          );
        })}
        
        {isProcessing ? (
          <div style={{ marginTop: '4px', color: '#888' }}>...</div>
        ) : (
          <form onSubmit={handleCommand} className="term-input-wrapper">
            <div className="term-prompt">
              <span style={{ color: 'var(--term-root)' }}>┌──(root㉿kali)</span>-<span>[</span><span style={{ color: 'var(--term-dir)' }}>~</span><span>]</span><br/>
              └─#
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="term-input"
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
          </form>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

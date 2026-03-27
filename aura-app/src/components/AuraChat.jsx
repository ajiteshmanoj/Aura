import { useState, useEffect, useRef } from 'react';
import { sendMessageToAura, getChatHistory, generateGreeting, generateStarters } from '../utils/auraChat';
import { assembleAuraContext } from '../utils/auraContext';
import { hasAIKey } from '../utils/ai';

export default function AuraChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [starters, setStarters] = useState([]);
  const [crisisCard, setCrisisCard] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const history = getChatHistory();
      setMessages(history);

      const context = assembleAuraContext();
      setStarters(generateStarters(context));

      // Generate greeting if no history
      if (history.length === 0 && hasAIKey()) {
        generateGreeting(context).then(greeting => {
          if (greeting) {
            const msg = { role: 'assistant', content: greeting, timestamp: new Date().toISOString() };
            setMessages([msg]);
          }
        });
      }

      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || sending) return;
    setInput('');
    setStarters([]);

    const userMsg = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    const { message, needsEscalation } = await sendMessageToAura(msg);
    const aiMsg = { role: 'assistant', content: message, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, aiMsg]);
    if (needsEscalation) setCrisisCard(true);
    setSending(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />

      {/* Chat panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, top: '15%',
        background: 'linear-gradient(160deg, #0a0a1a 0%, #0d1117 40%, #111827 100%)',
        borderRadius: '24px 24px 0 0',
        display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(255,255,255,0.06)',
        borderBottom: 'none',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#F0EDE6', margin: 0 }}>Aura</h2>
            <p style={{ fontSize: '11px', color: '#6B6777', margin: '2px 0 0' }}>Your wellness companion</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6777', cursor: 'pointer', padding: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{
          flex: 1, overflowY: 'auto', padding: '0 16px 16px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          scrollbarWidth: 'none',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              animation: `fadeInUp 0.3s ease-out ${Math.min(i * 50, 200)}ms both`,
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(245,166,35,0.15), rgba(245,166,35,0.08))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                border: '1px solid ' + (msg.role === 'user' ? 'rgba(245,166,35,0.12)' : 'rgba(255,255,255,0.06)'),
                boxShadow: msg.role === 'assistant' ? '0 2px 12px rgba(0,0,0,0.2)' : 'none',
              }}>
                <p style={{
                  fontSize: '14px', color: '#F0EDE6', lineHeight: 1.6, margin: 0,
                  whiteSpace: 'pre-wrap',
                }}>{msg.content}</p>
              </div>
              <span style={{ fontSize: '10px', color: '#6B6777', marginTop: '4px', display: 'block',
                textAlign: msg.role === 'user' ? 'right' : 'left', paddingLeft: '4px', paddingRight: '4px',
              }}>
                {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {sending && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{
                padding: '14px 18px', borderRadius: '18px 18px 18px 4px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: '6px', alignItems: 'center',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F5A623', animation: 'softPulse 1.2s ease-in-out infinite' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F5A623', animation: 'softPulse 1.2s ease-in-out 0.2s infinite' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F5A623', animation: 'softPulse 1.2s ease-in-out 0.4s infinite' }} />
              </div>
            </div>
          )}
        </div>

        {/* Crisis card */}
        {crisisCard && (
          <div style={{
            margin: '0 16px 8px', padding: '16px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255,107,138,0.1), rgba(184,169,255,0.08))',
            border: '1px solid rgba(255,107,138,0.15)',
          }}>
            <p style={{ fontSize: '14px', color: '#F0EDE6', fontWeight: 600, marginBottom: '10px' }}>You matter. Help is available.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#9B97A0' }}>
              <span>SOS: 1-767 (24hr)</span>
              <span>IMH: 6389 2222 (24hr)</span>
              <span>Mindline: 1771 (24hr)</span>
              <span>CHAT (youth): chat.mentalhealth.sg</span>
            </div>
            <p style={{ fontSize: '11px', color: '#6B6777', marginTop: '8px' }}>These are free and confidential.</p>
            <button onClick={() => setCrisisCard(false)} style={{ marginTop: '8px', fontSize: '11px', color: '#6B6777', background: 'none', border: 'none', cursor: 'pointer' }}>Dismiss</button>
          </div>
        )}

        {/* Starters */}
        {starters.length > 0 && messages.length <= 1 && (
          <div style={{ display: 'flex', gap: '8px', padding: '0 16px 8px', flexWrap: 'wrap' }}>
            {starters.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{
                padding: '8px 14px', borderRadius: '20px', fontSize: '12px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#9B97A0', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,166,35,0.1)'; e.currentTarget.style.color = '#F5A623'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#9B97A0'; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', gap: '10px', alignItems: 'flex-end',
        }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Talk to Aura..."
            style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '12px 16px', color: '#F0EDE6', fontSize: '14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button onClick={() => send()} disabled={!input.trim() || sending} style={{
            width: '42px', height: '42px', borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: input.trim() ? 'linear-gradient(135deg, #F5A623, #e6951a)' : 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#0a0a1a' : '#6B6777'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

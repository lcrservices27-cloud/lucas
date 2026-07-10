'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Falha ao entrar');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <form onSubmit={handleSubmit} className="card" style={{ width: '100%', maxWidth: 380, padding: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          Pipeline <span style={{ color: 'var(--blue)' }}>Lucas AI</span>
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 24 }}>Acesso interno</p>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

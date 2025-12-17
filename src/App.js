import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import './App.css';
import { firebaseAuth, firebaseConfigMissing } from './firebase';

const SectionHeading = ({ title, count, description }) => (
  <header className="section-heading">
    <div>
      <p className="eyebrow">{description}</p>
      <h2>{title}</h2>
    </div>
    {typeof count === 'number' ? <span className="badge">{count}</span> : null}
  </header>
);

const ContactRow = ({ contact }) => {
  const fullName = useMemo(() => {
    const parts = [contact.lastname, contact.firstname].filter(Boolean);
    return parts.length ? parts.join(', ') : contact.lastname || contact.firstname || 'Unknown contact';
  }, [contact.firstname, contact.lastname]);

  const pillVariant = useMemo(() => (contact.status || 'active').toLowerCase().replace(/\s+/g, '-'), [contact.status]);

  return (
    <tr>
      <td>{fullName}</td>
      <td>{contact.email || '—'}</td>
      <td>{contact.phone_pro || contact.phone || '—'}</td>
      <td>
        <span className={`pill pill-${pillVariant}`}>{contact.status || 'active'}</span>
      </td>
      <td>{contact.address || '—'}</td>
    </tr>
  );
};

const DealCard = ({ deal }) => {
  const healthClass = useMemo(() => deal.health.toLowerCase().replace(/\s+/g, '-'), [deal.health]);

  return (
    <div className="deal-card">
      <div className="deal-top">
        <div>
          <p className="eyebrow">{deal.stage}</p>
          <h3>{deal.name}</h3>
        </div>
        <span className={`pill pill-${healthClass}`}>{deal.health}</span>
      </div>
      <dl className="deal-meta">
        <div>
          <dt>Owner</dt>
          <dd>{deal.owner}</dd>
        </div>
        <div>
          <dt>Value</dt>
          <dd>{deal.value}</dd>
        </div>
        <div>
          <dt>Close date</dt>
          <dd>{deal.closeDate}</dd>
        </div>
      </dl>
    </div>
  );
};

const useDolibarrContacts = () => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const normalizedBaseUrl = useMemo(() => baseUrl.trim().replace(/\/$/, ''), [baseUrl]);

  const fetchContacts = useCallback(async () => {
    setError('');
    if (!normalizedBaseUrl) {
      setError('Enter the Dolibarr API base URL.');
      return;
    }
    if (!apiKey) {
      setError('Enter your Dolibarr API key.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${normalizedBaseUrl}/contacts`, {
        headers: {
          DOLAPIKEY: apiKey.trim(),
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const items = Array.isArray(payload) ? payload : payload?.data || [];
      setContacts(items);
      setLastSync(new Date());
    } catch (err) {
      console.error('Failed to load Dolibarr contacts', err);
      setError(err.message || 'Unable to load contacts.');
    } finally {
      setLoading(false);
    }
  }, [apiKey, normalizedBaseUrl]);

  return {
    apiKey,
    baseUrl,
    contacts,
    error,
    loading,
    lastSync,
    setApiKey,
    setBaseUrl,
    fetchContacts,
  };
};

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');
      if (!email.trim() || !password) {
        setError('Email and password are required.');
        return;
      }

      if (!firebaseAuth) {
        setError('Firebase is not configured. Update your .env.local and restart.');
        return;
      }

      try {
        setSubmitting(true);
        const { user } = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
        onLogin(user);
      } catch (err) {
        const message = err?.message || 'Unable to sign in. Check your credentials and try again.';
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [email, onLogin, password],
  );

  return (
    <div className="layout">
      <section className="card">
        <SectionHeading title="Sign in" description="Authenticate with Firebase to access the dashboard" />
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              placeholder="ckaraniete.za@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <div className="actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
          {error ? <p className="error">{error}</p> : null}
          {firebaseConfigMissing ? (
            <p className="error">
              Firebase environment variables are missing. Update your .env.local and restart the dev server.
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
};

const DashboardPage = ({ user, onSignOut }) => {
  const [search, setSearch] = useState('');
  const { apiKey, baseUrl, contacts, error, loading, lastSync, setApiKey, setBaseUrl, fetchContacts } =
    useDolibarrContacts();

  const placeholderRows = useMemo(
    () => [
      {
        lastname: 'Empire',
        firstname: 'Torque',
        email: 'example@dolibarr.test',
        phone: '+1 (555) 010-0001',
        address: 'Sample street 1',
        status: 'Active',
      },
      {
        lastname: 'Integration',
        firstname: 'Dolibarr',
        email: 'integration@sample.test',
        phone_pro: '+1 (555) 010-0002',
        address: 'API Lane 2',
        status: 'Prospect',
      },
    ],
    [],
  );

  const deals = useMemo(
    () => [
      { name: 'Northwind rollout', stage: 'Proposal sent', owner: 'Samir Patel', value: '$72,500', closeDate: 'May 24', health: 'Positive' },
      { name: 'Acme renewal', stage: 'Negotiation', owner: 'Ava Jones', value: '$38,200', closeDate: 'Jun 2', health: 'At risk' },
      { name: 'Halo onboarding', stage: 'Discovery', owner: 'Jordan Lee', value: '$18,800', closeDate: 'Jun 12', health: 'Positive' },
    ],
    [],
  );

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts.length ? contacts : placeholderRows;
    const term = search.toLowerCase();
    const source = contacts.length ? contacts : placeholderRows;
    return source.filter((contact) => {
      const haystack = [contact.firstname, contact.lastname, contact.email, contact.company, contact.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [contacts, placeholderRows, search]);

  const contactStats = useMemo(() => {
    const total = contacts.length || placeholderRows.length;
    const active = (contacts.length ? contacts : placeholderRows).filter(
      (contact) => (contact.status || '').toLowerCase() === 'active',
    ).length;
    const prospects = (contacts.length ? contacts : placeholderRows).filter(
      (contact) => (contact.status || '').toLowerCase() === 'prospect',
    ).length;
    return { total, active, prospects };
  }, [contacts, placeholderRows]);

  return (
    <div className="layout">
      <header className="hero">
        <div>
          <p className="eyebrow">Dolibarr-connected</p>
          <h1>Torque Empire dashboard</h1>
        </div>
        <div className="sync-meta">
          <span className="pill">{lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Not synced yet'}</span>
          {user ? (
            <button type="button" className="ghost" onClick={onSignOut}>
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      <section className="card">
        <SectionHeading title="Dolibarr API connection" description="Securely test your key and endpoint" />
        <p className="helper">
          Provide your Dolibarr REST endpoint and API key. Credentials are only used in this session – store them securely
          in environment variables in production.
        </p>
        <div className="form-grid">
          <label className="field">
            <span>Dolibarr API base URL</span>
            <input
              type="url"
              placeholder="https://your-dolibarr.example.com/api/index.php"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
            />
          </label>
          <label className="field">
            <span>API key</span>
            <input
              type="password"
              placeholder="DOLAPIKEY"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>
        </div>
        <div className="actions">
          <button type="button" onClick={fetchContacts} disabled={loading}>
            {loading ? 'Loading…' : 'Sync contacts'}
          </button>
          <input
            type="search"
            className="search"
            placeholder="Filter contacts"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="card">
        <SectionHeading title="Contacts" count={filteredContacts.length} description="People synced from Dolibarr" />
        <div className="stat-grid">
          <div className="stat">
            <p className="eyebrow">Total</p>
            <strong>{contactStats.total}</strong>
          </div>
          <div className="stat">
            <p className="eyebrow">Active</p>
            <strong>{contactStats.active}</strong>
          </div>
          <div className="stat">
            <p className="eyebrow">Prospects</p>
            <strong>{contactStats.prospects}</strong>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length ? (
                filteredContacts.map((contact) => <ContactRow key={contact.id || contact.rowid || contact.email} contact={contact} />)
              ) : (
                <tr>
                  <td colSpan={5} className="empty">No contacts match that filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <SectionHeading title="Open deals" count={deals.length} description="Pipeline snapshot" />
        <div className="deals-grid">
          {deals.map((deal) => (
            <DealCard key={deal.name} deal={deal} />
          ))}
        </div>
      </section>
    </div>
  );
};

const AuthGate = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!firebaseAuth) {
      setAuthError('Firebase is not configured. Update your .env.local and restart.');
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
      (err) => {
        setAuthError(err?.message || 'Authentication listener failed.');
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    if (!firebaseAuth) {
      setAuthError('Firebase is not configured. Update your .env.local and restart.');
      return;
    }

    try {
      await signOut(firebaseAuth);
      setUser(null);
    } catch (err) {
      setAuthError(err?.message || 'Failed to sign out.');
    }
  }, []);

  if (loading) {
    return (
      <div className="layout">
        <section className="card">
          <p className="eyebrow">Loading</p>
          <p>Checking your authentication status…</p>
        </section>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="layout">
        <section className="card">
          <p className="eyebrow">Authentication error</p>
          <p className="error">{authError}</p>
        </section>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return children(user, handleSignOut);
};

const App = () => (
  <AuthGate>
    {(user, handleSignOut) => (
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage user={user} onSignOut={handleSignOut} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    )}
  </AuthGate>
);

export default App;

import React, { useCallback, useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

const ContactRow = ({ contact }) => {
  const fullName = useMemo(() => {
    const parts = [contact.lastname, contact.firstname].filter(Boolean);
    return parts.length ? parts.join(', ') : contact.lastname || contact.firstname || 'Unknown contact';
  }, [contact.firstname, contact.lastname]);

  return (
    <tr>
      <td>{fullName}</td>
      <td>{contact.email || '—'}</td>
      <td>{contact.phone_pro || contact.phone || '—'}</td>
      <td>{contact.status || 'active'}</td>
      <td>{contact.address || '—'}</td>
    </tr>
  );
};

const ContactsDashboard = () => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const normalizedBaseUrl = useMemo(() => baseUrl.trim().replace(/\/$/, ''), [baseUrl]);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const term = search.toLowerCase();
    return contacts.filter((contact) => {
      const haystack = [contact.firstname, contact.lastname, contact.email, contact.company, contact.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [contacts, search]);

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
    } catch (err) {
      console.error('Failed to load Dolibarr contacts', err);
      setError(err.message || 'Unable to load contacts.');
    } finally {
      setLoading(false);
    }
  }, [apiKey, normalizedBaseUrl]);

  const placeholderRows = useMemo(
    () => [
      {
        lastname: 'Empire',
        firstname: 'Torque',
        email: 'example@dolibarr.test',
        phone: '+1 (555) 010-0001',
        address: 'Sample street 1',
        status: 'active',
      },
      {
        lastname: 'Integration',
        firstname: 'Dolibarr',
        email: 'integration@sample.test',
        phone_pro: '+1 (555) 010-0002',
        address: 'API Lane 2',
        status: 'prospect',
      },
    ],
    [],
  );

  return (
    <div className="layout">
      <header className="hero">
        <h1>Torque Empire CRM</h1>
        <p className="tagline">Dolibarr contacts integration – keep data flowing securely.</p>
      </header>

      <section className="card">
        <h2>Dolibarr API connection</h2>
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
        <div className="card-header">
          <h2>Contacts</h2>
          <span className="badge">{filteredContacts.length}</span>
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
                placeholderRows.map((contact) => <ContactRow key={contact.email} contact={contact} />)
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<ContactsDashboard />} />
    </Routes>
  );
}

export default App;

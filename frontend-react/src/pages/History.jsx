import { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Search, CheckCircle, RotateCcw, Filter } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/history').then(r => {
      setHistory(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = history.filter(h => {
    const matchSearch = !search || h.seller.toLowerCase().includes(search.toLowerCase()) || h.buyer.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || h.type?.toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title"><HistoryIcon size={18} /> Transaction Logs</div>
            <div className="card-subtitle">Data Structure: Queue (FIFO) — most recent trades appear last</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-blue">{filtered.length} records</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by company ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="pill-tabs" style={{ marginBottom: 0 }}>
            {['all', 'trade', 'undo'].map(f => (
              <button key={f} className={`pill-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#64748b', padding: '20px 0' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <HistoryIcon size={40} />
            <h3>No Records Found</h3>
            <p>No trade history matches your current filter.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Seller ID</th>
                  <th>Buyer ID</th>
                  <th>Amount (Credits)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h, i) => (
                  <tr key={i}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>
                      {h.type === 'Undo'
                        ? <span className="badge badge-orange" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><RotateCcw size={11} /> Undo</span>
                        : <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowRightLeft size={11} /> Trade</span>
                      }
                    </td>
                    <td style={{ fontWeight: 600 }}>{h.seller}</td>
                    <td style={{ fontWeight: 600 }}>{h.buyer}</td>
                    <td><strong>{h.amount}</strong> CR</td>
                    <td>
                      <span className={`badge ${h.status === 'completed' ? 'badge-green' : 'badge-orange'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={11} />
                        {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowRightLeft({ size }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 3L4 7l4 4" /><path d="M4 7h16" />
      <path d="M16 21l4-4-4-4" /><path d="M20 17H4" />
    </svg>
  );
}

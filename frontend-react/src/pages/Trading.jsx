import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRightLeft, RotateCcw, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Trading({ user }) {
  const [companies, setCompanies] = useState([]);
  const [sellerId, setSellerId] = useState(user.role === 'company' ? user.id : '');
  const [buyerId, setBuyerId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/companies').then(r => setCompanies(r.data));
  }, [message]); // reload after trade

  const sellerComp = companies.find(c => c.company_id === sellerId);
  const buyerComp  = companies.find(c => c.company_id === buyerId);

  const handleTrade = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    if (sellerId === buyerId) { setError('Seller and Buyer cannot be the same company.'); setLoading(false); return; }
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/trade', {
        seller_id: sellerId, buyer_id: buyerId, amount: parseFloat(amount)
      });
      setMessage(res.data.message);
      setAmount('');
      if (user.role === 'admin') { setSellerId(''); setBuyerId(''); }
      else setBuyerId('');
    } catch (err) {
      setError(err.response?.data?.error || 'Trade failed');
    }
    setLoading(false);
  };

  const handleUndo = async () => {
    setMessage(''); setError('');
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/trade/undo');
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Nothing to undo');
    }
  };

  return (
    <div style={{ maxWidth: 740, margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title"><ArrowRightLeft size={18} /> Execute Carbon Credit Trade</div>
            <div className="card-subtitle">Data Structure: Queue logs trades, Stack enables undo</div>
          </div>
          {user.role === 'admin' && (
            <button className="btn btn-secondary btn-sm" onClick={handleUndo}>
              <RotateCcw size={15} /> Undo Last Trade
            </button>
          )}
        </div>

        {message && <div className="alert alert-success"><CheckCircle size={16} /> {message}</div>}
        {error   && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}

        <form onSubmit={handleTrade}>
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Seller Company</label>
              <select
                className="form-control"
                value={sellerId}
                onChange={e => setSellerId(e.target.value)}
                disabled={user.role === 'company'}
                required
              >
                <option value="">Select seller...</option>
                {companies.map(c => (
                  <option key={`s-${c.company_id}`} value={c.company_id}>
                    {c.name} ({c.company_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Buyer Company</label>
              <select
                className="form-control"
                value={buyerId}
                onChange={e => setBuyerId(e.target.value)}
                required
              >
                <option value="">Select buyer...</option>
                {companies.map(c => (
                  <option key={`b-${c.company_id}`} value={c.company_id}>
                    {c.name} ({c.company_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Amount of Credits to Transfer</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
              placeholder="e.g. 100"
              required
            />
          </div>

          {/* Live preview cards */}
          {(sellerComp || buyerComp) && (
            <div className="form-grid" style={{ marginBottom: 20 }}>
              {sellerComp && (
                <div style={{ background: '#fff7f7', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Seller</p>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sellerComp.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                    Current Balance: <strong style={{ color: sellerComp.credits_balance >= 0 ? '#059669' : '#dc2626' }}>{sellerComp.credits_balance}</strong>
                  </p>
                  {amount && (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                      After Trade: <strong style={{ color: (sellerComp.credits_balance - parseFloat(amount||0)) >= 0 ? '#059669' : '#dc2626' }}>
                        {sellerComp.credits_balance - parseFloat(amount || 0)}
                      </strong>
                    </p>
                  )}
                </div>
              )}
              {buyerComp && (
                <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 10, padding: '14px 16px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Buyer</p>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{buyerComp.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                    Current Balance: <strong style={{ color: '#059669' }}>{buyerComp.credits_balance}</strong>
                  </p>
                  {amount && (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                      After Trade: <strong style={{ color: '#059669' }}>
                        {buyerComp.credits_balance + parseFloat(amount || 0)}
                      </strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            <ArrowRightLeft size={17} />
            {loading ? 'Processing...' : 'Execute Trade'}
          </button>
        </form>
      </div>

      {/* Info cards */}
      <div className="form-grid">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-title" style={{ marginBottom: 10, fontSize: '0.88rem' }}>
            <Info size={16} /> How Trading Works
          </div>
          <ol style={{ paddingLeft: 18, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.8 }}>
            <li>Select a seller company with surplus credits.</li>
            <li>Select a buyer company that needs credits.</li>
            <li>Enter the number of credits to transfer.</li>
            <li>Click Execute Trade to process.</li>
          </ol>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-title" style={{ marginBottom: 10, fontSize: '0.88rem' }}>
            <Info size={16} /> Data Structures in Use
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.9 }}>
            <p><strong style={{ color: '#1e3a8a' }}>Hash Table:</strong> Fast O(1) company lookups</p>
            <p><strong style={{ color: '#1e3a8a' }}>Queue:</strong> FIFO trade history logging</p>
            <p><strong style={{ color: '#1e3a8a' }}>Stack:</strong> LIFO undo trade operations</p>
            <p><strong style={{ color: '#1e3a8a' }}>Graph:</strong> Trade edge (seller → buyer)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

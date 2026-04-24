import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, PlusCircle, Search, CheckCircle, AlertCircle } from 'lucide-react';

const INDUSTRIES = ['Tech', 'Manufacturing', 'Logistics', 'Energy', 'Agriculture', 'Other'];

const EcoScoreTag = ({ score }) => {
  const cls = score === 'A+' ? 'eco-A-plus' : `eco-${score}`;
  return <span className={`eco-score ${cls}`}>{score}</span>;
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [filterInd, setFilterInd] = useState('all');
  const [formData, setFormData] = useState({ id: '', name: '', emissions: '', credits: '', industry: 'Tech' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCompanies(); }, []);

  async function fetchCompanies() {
    const res = await axios.get('http://127.0.0.1:5000/api/companies');
    setCompanies(res.data);
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg(''); setErr(''); setLoading(true);
    try {
      await axios.post('http://127.0.0.1:5000/api/companies', {
        company_id: formData.id,
        name: formData.name,
        emissions: parseFloat(formData.emissions),
        credits_allocated: parseFloat(formData.credits),
        industry: formData.industry
      });
      setMsg(`Company "${formData.name}" registered successfully.`);
      setFormData({ id: '', name: '', emissions: '', credits: '', industry: 'Tech' });
      fetchCompanies();
    } catch (e) {
      setErr('Error registering company. Check if ID is unique.');
    }
    setLoading(false);
  };

  const filtered = companies.filter(c => {
    const s = search.toLowerCase();
    const matchS = !s || c.name.toLowerCase().includes(s) || c.company_id.toLowerCase().includes(s);
    const matchI = filterInd === 'all' || c.industry === filterInd;
    return matchS && matchI;
  });

  return (
    <div>
      {/* Registration Form */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title"><PlusCircle size={18} /> Register New Company</div>
            <div className="card-subtitle">Inserts into Hash Table with O(1) average time complexity</div>
          </div>
        </div>

        {msg && <div className="alert alert-success"><CheckCircle size={16} />{msg}</div>}
        {err && <div className="alert alert-error"><AlertCircle size={16} />{err}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Company ID</label>
              <span className="form-sublabel">Unique identifier used as hash key</span>
              <input type="text" className="form-control" placeholder="e.g. C004"
                value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <span className="form-sublabel">Full legal name of the company</span>
              <input type="text" className="form-control" placeholder="e.g. GreenEnergy Ltd."
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Industry Sector</label>
              <span className="form-sublabel">Category for filtering and analytics</span>
              <select className="form-control" value={formData.industry}
                onChange={e => setFormData({ ...formData, industry: e.target.value })}>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Credits Allocated</label>
              <span className="form-sublabel">Government-assigned credit limit</span>
              <input type="number" className="form-control" placeholder="e.g. 1000"
                value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} required />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Annual Emissions (Tons CO2)</label>
              <span className="form-sublabel">Actual carbon dioxide emissions produced this year</span>
              <input type="number" className="form-control" placeholder="e.g. 750"
                value={formData.emissions} onChange={e => setFormData({ ...formData, emissions: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <PlusCircle size={16} />
            {loading ? 'Registering...' : 'Register Company'}
          </button>
        </form>
      </div>

      {/* Company List */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title"><Building2 size={18} /> Registered Companies</div>
            <div className="card-subtitle">Hash Table — {companies.length} companies stored, O(1) lookup</div>
          </div>
          <span className="badge badge-blue">{filtered.length} shown</span>
        </div>

        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input className="search-input" placeholder="Search by name or ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="pill-tabs" style={{ marginBottom: 0 }}>
            <button className={`pill-tab ${filterInd === 'all' ? 'active' : ''}`} onClick={() => setFilterInd('all')}>All</button>
            {INDUSTRIES.map(ind => (
              <button key={ind} className={`pill-tab ${filterInd === ind ? 'active' : ''}`} onClick={() => setFilterInd(ind)}>{ind}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <Building2 size={40} />
            <h3>No Companies Found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Company ID</th>
                  <th>Name</th>
                  <th>Industry</th>
                  <th>Eco-Score</th>
                  <th>Emissions</th>
                  <th>Allocated</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.company_id}>
                    <td><span className="badge badge-blue">{c.company_id}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>
                      <span className={`badge ${
                        c.industry === 'Tech' ? 'badge-blue' :
                        c.industry === 'Manufacturing' ? 'badge-orange' :
                        c.industry === 'Energy' ? 'badge-purple' :
                        c.industry === 'Logistics' ? 'badge-gray' : 'badge-green'
                      }`}>{c.industry}</span>
                    </td>
                    <td><EcoScoreTag score={c.eco_score} /></td>
                    <td>{c.emissions} T</td>
                    <td>{c.credits_allocated}</td>
                    <td>
                      <span className={`badge ${c.credits_balance >= 0 ? 'badge-green' : 'badge-red'}`}>
                        {c.credits_balance > 0 ? '+' : ''}{c.credits_balance}
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

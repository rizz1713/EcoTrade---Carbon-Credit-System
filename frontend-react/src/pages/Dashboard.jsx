import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, ArrowRightLeft, Trophy, Leaf, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const EcoScoreTag = ({ score }) => {
  const cls = score === 'A+' ? 'eco-A-plus' : `eco-${score}`;
  return <span className={`eco-score ${cls}`}>{score}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 700, marginBottom: 6, color: '#1a202c' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: '0.85rem' }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ user }) {
  const [rankings, setRankings] = useState([]);
  const [stats, setStats] = useState({ companies: 0, trades: 0, topCompany: '-', totalEmissions: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bar');

  useEffect(() => {
    async function load() {
      try {
        const [compRes, histRes, rankRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/companies'),
          axios.get('http://127.0.0.1:5000/api/history'),
          axios.get('http://127.0.0.1:5000/api/rankings'),
        ]);

        let rankData = rankRes.data;
        if (user.role === 'company') rankData = rankData.filter(c => c.company_id === user.id);

        const totalEmissions = compRes.data.reduce((s, c) => s + c.emissions, 0);
        setRankings(rankData);
        setStats({
          companies: compRes.data.length,
          trades: histRes.data.length,
          topCompany: rankRes.data[0]?.name || '-',
          totalEmissions,
        });
        setLoading(false);
      } catch (e) { setLoading(false); }
    }
    load();
  }, [user]);

  if (loading) return <div style={{ padding: 40, color: '#64748b' }}>Loading dashboard...</div>;

  const radarData = rankings.map(c => ({
    name: c.name,
    Emissions: c.emissions,
    Allocated: c.credits_allocated,
    Balance: Math.max(c.credits_balance, 0),
  }));

  const statCards = user.role === 'admin' ? [
    { label: 'Registered Companies', value: stats.companies, icon: <Building2 size={22} />, color: 'blue', hint: 'Stored in Hash Table' },
    { label: 'Total Trades', value: stats.trades, icon: <ArrowRightLeft size={22} />, color: 'green', hint: 'Logged in Queue' },
    { label: 'Top Eco Company', value: stats.topCompany, icon: <Trophy size={22} />, color: 'orange', hint: 'Ranked by AVL Tree' },
    { label: 'Total Emissions (T)', value: stats.totalEmissions, icon: <TrendingDown size={22} />, color: 'purple', hint: 'Across all companies' },
  ] : [
    { label: 'Your Balance', value: rankings[0]?.credits_balance ?? '-', icon: <Leaf size={22} />, color: rankings[0]?.credits_balance >= 0 ? 'green' : 'blue', hint: 'Carbon Credits' },
    { label: 'Your Emissions', value: rankings[0]?.emissions ?? '-', icon: <TrendingUp size={22} />, color: 'orange', hint: 'Tons of CO2' },
    { label: 'Eco Score', value: rankings[0]?.eco_score ?? '-', icon: <Trophy size={22} />, color: 'purple', hint: 'Environmental rating' },
    { label: 'Credits Allocated', value: rankings[0]?.credits_allocated ?? '-', icon: <ArrowRightLeft size={22} />, color: 'blue', hint: 'Total credits given' },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-hint">{s.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title"><BarChart3 size={18} /> Environmental Impact Analysis</div>
            <div className="card-subtitle">Emissions vs Allocated Credits per Company</div>
          </div>
          <div className="pill-tabs" style={{ marginBottom: 0 }}>
            <button className={`pill-tab ${activeTab === 'bar' ? 'active' : ''}`} onClick={() => setActiveTab('bar')}>Bar Chart</button>
            <button className={`pill-tab ${activeTab === 'radar' ? 'active' : ''}`} onClick={() => setActiveTab('radar')}>Radar Chart</button>
          </div>
        </div>

        <div style={{ width: '100%', height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'bar' ? (
              <BarChart data={rankings} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 16, fontSize: '0.82rem' }} />
                <Bar dataKey="emissions" name="Emissions" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="credits_allocated" name="Credits Allocated" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="credits_balance" name="Balance" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar name="Emissions" dataKey="Emissions" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
                <Radar name="Allocated" dataKey="Allocated" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 8, fontSize: '0.82rem' }} />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title"><Trophy size={18} /> {user.role === 'admin' ? 'Company Rankings (AVL Tree)' : 'Your Company Status'}</div>
            <div className="card-subtitle">Sorted by credits balance using in-order traversal</div>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {user.role === 'admin' && <th>Rank</th>}
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
              {rankings.map((c, i) => (
                <tr key={c.company_id}>
                  {user.role === 'admin' && (
                    <td>
                      <span style={{ fontWeight: 700, color: i < 3 ? '#d97706' : '#64748b' }}>#{i + 1}</span>
                    </td>
                  )}
                  <td><span className="badge badge-blue">{c.company_id}</span></td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><span className="badge badge-gray">{c.industry}</span></td>
                  <td><EcoScoreTag score={c.eco_score} /></td>
                  <td>{c.emissions}</td>
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
      </div>
    </div>
  );
}

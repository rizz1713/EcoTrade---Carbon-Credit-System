import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Network as NetworkIcon, RefreshCw, Info } from 'lucide-react';

export default function Network() {
  const canvasRef = useRef(null);
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchNetwork = async () => {
    setLoading(true);
    const res = await axios.get('http://127.0.0.1:5000/api/network');
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchNetwork(); }, []);

  useEffect(() => {
    if (!canvasRef.current || data.nodes.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    ctx.clearRect(0, 0, W, H);

    // Draw background grid
    ctx.strokeStyle = 'rgba(226,232,240,0.6)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Place nodes in a circle
    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) * 0.32;
    const positions = {};
    data.nodes.forEach((node, i) => {
      const angle = (i / data.nodes.length) * 2 * Math.PI - Math.PI / 2;
      positions[node.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), label: node.label };
    });

    // Draw edges with arrows
    data.edges.forEach(edge => {
      const from = positions[edge.from];
      const to = positions[edge.to];
      if (!from || !to) return;

      const dx = to.x - from.x, dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / dist, ny = dy / dist;

      const nodeR = 22;
      const sx = from.x + nx * nodeR, sy = from.y + ny * nodeR;
      const ex = to.x - nx * nodeR,   ey = to.y - ny * nodeR;

      // Draw gradient line
      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      grad.addColorStop(0, 'rgba(59,130,246,0.9)');
      grad.addColorStop(1, 'rgba(30,58,138,0.9)');
      ctx.beginPath();
      ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
      ctx.strokeStyle = grad; ctx.lineWidth = 2.5;
      ctx.setLineDash([]); ctx.stroke();

      // Arrowhead
      const aw = 10, ah = 6;
      const ax = ex - aw * nx, ay = ey - aw * ny;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ax - ah * ny, ay + ah * nx);
      ctx.lineTo(ax + ah * ny, ay - ah * nx);
      ctx.closePath();
      ctx.fillStyle = '#1e3a8a'; ctx.fill();

      // Edge label with pill background
      const midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2;
      const label = `${edge.amount} CR`;
      ctx.font = '600 11px Inter, sans-serif';
      const tw = ctx.measureText(label).width;
      const pw = tw + 14, ph = 20;
      ctx.fillStyle = 'rgba(30,58,138,0.9)';
      ctx.beginPath();
      ctx.roundRect(midX - pw/2, midY - ph/2, pw, ph, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, midX, midY);
    });

    // Draw nodes
    data.nodes.forEach(node => {
      const pos = positions[node.id];
      const isSel = selected === node.id;

      // Outer ring glow
      if (isSel) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(59,130,246,0.15)';
        ctx.fill();
      }

      // Node shadow
      ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(30,58,138,0.25)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 22, 0, 2 * Math.PI);
      const nodeGrad = ctx.createRadialGradient(pos.x - 5, pos.y - 5, 2, pos.x, pos.y, 22);
      nodeGrad.addColorStop(0, '#3b82f6');
      nodeGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = nodeGrad; ctx.fill();
      ctx.shadowBlur = 0;

      // Border
      ctx.lineWidth = isSel ? 3 : 0;
      ctx.strokeStyle = '#60a5fa';
      if (isSel) ctx.stroke();

      // Node label background
      ctx.font = '600 11px Inter, sans-serif';
      const lw = ctx.measureText(pos.label).width + 14;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(pos.x - lw/2, pos.y + 27, lw, 22, 6);
      ctx.fill();

      // Node ID (white, inside circle)
      ctx.fillStyle = 'white'; ctx.font = '700 10px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(node.id, pos.x, pos.y);

      // Node name below
      ctx.fillStyle = 'white'; ctx.font = '600 11px Inter, sans-serif';
      ctx.fillText(pos.label, pos.x, pos.y + 38);
    });
  }, [data, selected]);

  // Aggregate edges per unique pair for stats
  const edgeMap = {};
  data.edges.forEach(e => {
    const key = `${e.from}-${e.to}`;
    edgeMap[key] = (edgeMap[key] || 0) + e.amount;
  });

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title"><NetworkIcon size={18} /> Trading Network Topology</div>
            <div className="card-subtitle">Directed Graph (Adjacency List) — arrows show trade flow from Seller to Buyer</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchNetwork}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Loading network...
          </div>
        ) : (
          <div className="network-canvas-wrap">
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
        )}

        <p style={{ marginTop: 12, fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
          Blue nodes = companies. Arrows = trade direction (seller → buyer). Labels show credits transferred.
        </p>
      </div>

      {/* Stats Row */}
      <div className="form-grid">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-title" style={{ marginBottom: 12, fontSize: '0.88rem' }}>
            <NetworkIcon size={16} /> Graph Statistics
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Total Nodes', value: data.nodes.length },
              { label: 'Total Edges', value: data.edges.length },
              { label: 'Unique Pairs', value: Object.keys(edgeMap).length },
              { label: 'Total Credits Traded', value: data.edges.reduce((s, e) => s + e.amount, 0) },
            ].map((s, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a8a' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-title" style={{ marginBottom: 12, fontSize: '0.88rem' }}>
            <Info size={16} /> Trade Flow Summary
          </div>
          {Object.keys(edgeMap).length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}>
              <p>No trades recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(edgeMap).map(([key, total], i) => {
                const [from, to] = key.split('-');
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                    <span className="badge badge-blue">{from}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>→</span>
                    <span className="badge badge-green">{to}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.88rem', color: '#1e3a8a' }}>{total} CR</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

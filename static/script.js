let emissionsChartInstance = null;

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    event.currentTarget.classList.add('active');
    
    loadData();
}

async function loadData() {
    await fetchCompanies();
    await fetchRankings();
    await fetchNetwork();
    await fetchHistory();
}

async function fetchCompanies() {
    const res = await fetch('/api/companies');
    const companies = await res.json();
    
    const tbody = document.getElementById('companies-table-body');
    tbody.innerHTML = '';
    
    const sellerSelect = document.getElementById('trade-seller');
    const buyerSelect = document.getElementById('trade-buyer');
    sellerSelect.innerHTML = '<option value="">Select Seller</option>';
    buyerSelect.innerHTML = '<option value="">Select Buyer</option>';
    
    document.getElementById('dash-total-companies').textContent = companies.length;
    
    companies.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.company_id}</td>
                <td>${c.name}</td>
                <td>${c.emissions}</td>
                <td>${c.credits_allocated}</td>
                <td style="color: ${c.credits_balance >= 0 ? 'green' : 'red'};">${c.credits_balance}</td>
            </tr>
        `;
        sellerSelect.innerHTML += `<option value="${c.company_id}">${c.name} (${c.company_id})</option>`;
        buyerSelect.innerHTML += `<option value="${c.company_id}">${c.name} (${c.company_id})</option>`;
    });
}

async function fetchRankings() {
    const res = await fetch('/api/rankings');
    const rankings = await res.json();
    
    const tbody = document.getElementById('rankings-table-body');
    tbody.innerHTML = '';
    
    if (rankings.length > 0) {
        document.getElementById('dash-top-company').textContent = rankings[0].name;
    }
    
    let labels = [];
    let emissionData = [];
    let creditData = [];
    
    rankings.forEach((c, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${c.company_id}</td>
                <td>${c.name}</td>
                <td>${c.emissions}</td>
                <td>${c.credits_allocated}</td>
                <td style="color: ${c.credits_balance >= 0 ? 'green' : 'red'};">${c.credits_balance}</td>
            </tr>
        `;
        labels.push(c.name);
        emissionData.push(c.emissions);
        creditData.push(c.credits_allocated);
    });
    
    renderChart(labels, emissionData, creditData);
}

async function fetchHistory() {
    const res = await fetch('/api/history');
    const history = await res.json();
    
    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = '';
    
    document.getElementById('dash-total-trades').textContent = history.length;
    
    history.forEach(h => {
        tbody.innerHTML += `
            <tr>
                <td>${h.seller}</td>
                <td>${h.buyer}</td>
                <td>${h.amount}</td>
                <td>${h.status}</td>
            </tr>
        `;
    });
}

async function fetchNetwork() {
    const res = await fetch('/api/network');
    const data = await res.json();
    drawNetwork(data.nodes, data.edges);
}

function drawNetwork(nodes, edges) {
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple spring/circular layout
    const radius = Math.min(canvas.width, canvas.height) / 3;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const positions = {};
    nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI;
        positions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            label: node.label
        };
    });
    
    // Draw edges
    edges.forEach(edge => {
        const from = positions[edge.from];
        const to = positions[edge.to];
        
        if (from && to) {
            // Draw line
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = '#000080';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw amount text
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            ctx.fillStyle = '#000080';
            ctx.font = 'bold 16px "Times New Roman"';
            ctx.fillText(edge.amount + ' credits', midX, midY);
        }
    });
    
    // Draw nodes
    nodes.forEach(node => {
        const pos = positions[node.id];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000080';
        ctx.stroke();
        
        ctx.fillStyle = '#000080';
        ctx.font = 'bold 16px "Times New Roman"';
        ctx.textAlign = 'center';
        ctx.fillText(pos.label, pos.x, pos.y - 30);
    });
}

function renderChart(labels, emissions, credits) {
    const ctx = document.getElementById('emissionsChart').getContext('2d');
    
    if (emissionsChartInstance) {
        emissionsChartInstance.destroy();
    }
    
    Chart.defaults.font.family = '"Times New Roman", Times, serif';
    Chart.defaults.color = '#000080';
    
    emissionsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Emissions',
                    data: emissions,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Credits Allocated',
                    data: credits,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Company Environmental Impact',
                    font: {
                        size: 18,
                    }
                }
            }
        }
    });
}

async function registerCompany(event) {
    event.preventDefault();
    
    const data = {
        company_id: document.getElementById('reg-id').value,
        name: document.getElementById('reg-name').value,
        emissions: parseFloat(document.getElementById('reg-emissions').value),
        credits_allocated: parseFloat(document.getElementById('reg-credits').value)
    };
    
    const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (res.ok) {
        alert('Company registered successfully');
        document.getElementById('register-form').reset();
        loadData();
    } else {
        alert('Error registering company');
    }
}

async function executeTrade(event) {
    event.preventDefault();
    
    const data = {
        seller_id: document.getElementById('trade-seller').value,
        buyer_id: document.getElementById('trade-buyer').value,
        amount: parseFloat(document.getElementById('trade-amount').value)
    };
    
    if (data.seller_id === data.buyer_id) {
        alert('Seller and Buyer cannot be the same');
        return;
    }
    
    const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    const result = await res.json();
    
    if (res.ok) {
        alert('Trade executed successfully');
        document.getElementById('trade-form').reset();
        loadData();
    } else {
        alert('Trade failed: ' + result.error);
    }
}

// Initial load
window.onload = loadData;

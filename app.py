from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from data_structures import Company, HashTable, AVLTree, Graph, Queue, Stack

app = Flask(__name__)
CORS(app)

# Initialize Data Structures
companies_db = HashTable()
trade_network = Graph()
trade_history = Queue()
undo_stack = Stack()

# Utility to calculate Eco-Score
def calculate_eco_score(company):
    ratio = company.emissions / max(company.credits_allocated, 1)
    if ratio < 0.4: return "A+"
    if ratio < 0.6: return "A"
    if ratio < 0.8: return "B"
    if ratio < 1.0: return "C"
    return "F"

# Pre-populate with 3 users and specific industries
c1 = Company('C001', 'EcoCorp', emissions=500, credits_allocated=1000, industry="Tech")
c2 = Company('C002', 'GreenTech', emissions=1200, credits_allocated=1000, industry="Manufacturing")
c3 = Company('C003', 'CarbonReduce', emissions=800, credits_allocated=1000, industry="Logistics")

companies_db.insert(c1.company_id, c1)
companies_db.insert(c2.company_id, c2)
companies_db.insert(c3.company_id, c3)

@app.route('/api/companies', methods=['GET', 'POST'])
def handle_companies():
    if request.method == 'POST':
        data = request.json
        comp = Company(
            data['company_id'], 
            data['name'], 
            data['emissions'], 
            data['credits_allocated'],
            data.get('industry', 'Other')
        )
        companies_db.insert(comp.company_id, comp)
        return jsonify({'message': 'Company added successfully', 'company': comp.to_dict()}), 201
    
    companies = []
    for c in companies_db.get_all():
        d = c.to_dict()
        d['eco_score'] = calculate_eco_score(c)
        companies.append(d)
    return jsonify(companies)

@app.route('/api/companies/<company_id>', methods=['GET'])
def get_company(company_id):
    comp = companies_db.get(company_id)
    if comp:
        d = comp.to_dict()
        d['eco_score'] = calculate_eco_score(comp)
        return jsonify(d)
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/trade', methods=['POST'])
def execute_trade():
    data = request.json
    seller_id = data.get('seller_id')
    buyer_id = data.get('buyer_id')
    amount = float(data.get('amount'))
    
    seller = companies_db.get(seller_id)
    buyer = companies_db.get(buyer_id)
    
    if not seller or not buyer:
        return jsonify({'error': 'Invalid company IDs'}), 400
        
    if seller.credits_balance < amount:
        return jsonify({'error': 'Insufficient credits to sell'}), 400
        
    # Execute trade
    seller.credits_balance -= amount
    buyer.credits_balance += amount
    
    # Update Graph & Queue
    trade_network.add_edge(seller_id, buyer_id, amount)
    trade_history.enqueue({'seller': seller_id, 'buyer': buyer_id, 'amount': amount, 'status': 'completed', 'type': 'Trade'})
    
    # Push to Undo Stack
    undo_stack.push({'seller': seller_id, 'buyer': buyer_id, 'amount': amount})
    
    return jsonify({'message': 'Trade successful'})

@app.route('/api/trade/undo', methods=['POST'])
def undo_trade():
    last_trade = undo_stack.pop()
    if not last_trade:
        return jsonify({'error': 'No trades to undo'}), 400
        
    seller = companies_db.get(last_trade['seller'])
    buyer = companies_db.get(last_trade['buyer'])
    amount = last_trade['amount']
    
    # Revert balances
    seller.credits_balance += amount
    buyer.credits_balance -= amount
    
    # Log revert
    trade_history.enqueue({
        'seller': last_trade['seller'], 
        'buyer': last_trade['buyer'], 
        'amount': amount, 
        'status': 'reverted',
        'type': 'Undo'
    })
    
    return jsonify({'message': 'Last trade undone successfully'})

@app.route('/api/rankings', methods=['GET'])
def get_rankings():
    ranking_tree = AVLTree()
    for c in companies_db.get_all():
        ranking_tree.add(c)
        
    sorted_companies = ranking_tree.get_sorted()
    sorted_companies.reverse()
    
    res = []
    for c in sorted_companies:
        d = c.to_dict()
        d['eco_score'] = calculate_eco_score(c)
        res.append(d)
    return jsonify(res)

@app.route('/api/network', methods=['GET'])
def get_network():
    nodes = [{'id': c.company_id, 'label': c.name} for c in companies_db.get_all()]
    edges = trade_network.get_edges()
    return jsonify({'nodes': nodes, 'edges': edges})

@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify(trade_history.get_all())

if __name__ == '__main__':
    app.run(debug=True, port=5000)

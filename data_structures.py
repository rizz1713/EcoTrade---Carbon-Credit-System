class Company:
    def __init__(self, company_id, name, emissions, credits_allocated, industry="Other"):
        self.company_id = company_id
        self.name = name
        self.emissions = float(emissions)
        self.credits_allocated = float(credits_allocated)
        self.credits_balance = self.credits_allocated - self.emissions
        self.industry = industry

    def update_emissions(self, new_emissions):
        self.emissions = float(new_emissions)
        self.credits_balance = self.credits_allocated - self.emissions
        
    def to_dict(self):
        return {
            'company_id': self.company_id,
            'name': self.name,
            'emissions': self.emissions,
            'credits_allocated': self.credits_allocated,
            'credits_balance': self.credits_balance,
            'industry': self.industry
        }

class HashTable:
    def __init__(self, size=100):
        self.size = size
        self.table = [[] for _ in range(size)]
    
    def _hash(self, key):
        return hash(key) % self.size
        
    def insert(self, key, value):
        hash_idx = self._hash(key)
        for i, kv in enumerate(self.table[hash_idx]):
            if kv[0] == key:
                self.table[hash_idx][i] = (key, value)
                return
        self.table[hash_idx].append((key, value))
        
    def get(self, key):
        hash_idx = self._hash(key)
        for k, v in self.table[hash_idx]:
            if k == key:
                return v
        return None

    def get_all(self):
        all_items = []
        for bucket in self.table:
            for k, v in bucket:
                all_items.append(v)
        return all_items

class AVLNode:
    def __init__(self, company):
        self.company = company
        self.left = None
        self.right = None
        self.height = 1

class AVLTree:
    def __init__(self):
        self.root = None
        
    def _height(self, node):
        if not node: return 0
        return node.height
        
    def _balance(self, node):
        if not node: return 0
        return self._height(node.left) - self._height(node.right)
        
    def _right_rotate(self, y):
        x = y.left
        T2 = x.right
        x.right = y
        y.left = T2
        y.height = max(self._height(y.left), self._height(y.right)) + 1
        x.height = max(self._height(x.left), self._height(x.right)) + 1
        return x
        
    def _left_rotate(self, x):
        y = x.right
        T2 = y.left
        y.left = x
        x.right = T2
        x.height = max(self._height(x.left), self._height(x.right)) + 1
        y.height = max(self._height(y.left), self._height(y.right)) + 1
        return y
        
    def insert(self, root, company):
        if not root:
            return AVLNode(company)
        elif company.credits_balance < root.company.credits_balance:
            root.left = self.insert(root.left, company)
        else:
            root.right = self.insert(root.right, company)
            
        root.height = 1 + max(self._height(root.left), self._height(root.right))
        balance = self._balance(root)
        
        if balance > 1 and company.credits_balance < root.left.company.credits_balance:
            return self._right_rotate(root)
        if balance < -1 and company.credits_balance >= root.right.company.credits_balance:
            return self._left_rotate(root)
        if balance > 1 and company.credits_balance >= root.left.company.credits_balance:
            root.left = self._left_rotate(root.left)
            return self._right_rotate(root)
        if balance < -1 and company.credits_balance < root.right.company.credits_balance:
            root.right = self._right_rotate(root.right)
            return self._left_rotate(root)
            
        return root
        
    def add(self, company):
        self.root = self.insert(self.root, company)

    def in_order(self, root, res):
        if root:
            self.in_order(root.left, res)
            res.append(root.company)
            self.in_order(root.right, res)
            
    def get_sorted(self):
        res = []
        self.in_order(self.root, res)
        return res

class Graph:
    def __init__(self):
        self.adj_list = {}
        
    def add_node(self, company_id):
        if company_id not in self.adj_list:
            self.adj_list[company_id] = []
            
    def add_edge(self, seller_id, buyer_id, amount):
        if seller_id not in self.adj_list:
            self.add_node(seller_id)
        if buyer_id not in self.adj_list:
            self.add_node(buyer_id)
        self.adj_list[seller_id].append({'to': buyer_id, 'amount': amount})
        
    def get_edges(self):
        edges = []
        for frm, tos in self.adj_list.items():
            for to in tos:
                edges.append({'from': frm, 'to': to['to'], 'amount': to['amount']})
        return edges

class Queue:
    def __init__(self):
        self.items = []
        
    def enqueue(self, item):
        self.items.insert(0, item)
        
    def dequeue(self):
        if not self.is_empty():
            return self.items.pop()
        return None
        
    def is_empty(self):
        return len(self.items) == 0
        
    def get_all(self):
        return list(reversed(self.items))

class Stack:
    def __init__(self):
        self.items = []
        
    def push(self, item):
        self.items.append(item)
        
    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None
        
    def is_empty(self):
        return len(self.items) == 0
        
    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None

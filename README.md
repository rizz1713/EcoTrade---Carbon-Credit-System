# EcoTrade: Carbon Credit Trading Simulation System

A web-based Carbon Credit Trading Simulator built as an Advanced Data Structures course project. This system demonstrates the practical application of Hash Tables, AVL Trees, Graphs, Queues, and Stacks in a real-world environmental scenario.

---

## Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Data Structures Used](#data-structures-used)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Login Credentials](#login-credentials)
- [System Architecture](#system-architecture)
- [Screenshots](#screenshots)
- [Team Members](#team-members)

---

## About The Project

Climate change is a major global problem caused mainly by excess carbon emissions. To control pollution, governments introduced the carbon credit system, where companies are allowed a limited amount of emissions. Companies that emit less can sell unused credits, and companies that emit more must buy extra credits.

EcoTrade is an educational, interactive simulator that demonstrates how carbon credit trading works using proper data structures. It is designed for students and learners who want to understand the mechanics of carbon markets.

---

## Features

| Feature                         | Description                                                    |
|---------------------------------|----------------------------------------------------------------|
| Company Registration & Login    | Register companies and authenticate as Admin or Company user   |
| Emission Tracking System        | Track CO2 emissions per company in real-time                   |
| Carbon Credit Allocation        | Government-assigned credit limits for each company             |
| Buy/Sell Trading Module         | Simulate carbon credit trading between companies               |
| Undo Trade (Stack)              | Revert the last trade using Stack (LIFO) data structure        |
| Company Ranking System          | Rank companies by eco-performance using AVL Tree               |
| Eco-Score Grading               | Letter grades (A+, A, B, C, F) based on emissions ratio       |
| Trading Network Visualization   | Directed graph visualization of trade relationships            |
| Trade History & Logs            | Chronological trade logs with search and filter                |
| Industry Categorization         | Companies grouped by sector (Tech, Manufacturing, etc.)        |
| Reports & Analytics Dashboard   | Bar charts, radar charts, and stat cards                       |
| Admin Control Panel             | Full system access for administrators                          |

---

## Data Structures Used

| Data Structure  | Purpose                                              | Time Complexity |
|-----------------|------------------------------------------------------|-----------------|
| Hash Table      | Fast O(1) lookup of company details using company ID | O(1) avg        |
| AVL Tree        | Store and sort companies by credits balance for rankings | O(log n)     |
| Graph           | Represent directed trading relationships (adjacency list) | O(V + E)   |
| Queue           | FIFO trade history logging                           | O(1)            |
| Stack           | LIFO undo operations for reversing trades            | O(1)            |

All data structures are implemented **from scratch** in Python (no built-in library shortcuts).

---

## Technology Stack

### Frontend
- React.js (Vite)
- Recharts (Bar Chart, Radar Chart)
- Lucide React (Icons)
- Axios (HTTP Client)
- React Router DOM (Navigation)
- Vanilla CSS (Custom Design System)

### Backend
- Python 3
- Flask (REST API)
- Flask-CORS (Cross-Origin Resource Sharing)

### Storage
- In-Memory Data Structures (no external database required)

---

## Project Structure

```
dsa-project/
|
|-- app.py                        # Flask backend server (REST API)
|-- data_structures.py            # Custom DS implementations (HashTable, AVL, Graph, Queue, Stack)
|-- requirements.txt              # Python dependencies
|-- .gitignore                    # Git ignore rules
|-- README.md                     # Project documentation (this file)
|
|-- frontend-react/               # React frontend application
|   |-- package.json              # Node.js dependencies
|   |-- vite.config.js            # Vite configuration
|   |-- index.html                # HTML entry point
|   |
|   |-- src/
|       |-- main.jsx              # React entry point
|       |-- App.jsx               # App routing and authentication
|       |-- index.css             # Global CSS design system
|       |
|       |-- components/
|       |   |-- Layout.jsx        # Sidebar + Header layout wrapper
|       |
|       |-- pages/
|           |-- Login.jsx         # Login page (Admin & Company)
|           |-- Dashboard.jsx     # Dashboard with charts and rankings
|           |-- Trading.jsx       # Trade execution with live preview
|           |-- History.jsx       # Trade history with search & filter
|           |-- Network.jsx       # Graph visualization (Canvas)
|           |-- Companies.jsx     # Company management (Admin only)
|
|-- static/                       # (Legacy) static assets
|-- templates/                    # (Legacy) HTML templates
```

---

## Installation & Setup

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- npm (comes with Node.js)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd dsa-project
```

### Step 2: Setup Backend (Python Flask)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python app.py
```

The backend will run on **http://127.0.0.1:5000**

### Step 3: Setup Frontend (React)

Open a **new terminal window** and run:

```bash
# Navigate to the frontend folder
cd frontend-react

# Install Node.js dependencies
npm install

# Start the React development server
npm run dev
```

The frontend will run on **http://localhost:5173**

### Step 4: Open the Application

Open your browser and go to: **http://localhost:5173**

---

## Login Credentials

| Role     | Username | Password  | Access Level                     |
|----------|----------|-----------|----------------------------------|
| Admin    | admin    | password  | Full access to all features      |
| Company  | C001     | password  | EcoCorp - Company-level view     |
| Company  | C002     | password  | GreenTech - Company-level view   |
| Company  | C003     | password  | CarbonReduce - Company-level view|

**Note:** Company login accepts any password. Admin login requires exact credentials.

---

## System Architecture

```
User Browser (React Frontend)
        |
        | HTTP Requests (Axios)
        |
   Flask REST API (app.py)
        |
        |--- Hash Table  --> Company Storage & Lookup
        |--- AVL Tree     --> Sorted Rankings
        |--- Graph        --> Trade Network (Adjacency List)
        |--- Queue        --> Trade History (FIFO)
        |--- Stack        --> Undo Operations (LIFO)
        |
   JSON Responses back to Frontend
        |
   Recharts / Canvas --> Data Visualization
```

---

## API Endpoints

| Method | Endpoint             | Description                      |
|--------|----------------------|----------------------------------|
| GET    | /api/companies       | Get all registered companies     |
| POST   | /api/companies       | Register a new company           |
| GET    | /api/companies/:id   | Get a specific company by ID     |
| POST   | /api/trade           | Execute a carbon credit trade    |
| POST   | /api/trade/undo      | Undo the last trade (Stack pop)  |
| GET    | /api/rankings        | Get companies ranked by AVL Tree |
| GET    | /api/network         | Get trade network graph data     |
| GET    | /api/history         | Get trade history (Queue)        |

---

## Screenshots

After running the project, you will see:
1. **Login Page** - Two-panel design with Company and Admin login tabs
2. **Dashboard** - Stat cards, bar/radar charts, and rankings table
3. **Trading** - Live balance preview, trade execution, and undo functionality
4. **History** - Searchable and filterable transaction logs
5. **Network** - Interactive directed graph of trade relationships
6. **Companies** - Admin panel to register and manage companies

---

## Team Members

| Name              | Role                  |
|-------------------|-----------------------|
| Member 1          | Frontend Development  |
| Member 2          | Backend Development   |
| Member 3          | Data Structures & Testing |

*(Update with your actual team member names)*

---

## License

This project is developed for educational purposes as part of the Advanced Data Structures course curriculum.

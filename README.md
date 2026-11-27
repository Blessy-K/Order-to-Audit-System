# Order-to-Audit System

A web-based order, production, inventory, and audit management system designed for a small packaged-snacks manufacturing business.

## Demo

![Order-to-Audit System Demo](demo.gif)

## Features

- **Order Management:** Create and manage retailer and distributor orders.
- **Production Management:** Record production runs and compare planned versus actual material consumption.
- **Inventory Management:** Track raw materials and finished goods stock.
- **GST Invoicing:** Generate GST invoices in PDF format.
- **Dispatch & Payments:** Track dispatched orders, payments, and outstanding amounts.
- **Reports:** Export sales register and stock reports as CSV files.
- **Dashboard:** View key production, inventory, and sales summaries.

## Technology Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT, bcrypt
- **PDF Generation:** PDFKit

## Benchmark Scenario

The application includes a benchmark scenario for manufacturing Murukku 200g packets.

| Metric | Result |
|---|---:|
| Planned production | 200 packets |
| Actual good production | 188 packets |
| Yield variance | -6% |
| Planned oil consumption | 10 L |
| Actual oil consumption | 10.5 L |
| Oil consumption variance | +5% |
| Finished stock after production | 238 packets |
| Finished stock after dispatch | 88 packets |

### Inventory Closing Stock

| Material | Closing Quantity |
|---|---:|
| Flour | 120 kg |
| Cooking Oil | 19.5 L |
| Spice Mix | 3.8 kg |
| 200g Pouch | 306 pcs |
| Carton | 21 pcs |
| Murukku 200g | 88 packets |

### Sales and Invoice Summary

- Retailer A: 150 packets dispatched.
- Invoice taxable value: ₹7,500.
- CGST: ₹187.50.
- SGST: ₹187.50.
- Invoice total: ₹7,875.
- Payment received: ₹4,000.
- Outstanding amount: ₹3,875.
- Distributor B: 120 packets ordered; 88 available after the first dispatch, leaving a shortage of 32 packets.

## Backend API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check server and database status |
| POST | `/api/auth/login` | User login |
| POST | `/api/production/run-benchmark` | Execute benchmark production run |
| POST | `/api/sales/run-benchmark` | Execute benchmark sales workflow |
| GET | `/api/reports/invoice/INV-001/pdf` | Generate invoice PDF |
| GET | `/api/reports/sales-register` | Export sales register |
| GET | `/api/reports/stock-report` | Export stock report |

**Note:** Benchmark operations update inventory and create transactions. Run them only once on a freshly seeded database.

## Run Locally

### Prerequisites

- Node.js and npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/Blessy-K/Order-to-Audit-System.git
cd Order-to-Audit-System
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and configure:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/order_audit_db"
JWT_SECRET="your_local_secret"
SEED_USER_PASSWORD="your_local_password"
```

Create the PostgreSQL database named `order_audit_db`.

### 3. Set up the database

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run benchmark
```

Start the backend:

```bash
npm run dev
```

### 4. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Project Structure

```text
Order-to-Audit-System/
├── backend/
│   ├── prisma/
│   └── src/
├── frontend/
│   └── src/
├── demo.mp4
└── README.md
```

## Author

**Blessy Kondaboina**

GitHub: [Blessy-K](https://github.com/Blessy-K)
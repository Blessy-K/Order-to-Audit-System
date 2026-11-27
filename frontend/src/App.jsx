
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("Backend unavailable");
        return response.json();
      })
      .then((data) => {
        setBackendStatus(data.success ? "Connected" : "Disconnected");
      })
      .catch(() => setBackendStatus("Disconnected"));
  }, []);

  const metrics = [
    { label: "Finished Stock", value: "88", unit: "packets", note: "After dispatch" },
    { label: "Production Output", value: "188", unit: "packets", note: "200 planned" },
    { label: "Invoice Value", value: "₹7,875", unit: "", note: "Retailer A" },
    { label: "Outstanding", value: "₹3,875", unit: "", note: "After ₹4,000 payment" },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">OA</div>
          <div>
            <h2>OrderAudit</h2>
            <span>Manufacturing ERP</span>
          </div>
        </div>

        <nav>
          <a className="active" href="#dashboard">▦ Dashboard</a>
          <a href="#production">⚙ Production</a>
          <a href="#inventory">▤ Inventory</a>
          <a href="#sales">▣ Sales & Orders</a>
          <a href="#invoices">₹ Invoices & Payments</a>
          <a href="#reports">▥ Reports</a>
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot"></span>
          System operational
        </div>
      </aside>

      <main className="main" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">MANUFACTURING / OVERVIEW</p>
            <h1>Dashboard</h1>
            <p className="subheading">Order-to-Audit business overview</p>
          </div>
          <div className="admin-chip">
            <div className="avatar">A</div>
            <div><strong>Administrator</strong><small>Admin</small></div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow light">BUSINESS SUMMARY</p>
            <h2>Welcome to your operations dashboard</h2>
            <p>Monitor production, inventory, orders and payments in one place.</p>
          </div>
          <div className="date-chip">27 November 2026</div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Key Performance Indicators</h2>
              <p>Benchmark run summary</p>
            </div>
            <span className="live-label">● Benchmark data</span>
          </div>

          <div className="metric-grid">
            {metrics.map((metric) => (
              <article className="metric-card" key={metric.label}>
                <p>{metric.label}</p>
                <h3>{metric.value} <small>{metric.unit}</small></h3>
                <span>{metric.note}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="content-grid">
          <article className="panel" id="production">
            <div className="panel-heading">
              <div><h2>Production Summary</h2><p>Batch BATCH-001 · Murukku 200g</p></div>
              <span className="pill success">Completed</span>
            </div>
            <div className="production-numbers">
              <div><strong>200</strong><span>Planned</span></div>
              <div><strong>188</strong><span>Good output</span></div>
              <div><strong>6</strong><span>Damaged pouches</span></div>
            </div>
            <div className="variance-row">
              <span>Yield variance</span><strong className="danger">-6%</strong>
            </div>
            <div className="variance-row">
              <span>Oil consumption variance</span><strong className="danger">+5%</strong>
            </div>
            <div className="variance-row">
              <span>Labour + power cost</span><strong>₹1,800</strong>
            </div>
          </article>

          <article className="panel" id="sales">
            <div className="panel-heading">
              <div><h2>Sales Overview</h2><p>Benchmark orders</p></div>
            </div>
            <div className="order-row">
              <div><strong>SO-001 · Retailer A</strong><span>150 packets · Tamil Nadu</span></div>
              <span className="pill success">Dispatched</span>
            </div>
            <div className="order-row">
              <div><strong>SO-002 · Distributor B</strong><span>120 packets · Karnataka</span></div>
              <span className="pill warning">Pending</span>
            </div>
            <div className="shortage">
              <strong>32 packets shortage</strong>
              <span>88 available out of 120 ordered</span>
            </div>
          </article>
        </section>

        <section className="panel inventory-panel" id="inventory">
          <div className="panel-heading">
            <div><h2>Inventory Snapshot</h2><p>Closing stock after production and dispatch</p></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Category</th><th>Closing Quantity</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>Flour</td><td>Raw material</td><td>120 kg</td><td><span className="pill success">Available</span></td></tr>
                <tr><td>Cooking oil</td><td>Raw material</td><td>19.5 L</td><td><span className="pill success">Available</span></td></tr>
                <tr><td>Spice mix</td><td>Raw material</td><td>3.8 kg</td><td><span className="pill success">Available</span></td></tr>
                <tr><td>Pouches</td><td>Packaging</td><td>306 pcs</td><td><span className="pill success">Available</span></td></tr>
                <tr><td>Cartons</td><td>Packaging</td><td>21 pcs</td><td><span className="pill success">Available</span></td></tr>
                <tr><td>Murukku 200g</td><td>Finished goods</td><td>88 packets</td><td><span className="pill warning">Low stock</span></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel invoice-panel" id="invoices">
          <div className="panel-heading">
            <div><h2>Invoice & Payment Summary</h2><p>Invoice INV-001 · Retailer A</p></div>
            <span className="pill warning">Partially paid</span>
          </div>
          <div className="payment-grid">
            <div><span>Taxable amount</span><strong>₹7,500.00</strong></div>
            <div><span>CGST (2.5%)</span><strong>₹187.50</strong></div>
            <div><span>SGST (2.5%)</span><strong>₹187.50</strong></div>
            <div><span>Invoice total</span><strong>₹7,875.00</strong></div>
            <div><span>Payment received</span><strong className="green">₹4,000.00</strong></div>
            <div><span>Outstanding balance</span><strong className="danger">₹3,875.00</strong></div>
          </div>
        </section>
      <section className="panel">
  <h2>Reports & Downloads</h2>
  <p>Download business reports and GST invoice.</p>

  <div className="report-buttons">
    <a
      href="http://localhost:5000/api/reports/invoice/INV-001/pdf"
      target="_blank"
      rel="noreferrer"
    >
      Download GST Invoice
    </a>

    <a href="http://localhost:5000/api/reports/sales-register">
      Download Sales Register
    </a>

    <a href="http://localhost:5000/api/reports/stock-report">
      Download Stock Report
    </a>
  </div>
</section>
        <footer className="footer">
          <span>Order-to-Audit System</span>
          <span>Backend: <strong className={backendStatus === "Connected" ? "green" : "danger"}>{backendStatus}</strong></span>
        </footer>
      </main>
    </div>
  );
}

export default App;

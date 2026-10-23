# Clean Invoicing Engine for Freelancers ⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Cloudflare-success)](https://freelanceos-9x6.pages.dev/?ref=github_clean_invoice_engine)
[![Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20JS)-orange)]()
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-purple)]()

> A lightweight, zero-dependency, print-calibrated invoice generator built for independent software engineers, designers, and creative solopreneurs. No SaaS subscriptions, no account lock-in, no ugly Notion PDF export bugs.

🌐 **Live Web Application:** [https://freelanceos-9x6.pages.dev](https://freelanceos-9x6.pages.dev/?ref=github_clean_invoice_engine)

---

## 💡 Why This Was Built

Most freelancers run into the same frustrating dilemma when billing clients:
1. **Notion PDF Export Bugs:** You organize your projects in Notion, but exporting an invoice page creates broken table borders, misaligned columns, and awkward multi-page splits.
2. **SaaS Bloatware:** Platforms like FreshBooks, HoneyBook, or QuickBooks charge **$25 to $50/month** just to generate 3 to 5 simple client invoices a month.
3. **Data Privacy Concerns:** Uploading client names, rates, and wire instructions to third-party databases creates unnecessary risk.

**Clean Invoicing Engine** solves this with a standalone, client-side web application. All calculations and draft persistence happen entirely in your browser's `localStorage`. When you click **Print / Save as PDF**, it outputs an executive A4/Letter invoice with calibrated typography, balanced margins, and zero page breaks.

---

## ✨ Features

- **Zero Dependencies:** Pure HTML5, CSS3, and Vanilla JavaScript. Runs instantly in any modern browser without npm build steps.
- **Calibrated Print Architecture:** `@media print` rules meticulously tuned for single-page A4 / US Letter PDF rendering with razor-sharp vector borders.
- **Complete Financial Math:**
  - Dynamic line-item calculation (Quantity × Rate).
  - Discount engine (Percentage or Fixed Dollar amount).
  - Configurable Tax / VAT rates.
  - Partial Deposit / Retainer deductions with clear **Balance Due** callouts.
- **Multi-Currency Support:** USD ($), EUR (€), GBP (£), CAD ($), AUD ($), JPY (¥), VND (₫), and SGD ($).
- **Persistent Local Profile:** Save your business details, address, VAT ID, and default wire instructions once; they auto-load on every new invoice.
- **100% Client-Side & Private:** Zero backend server. Your financial numbers, client details, and banking information never leave your local device.

---

## 🚀 Quick Start (Local Use)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/huynhphamthanhtri/clean-invoice-engine.git
   cd clean-invoice-engine
   ```
2. Open `index.html` directly in your web browser:
   - On macOS: `open index.html`
   - On Windows: `start index.html`
   - On Linux: `xdg-open index.html`
3. Enter your project details, click **Print / Save as PDF**, and select **Save as PDF** in your browser's print dialog.

---

## 📂 Project Architecture

```
clean-invoice-engine/
├── index.html          # Semantic responsive UI (editor sidebar + live preview)
├── styles.css          # Modern dark-mode UI + strict @media print calibration
├── app.js              # State manager, DOM bindings, and print orchestration
├── mathEngine.js       # Deterministic financial math calculations
└── storageEngine.js    # Browser localStorage profile and draft persistence
```

---

## 💼 The Full Operating System: The Client Billing Kit

Generating a clean invoice PDF is only step one of running an independent business. **The hardest part of freelancing is tracking overdue balances and getting paid on time.**

If you manage ongoing client retainers and project milestones, check out **The Client Billing Kit for Freelancers**:

- **Notion Cashflow OS:** An executive dashboard tracking Sent, Overdue, and Paid balances with automated Net-14/Net-30 status alerts.
- **Client Master CRM:** Centralized payment history, client tax IDs, and billing contacts.
- **3-Stage Overdue Payment Follow-Up Swipe Kit:** Word-for-word, professionally vetted email templates for handling late client payments:
  - *Stage 1 (Gentle Courtesy Reminder - 3 days before due date)*
  - *Stage 2 (Firm Status Check - 5 days overdue)*
  - *Stage 3 (Work Suspension / Escalation - 14+ days overdue)*
- **Commercial License:** 100% royalty-free terms for solo consultants, developers, and boutique agencies.

👉 **[Get The Client Billing Kit on Gumroad (20% Off Launch Coupon)](https://freelanceosmmo.gumroad.com/l/client-billing-kit/LAUNCH20?utm_source=github_clean_invoice_engine)**

---

## 📄 License

This open-source web application is distributed under the [MIT License](LICENSE). Feel free to inspect, fork, and adapt it for your own workflow.

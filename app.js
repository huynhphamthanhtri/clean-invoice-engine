/**
 * Application Controller for The Client Billing Kit
 * Manages live reactivity, user interactions, local state, and PDF export.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initial state with realistic fictional creative agency invoice
  const defaultInvoice = {
    invoiceNumber: 'INV-2026-084',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency: 'USD',
    senderName: 'Alex Morgan',
    businessName: 'Studio Minimalist',
    senderEmail: 'alex@studiominimalist.design',
    senderAddress: '100 Creative Way, Suite 400\nSan Francisco, CA 94103',
    clientName: 'Sarah Jenkins',
    clientCompany: 'Apex Brand Ventures',
    clientEmail: 'billing@apexventures.io',
    clientAddress: '550 Howard Street\nSan Francisco, CA 94105',
    items: [
      { id: 'item_1', description: 'Brand Identity Design & Visual System', quantity: 1, unitPrice: 2800.00 },
      { id: 'item_2', description: 'Figma Design Tokens & UI Component Kit', quantity: 1, unitPrice: 1600.00 },
      { id: 'item_3', description: 'Interactive Prototype & Usability Review (Hours)', quantity: 8.5, unitPrice: 120.00 }
    ],
    discountType: 'percentage',
    discountValue: 0,
    taxRate: 0,
    amountPaid: 1500.00, // 50% deposit already paid
    notes: 'Thank you for your business! Please remit final balance upon delivery of final vector and Figma source files.',
    paymentInstructions: 'Bank: Silicon Valley Bank / First Republic\nRouting: 12100024 | Acct: 892019482\nWire / ACH: billing@studiominimalist.design'
  };

  // State
  let invoice = StorageEngine.loadDraft() || defaultInvoice;
  let profile = StorageEngine.loadProfile();

  // DOM Elements
  const form = document.getElementById('invoiceForm');
  const itemsContainer = document.getElementById('lineItemsContainer');
  const btnAddItem = document.getElementById('btnAddItem');
  const btnPrint = document.getElementById('btnPrint');
  const btnSaveProfile = document.getElementById('btnSaveProfile');
  const logoInput = document.getElementById('logoInput');
  const accentColorPicker = document.getElementById('accentColorPicker');
  const btnReset = document.getElementById('btnReset');
  const upsellExportCard = document.getElementById('upsellExportCard');

  // Preview elements
  const prevInvoiceNum = document.getElementById('prevInvoiceNum');
  const prevIssueDate = document.getElementById('prevIssueDate');
  const prevDueDate = document.getElementById('prevDueDate');
  const prevSenderName = document.getElementById('prevSenderName');
  const prevSenderDetails = document.getElementById('prevSenderDetails');
  const prevClientName = document.getElementById('prevClientName');
  const prevClientDetails = document.getElementById('prevClientDetails');
  const prevTableBody = document.getElementById('prevTableBody');
  const prevSubtotal = document.getElementById('prevSubtotal');
  const prevDiscountRow = document.getElementById('prevDiscountRow');
  const prevDiscount = document.getElementById('prevDiscount');
  const prevTaxRow = document.getElementById('prevTaxRow');
  const prevTax = document.getElementById('prevTax');
  const prevGrandTotal = document.getElementById('prevGrandTotal');
  const prevPaidRow = document.getElementById('prevPaidRow');
  const prevAmountPaid = document.getElementById('prevAmountPaid');
  const prevBalanceDue = document.getElementById('prevBalanceDue');
  const prevNotes = document.getElementById('prevNotes');
  const prevPaymentTerms = document.getElementById('prevPaymentTerms');
  const prevLogoContainer = document.getElementById('prevLogoContainer');

  /**
   * Populate Form Fields from state
   */
  function populateForm() {
    document.getElementById('inputInvoiceNumber').value = invoice.invoiceNumber || '';
    document.getElementById('inputIssueDate').value = invoice.issueDate || '';
    document.getElementById('inputDueDate').value = invoice.dueDate || '';
    document.getElementById('inputCurrency').value = invoice.currency || 'USD';
    
    document.getElementById('inputSenderName').value = invoice.senderName || '';
    document.getElementById('inputBusinessName').value = invoice.businessName || '';
    document.getElementById('inputSenderAddress').value = invoice.senderAddress || '';

    document.getElementById('inputClientName').value = invoice.clientName || '';
    document.getElementById('inputClientCompany').value = invoice.clientCompany || '';
    document.getElementById('inputClientAddress').value = invoice.clientAddress || '';

    document.getElementById('inputDiscountValue').value = invoice.discountValue || 0;
    document.getElementById('inputDiscountType').value = invoice.discountType || 'percentage';
    document.getElementById('inputTaxRate').value = invoice.taxRate || 0;
    document.getElementById('inputAmountPaid').value = invoice.amountPaid || 0;

    document.getElementById('inputNotes').value = invoice.notes || '';
    document.getElementById('inputPaymentInstructions').value = invoice.paymentInstructions || '';

    renderLineItemInputs();
  }

  /**
   * Render line item form inputs
   */
  function renderLineItemInputs() {
    itemsContainer.innerHTML = '';
    invoice.items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'line-item-row';
      row.innerHTML = `
        <input type="text" placeholder="Description" value="${item.description}" data-index="${index}" data-field="description">
        <input type="number" step="any" placeholder="Qty" value="${item.quantity}" data-index="${index}" data-field="quantity">
        <input type="number" step="any" placeholder="Price" value="${item.unitPrice}" data-index="${index}" data-field="unitPrice">
        <button type="button" class="btn-remove-item" data-index="${index}" title="Remove Item">&times;</button>
      `;
      itemsContainer.appendChild(row);
    });

    // Bind remove buttons
    itemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (invoice.items.length > 1) {
          invoice.items.splice(idx, 1);
          renderLineItemInputs();
          updatePreview();
        }
      });
    });

    // Bind input changes
    itemsContainer.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const field = e.target.dataset.field;
        invoice.items[idx][field] = e.target.value;
        updatePreview();
      });
    });
  }

  /**
   * Update live invoice sheet preview with deterministic math
   */
  function updatePreview() {
    // 1. Calculate totals
    const calc = MathEngine.calculateInvoice(invoice);

    // 2. Render Header & Meta
    prevInvoiceNum.textContent = invoice.invoiceNumber || 'INV-001';
    prevIssueDate.textContent = invoice.issueDate || '—';
    prevDueDate.textContent = invoice.dueDate || '—';

    // 3. Sender Info
    prevSenderName.textContent = invoice.businessName || invoice.senderName || 'Your Business';
    prevSenderDetails.textContent = [
      invoice.senderName !== invoice.businessName ? invoice.senderName : '',
      invoice.senderAddress
    ].filter(Boolean).join('\n');

    // 4. Client Info
    prevClientName.textContent = invoice.clientCompany || invoice.clientName || 'Client Name';
    prevClientDetails.textContent = [
      invoice.clientCompany && invoice.clientName ? `Attn: ${invoice.clientName}` : '',
      invoice.clientAddress
    ].filter(Boolean).join('\n');

    // 5. Render Table Rows
    prevTableBody.innerHTML = '';
    calc.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="item-desc-cell">${item.description || 'Service item'}</td>
        <td class="col-right item-num-cell">${item.quantity}</td>
        <td class="col-right item-num-cell">${MathEngine.formatMoney(item.unitPrice, calc.currency)}</td>
        <td class="col-right item-num-cell font-bold">${MathEngine.formatMoney(item.total, calc.currency)}</td>
      `;
      prevTableBody.appendChild(tr);
    });

    // 6. Totals
    prevSubtotal.textContent = MathEngine.formatMoney(calc.subtotal, calc.currency);

    if (calc.hasDiscount) {
      prevDiscountRow.style.display = 'flex';
      const label = invoice.discountType === 'percentage' ? `Discount (${invoice.discountValue}%)` : 'Discount';
      document.getElementById('prevDiscountLabel').textContent = label;
      prevDiscount.textContent = `-${MathEngine.formatMoney(calc.discountAmount, calc.currency)}`;
    } else {
      prevDiscountRow.style.display = 'none';
    }

    if (calc.hasTax) {
      prevTaxRow.style.display = 'flex';
      document.getElementById('prevTaxLabel').textContent = `Tax (${invoice.taxRate}%)`;
      prevTax.textContent = MathEngine.formatMoney(calc.taxAmount, calc.currency);
    } else {
      prevTaxRow.style.display = 'none';
    }

    prevGrandTotal.textContent = MathEngine.formatMoney(calc.grandTotal, calc.currency);

    if (calc.amountPaid > 0) {
      prevPaidRow.style.display = 'flex';
      prevAmountPaid.textContent = `-${MathEngine.formatMoney(calc.amountPaid, calc.currency)}`;
      prevBalanceDue.textContent = MathEngine.formatMoney(calc.balanceDue, calc.currency);
    } else {
      prevPaidRow.style.display = 'none';
      prevBalanceDue.textContent = MathEngine.formatMoney(calc.grandTotal, calc.currency);
    }

    // 7. Footer
    prevNotes.textContent = invoice.notes || 'Payment due upon receipt.';
    prevPaymentTerms.textContent = invoice.paymentInstructions || 'Direct Bank Transfer / Wire';

    // 8. Logo & Accent
    if (profile.logoDataUri) {
      prevLogoContainer.innerHTML = `<img src="${profile.logoDataUri}" alt="Business Logo">`;
    }

    // Persist draft
    StorageEngine.saveDraft(invoice);
  }

  // Bind Form Inputs to State
  function bindFormInputs() {
    const fields = [
      'inputInvoiceNumber', 'inputIssueDate', 'inputDueDate', 'inputCurrency',
      'inputSenderName', 'inputBusinessName', 'inputSenderAddress',
      'inputClientName', 'inputClientCompany', 'inputClientAddress',
      'inputDiscountValue', 'inputDiscountType', 'inputTaxRate', 'inputAmountPaid',
      'inputNotes', 'inputPaymentInstructions'
    ];

    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          const key = id.replace('input', '');
          const propName = key.charAt(0).toLowerCase() + key.slice(1);
          invoice[propName] = e.target.value;
          updatePreview();
        });
      }
    });

    btnAddItem.addEventListener('click', () => {
      invoice.items.push({
        id: 'item_' + Date.now(),
        description: '',
        quantity: 1,
        unitPrice: 0
      });
      renderLineItemInputs();
      updatePreview();
    });

    // Logo Upload
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          profile.logoDataUri = event.target.result;
          StorageEngine.saveProfile(profile);
          updatePreview();
        };
        reader.readAsDataURL(file);
      }
    });

    // Accent Color Picker
    accentColorPicker.addEventListener('input', (e) => {
      const color = e.target.value;
      profile.accentColor = color;
      document.documentElement.style.setProperty('--accent', color);
      StorageEngine.saveProfile(profile);
    });

    // Save Profile (Starter feature preview)
    btnSaveProfile.addEventListener('click', () => {
      StorageEngine.saveProfile({
        businessName: invoice.businessName,
        senderName: invoice.senderName,
        senderAddress: invoice.senderAddress,
        defaultCurrency: invoice.currency,
        defaultPaymentTerms: invoice.paymentInstructions
      });
      alert('✓ Business Profile Saved! Your details will automatically populate on every new invoice.');
    });

    // Reset Form
    btnReset.addEventListener('click', () => {
      if (confirm('Reset invoice to blank template?')) {
        invoice = {
          invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          currency: 'USD',
          senderName: profile.senderName || '',
          businessName: profile.businessName || '',
          senderAddress: profile.senderAddress || '',
          clientName: '',
          clientCompany: '',
          clientAddress: '',
          items: [{ id: 'item_1', description: '', quantity: 1, unitPrice: 0 }],
          discountType: 'percentage',
          discountValue: 0,
          taxRate: 0,
          amountPaid: 0,
          notes: '',
          paymentInstructions: profile.defaultPaymentTerms || ''
        };
        populateForm();
        updatePreview();
      }
    });

    // Post-Action Value Bridge Logic
    const postActionModal = document.getElementById('postActionModal');
    const btnModalClose = document.getElementById('btnModalClose');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const btnDismissOffer = document.getElementById('btnDismissOffer');
    let hasShownOfferThisSession = sessionStorage.getItem('fos_bridge_shown') === 'true';

    function showPostActionOffer() {
      if (!hasShownOfferThisSession && postActionModal) {
        hasShownOfferThisSession = true;
        sessionStorage.setItem('fos_bridge_shown', 'true');
        postActionModal.style.display = 'flex';
      }
    }

    function hidePostActionOffer() {
      if (postActionModal) {
        postActionModal.style.display = 'none';
      }
    }

    if (btnModalClose) btnModalClose.addEventListener('click', hidePostActionOffer);
    if (modalBackdrop) modalBackdrop.addEventListener('click', hidePostActionOffer);
    if (btnDismissOffer) btnDismissOffer.addEventListener('click', hidePostActionOffer);

    // Print / Export PDF
    btnPrint.addEventListener('click', () => {
      // Archive snapshot before printing
      StorageEngine.archiveInvoice(invoice);
      window.print();
      // Show contextual upsell card after export
      if (upsellExportCard) {
        upsellExportCard.style.display = 'block';
      }
      setTimeout(showPostActionOffer, 800);
    });

    window.addEventListener('afterprint', () => {
      setTimeout(showPostActionOffer, 400);
    });

    // Outbound Link UTM & Referral Parameter Decorator
    function decorateOutboundLinks() {
      const searchParams = new URLSearchParams(window.location.search);
      if (!searchParams.toString()) return;

      const outgoingLinks = document.querySelectorAll('a[href*="freelanceosmmo.gumroad.com"]');
      outgoingLinks.forEach(link => {
        try {
          const url = new URL(link.href);
          searchParams.forEach((val, key) => {
            if (!url.searchParams.has(key)) {
              url.searchParams.set(key, val);
            }
          });
          link.href = url.toString();
        } catch (e) {
          // ignore malformed urls
        }
      });
    }

    decorateOutboundLinks();
  }

  // Initialize
  populateForm();
  updatePreview();
  bindFormInputs();
});

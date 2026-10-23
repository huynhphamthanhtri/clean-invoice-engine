/**
 * Math Engine for The Client Billing Kit
 * Provides deterministic, precision-safe financial calculations for invoices.
 * Prevents IEEE-754 floating-point rounding bugs (e.g. 0.1 + 0.2 !== 0.3).
 * Compatible with Node.js and Browser environments.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MathEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Currency decimal configuration dictionary
  const CURRENCY_PRECISION = {
    USD: 2,
    EUR: 2,
    GBP: 2,
    CAD: 2,
    AUD: 2,
    CHF: 2,
    JPY: 0,
    VND: 0,
    KRW: 0,
    INR: 2,
    BRL: 2,
    MXN: 2,
    SGD: 2
  };

  /**
   * Safe round half away from zero (standard commercial rounding)
   * Avoids binary float rounding artifacts by scaling with integer math.
   */
  function roundToPrecision(value, decimals) {
    if (isNaN(value) || value === null) return 0;
    const factor = Math.pow(10, decimals);
    // Number.EPSILON prevents precision drift (e.g., 1.005 * 100 = 100.49999999999999)
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  /**
   * Parse numeric value safely from string or number
   */
  function parseNumber(val, fallback = 0) {
    if (typeof val === 'number') {
      return isNaN(val) ? fallback : val;
    }
    if (typeof val === 'string') {
      // Remove commas, currency symbols, and excess whitespace
      const clean = val.replace(/[^0-9.-]/g, '').trim();
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }

  /**
   * Calculate single invoice line item
   */
  function calculateLineItem(item, currencyCode = 'USD') {
    const decimals = CURRENCY_PRECISION[currencyCode.toUpperCase()] ?? 2;
    const quantity = Math.max(0, parseNumber(item.quantity, 1));
    const unitPrice = Math.max(0, parseNumber(item.unitPrice, 0));
    
    const rawTotal = quantity * unitPrice;
    const lineTotal = roundToPrecision(rawTotal, decimals);

    return {
      id: item.id || Math.random().toString(36).substring(2, 9),
      description: item.description || '',
      quantity,
      unitPrice,
      total: lineTotal
    };
  }

  /**
   * Calculate full invoice totals deterministically
   */
  function calculateInvoice(invoiceData) {
    const currency = (invoiceData.currency || 'USD').toUpperCase();
    const decimals = CURRENCY_PRECISION[currency] ?? 2;

    const rawItems = Array.isArray(invoiceData.items) ? invoiceData.items : [];
    const calculatedItems = rawItems.map(item => calculateLineItem(item, currency));

    // 1. Subtotal = sum of calculated line totals
    const subtotal = roundToPrecision(
      calculatedItems.reduce((acc, item) => acc + item.total, 0),
      decimals
    );

    // 2. Discount Calculation
    const discountType = invoiceData.discountType === 'percentage' ? 'percentage' : 'fixed';
    const discountValue = Math.max(0, parseNumber(invoiceData.discountValue, 0));
    let discountAmount = 0;

    if (discountType === 'percentage') {
      const pct = Math.min(100, discountValue);
      discountAmount = roundToPrecision(subtotal * (pct / 100), decimals);
    } else {
      discountAmount = roundToPrecision(Math.min(subtotal, discountValue), decimals);
    }

    // 3. Taxable Base
    const taxableBase = Math.max(0, roundToPrecision(subtotal - discountAmount, decimals));

    // 4. Tax Calculation
    const taxRate = Math.max(0, parseNumber(invoiceData.taxRate, 0));
    const taxAmount = roundToPrecision(taxableBase * (taxRate / 100), decimals);

    // 5. Grand Total
    const grandTotal = roundToPrecision(taxableBase + taxAmount, decimals);

    // 6. Paid / Deposit & Balance Due
    const amountPaid = Math.max(0, parseNumber(invoiceData.amountPaid, 0));
    const balanceDue = roundToPrecision(Math.max(0, grandTotal - amountPaid), decimals);

    return {
      currency,
      decimals,
      items: calculatedItems,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxableBase,
      taxRate,
      taxAmount,
      grandTotal,
      amountPaid,
      balanceDue,
      isFullyPaid: balanceDue === 0 && grandTotal > 0,
      hasTax: taxAmount > 0,
      hasDiscount: discountAmount > 0
    };
  }

  /**
   * Format monetary value with proper currency symbol and separators
   */
  function formatMoney(amount, currencyCode = 'USD', locale = 'en-US') {
    const currency = currencyCode.toUpperCase();
    const decimals = CURRENCY_PRECISION[currency] ?? 2;
    const cleanAmount = roundToPrecision(parseNumber(amount), decimals);

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(cleanAmount);
    } catch (e) {
      // Fallback simple format if locale/currency fails
      return `${currency} ${cleanAmount.toFixed(decimals)}`;
    }
  }

  return {
    CURRENCY_PRECISION,
    roundToPrecision,
    parseNumber,
    calculateLineItem,
    calculateInvoice,
    formatMoney
  };
}));

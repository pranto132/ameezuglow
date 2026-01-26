import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string;
  city: string;
  area: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: string;
  created_at: string | null;
  notes: string | null;
  transaction_id: string | null;
}

interface SiteSettings {
  site_name?: string;
  site_logo?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
}

export const openInvoiceInNewTab = async (orderNumber: string) => {
  try {
    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (orderError || !order) {
      alert("Order not found");
      return;
    }

    // Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (itemsError) {
      alert("Failed to load order items");
      return;
    }

    // Fetch site settings
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("key, value");

    const siteSettings: SiteSettings = {};
    settingsData?.forEach((s) => {
      (siteSettings as any)[s.key] = s.value || "";
    });

    // Generate and open invoice
    const invoiceHTML = generateInvoiceHTML(order, orderItems || [], siteSettings);
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
    }
  } catch (error) {
    console.error("Error opening invoice:", error);
    alert("Failed to open invoice");
  }
};

const generateInvoiceHTML = (
  order: Order,
  orderItems: OrderItem[],
  settings: SiteSettings
): string => {
  const siteName = settings.site_name || "Ameezuglow";
  const siteLogo = settings.site_logo;
  const sitePhone = settings.contact_phone || "";
  const siteEmail = settings.contact_email || "";
  const siteAddress = settings.contact_address || "";
  const orderDate = order.created_at ? format(new Date(order.created_at), "MMM dd, yyyy") : "-";

  const paymentMethodLabels: Record<string, string> = {
    cod: "Cash on Delivery",
    bkash: "bKash",
    nagad: "Nagad",
    rocket: "Rocket",
    bank: "Bank Transfer",
  };

  const itemsHTML = orderItems
    .map(
      (item, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">৳${Number(item.price).toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">৳${(Number(item.price) * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.order_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f3f4f6;
      color: #1f2937;
      line-height: 1.5;
    }
    .print-btn {
      position: fixed;
      top: 16px;
      right: 16px;
      background: #374151;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .print-btn:hover {
      background: #1f2937;
    }
    .invoice-container {
      max-width: 800px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .invoice-header {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #e5e7eb;
    }
    .company-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .company-logo {
      height: 50px;
      max-width: 150px;
      object-fit: contain;
    }
    .company-name {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
    }
    .company-address {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 {
      font-size: 18px;
      color: #6b7280;
      font-weight: 500;
    }
    .invoice-id {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-top: 4px;
    }
    .section-title {
      background: #f9fafb;
      padding: 12px 24px;
      font-weight: 600;
      font-size: 14px;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }
    .customer-section {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .customer-section h4 {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .customer-card {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e5e7eb;
    }
    .customer-name {
      font-weight: 600;
      font-size: 16px;
      color: #1f2937;
    }
    .customer-address {
      font-size: 14px;
      color: #6b7280;
      margin-top: 4px;
    }
    .customer-phone {
      font-size: 14px;
      margin-top: 8px;
    }
    .customer-phone a {
      color: #2563eb;
      text-decoration: none;
    }
    .invoice-details {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .details-card {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e5e7eb;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
    }
    .details-label {
      color: #6b7280;
      font-size: 14px;
    }
    .details-value {
      font-weight: 500;
      font-size: 14px;
      color: #1f2937;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table th {
      background: #e0f2fe;
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      color: #0369a1;
    }
    .items-table th:nth-child(3),
    .items-table th:nth-child(4),
    .items-table th:nth-child(5) {
      text-align: right;
    }
    .items-table th:nth-child(4) {
      text-align: center;
    }
    .summary-section {
      padding: 20px 24px;
    }
    .summary-card {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      max-width: 300px;
      margin-left: auto;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .summary-label {
      color: #6b7280;
    }
    .summary-value {
      font-weight: 500;
      color: #1f2937;
    }
    .summary-total {
      border-top: 2px solid #1f2937;
      margin-top: 8px;
      padding-top: 12px;
    }
    .summary-total .summary-label,
    .summary-total .summary-value {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
    }
    .discount-row {
      color: #059669;
    }
    .discount-row .summary-value {
      color: #059669;
    }
    .footer {
      text-align: center;
      padding: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 13px;
    }
    @media print {
      body {
        background: white;
      }
      .print-btn {
        display: none !important;
      }
      .invoice-container {
        margin: 0;
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
    Print Invoice
  </button>

  <div class="invoice-container">
    <!-- Header -->
    <div class="invoice-header">
      <div class="company-info">
        ${siteLogo 
          ? `<img src="${siteLogo}" alt="${siteName}" class="company-logo">`
          : `<div class="company-name">${siteName}</div>`
        }
        <div>
          ${siteAddress ? `<div class="company-address">${siteAddress}</div>` : ""}
      </div>
      <div class="invoice-title">
        <h2>Invoice</h2>
        <div class="invoice-id">ID: #${order.order_number}</div>
      </div>
    </div>

    <!-- Order Summary Title -->
    <div class="section-title">Order Summary</div>

    <!-- Customer Info -->
    <div class="customer-section">
      <h4>Invoice To</h4>
      <div class="customer-card">
        <div class="customer-name">${order.customer_name}</div>
        <div class="customer-address">${order.shipping_address}${order.area ? `, ${order.area}` : ""}, ${order.city}</div>
        <div class="customer-phone">
          Phone: <a href="tel:${order.customer_phone}">${order.customer_phone}</a>
        </div>
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="invoice-details">
      <div class="details-card">
        <div class="details-row">
          <span class="details-label">Invoice</span>
          <span class="details-value">#${order.order_number}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Date</span>
          <span class="details-value">${orderDate}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Payment Method</span>
          <span class="details-value">${paymentMethodLabels[order.payment_method] || order.payment_method}</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50px;">SL.</th>
          <th>Item Description</th>
          <th style="width: 100px;">Price</th>
          <th style="width: 60px;">Qty</th>
          <th style="width: 100px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <!-- Summary -->
    <div class="summary-section">
      <div class="summary-card">
        <div class="summary-row">
          <span class="summary-label">Sub Total</span>
          <span class="summary-value">৳${Number(order.subtotal).toLocaleString()}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Delivery Charge</span>
          <span class="summary-value">৳${Number(order.shipping_cost).toLocaleString()}</span>
        </div>
        ${
          Number(order.discount) > 0
            ? `
        <div class="summary-row discount-row">
          <span class="summary-label">Discount</span>
          <span class="summary-value">-৳${Number(order.discount).toLocaleString()}</span>
        </div>
        `
            : ""
        }
        <div class="summary-row summary-total">
          <span class="summary-label">Total</span>
          <span class="summary-value">৳${Number(order.total).toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      Thank you for your order!
      ${sitePhone ? `<br>Contact: ${sitePhone}` : ""}
      ${siteEmail ? ` | ${siteEmail}` : ""}
    </div>
  </div>
</body>
</html>
  `;
};

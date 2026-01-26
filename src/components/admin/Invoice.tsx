import { forwardRef } from "react";
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
  payment_status: string | null;
  order_status: string | null;
  transaction_id: string | null;
  created_at: string | null;
  notes: string | null;
}

interface InvoiceProps {
  order: Order;
  orderItems: OrderItem[];
  siteName?: string;
  siteLogo?: string;
  sitePhone?: string;
  siteEmail?: string;
  siteAddress?: string;
}

export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(
  ({ order, orderItems, siteName = "Ameezuglow", siteLogo, sitePhone, siteEmail, siteAddress }, ref) => {
    const paymentMethodLabels: Record<string, string> = {
      cod: "Cash on Delivery",
      bkash: "bKash",
      nagad: "Nagad",
      rocket: "Rocket",
      bank: "Bank Transfer",
    };

    return (
      <div ref={ref} className="bg-white text-black p-8 max-w-[800px] mx-auto print:p-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
          <div>
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-12 max-w-[180px] object-contain" />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{siteName}</h1>
            )}
            {sitePhone && <p className="text-sm text-gray-600 mt-2">Phone: {sitePhone}</p>}
            {siteEmail && <p className="text-sm text-gray-600">Email: {siteEmail}</p>}
            {siteAddress && <p className="text-sm text-gray-600 max-w-xs">{siteAddress}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-lg font-mono mt-2">{order.order_number}</p>
            <p className="text-sm text-gray-600 mt-1">
              Date: {order.created_at ? format(new Date(order.created_at), "dd/MM/yyyy") : "-"}
            </p>
          </div>
        </div>

        {/* Customer & Order Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Info</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">{order.customer_name}</p>
              <p className="text-sm text-gray-600">{order.customer_phone}</p>
              {order.customer_email && (
                <p className="text-sm text-gray-600">{order.customer_email}</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Delivery Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{order.shipping_address}</p>
              <p className="text-sm text-gray-700">
                {order.area && `${order.area}, `}{order.city}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info - Single Row */}
        <div className="mb-8">
          <div className="bg-gray-50 p-3 rounded-lg text-center inline-block">
            <p className="text-xs text-gray-500 uppercase">Payment Method</p>
            <p className="font-semibold text-gray-900">{paymentMethodLabels[order.payment_method] || order.payment_method}</p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Order Items</h3>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left py-3 px-4 text-sm font-semibold">Product</th>
                <th className="text-center py-3 px-4 text-sm font-semibold">Qty</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-3 px-4 text-sm">{item.product_name}</td>
                  <td className="py-3 px-4 text-sm text-center">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    ৳{Number(item.price).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium">
                    ৳{(Number(item.price) * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-72">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">৳{Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Delivery Charge</span>
              <span className="font-medium">৳{Number(order.shipping_cost).toLocaleString()}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between py-2 text-sm text-green-600">
                <span>Discount</span>
                <span className="font-medium">-৳{Number(order.discount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-800 mt-2">
              <span>Total</span>
              <span>৳{Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Transaction ID */}
        {order.transaction_id && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">
              <span className="text-gray-500">Transaction ID:</span>{" "}
              <span className="font-mono font-medium">{order.transaction_id}</span>
            </p>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">Customer Note:</p>
            <p className="text-sm text-yellow-700 mt-1">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Thank you for your order!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This is a computer-generated invoice and does not require a signature.
          </p>
        </div>
      </div>
    );
  }
);

Invoice.displayName = "Invoice";

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { Printer, ArrowLeft, Download, Send } from 'lucide-react';

export default function PrintSalesInvoicePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem('finflow_company_id');
      if (!companyId) return;

      const res = await api.get(`/sales/invoices/${id}`, {
        params: { companyId },
      });
      setInvoice(res.data);
    } catch (err) {
      console.error('Failed to fetch invoice for print', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 text-xs">
        Loading GST Tax Invoice for printing...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 text-xs space-y-3">
        <div>Sales invoice record not found</div>
        <button
          onClick={() => router.push('/sales')}
          className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded"
        >
          Back to Sales Hub
        </button>
      </div>
    );
  }

  const comp = invoice.company || {};
  const cust = invoice.customer || {};
  const lines = invoice.lines || [];

  const subtotal = Number(invoice.subtotal || 0);
  const cgst = Number(invoice.cgstTotal || 0);
  const sgst = Number(invoice.sgstTotal || 0);
  const igst = Number(invoice.igstTotal || 0);
  const freight = Number(invoice.freightCharges || 0);
  const total = Number(invoice.totalAmount || 0);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      {/* Top Controls Bar (Hidden during window.print()) */}
      <div className="print:hidden max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/sales')}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sales Hub</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-lg text-xs font-medium shadow-lg shadow-brand-600/30 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Tax Invoice / Download PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container (A4 Printable Area) */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 shadow-2xl rounded-sm print:p-0 print:shadow-none print:w-full font-sans text-xs border border-slate-200 print:border-none">
        {/* Header Title */}
        <div className="text-center font-bold text-base uppercase tracking-wider border-b-2 border-slate-800 pb-2 mb-4">
          TAX INVOICE
        </div>

        {/* Company & Invoice Meta Header */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300">
          <div>
            <h2 className="text-base font-extrabold uppercase text-slate-900">{comp.name || 'FinFlow Enterprise Ltd'}</h2>
            <p className="text-slate-600 font-medium mt-1">{comp.address || 'Plot 42, FinTech Cyber City, Bandra Kurla Complex'}</p>
            <p className="text-slate-600">{comp.city || 'Mumbai'}, {comp.state || 'Maharashtra'} - {comp.pincode || '400051'}</p>
            <p className="text-slate-700 font-semibold mt-2">GSTIN: <span className="font-mono">{comp.gstin || '27AABCF1234H1Z5'}</span></p>
            <p className="text-slate-600">Email: {comp.email || 'accounts@finflow.com'} | Phone: {comp.phone || '+91 98765 43210'}</p>
          </div>

          <div className="text-right space-y-1">
            <div className="text-sm font-bold text-slate-900">
              Invoice No: <span className="font-mono text-slate-800">{invoice.invoiceNumber}</span>
            </div>
            <div className="text-slate-700 font-medium">
              Invoice Date: <span className="font-semibold">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</span>
            </div>
            {invoice.dueDate && (
              <div className="text-slate-600">
                Due Date: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
              </div>
            )}
            <div className="text-slate-600">
              Place of Supply: <span className="font-semibold">{invoice.placeOfSupply || comp.state}</span>
            </div>
            <div className="text-slate-600">
              Payment Terms: <span className="font-semibold uppercase">{invoice.paymentMode}</span>
            </div>
          </div>
        </div>

        {/* Party Details (Billed To) */}
        <div className="py-4 border-b border-slate-300 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <h3 className="font-bold uppercase text-slate-700 text-[11px] mb-1">Details of Buyer | Billed To:</h3>
            <p className="font-bold text-sm text-slate-900">{cust.name || 'Walk-in Customer'}</p>
            <p className="text-slate-600">{cust.address || 'Address on record'}</p>
            <p className="text-slate-600">{cust.city}, {cust.state}</p>
            {cust.gstin && (
              <p className="font-bold text-slate-800 mt-1">GSTIN: <span className="font-mono">{cust.gstin}</span></p>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <h3 className="font-bold uppercase text-slate-700 text-[11px] mb-1">Details of Consignee | Shipped To:</h3>
            <p className="font-bold text-sm text-slate-900">{cust.name || 'Walk-in Customer'}</p>
            <p className="text-slate-600">{cust.address || 'Address on record'}</p>
            <p className="text-slate-600">{cust.city}, {cust.state}</p>
          </div>
        </div>

        {/* Item Particulars Table */}
        <div className="py-4">
          <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-10 text-center">#</th>
                <th className="p-2 border-r border-slate-300">Item Description</th>
                <th className="p-2 border-r border-slate-300 text-center w-20">HSN/SAC</th>
                <th className="p-2 border-r border-slate-300 text-right w-16">Qty</th>
                <th className="p-2 border-r border-slate-300 text-right w-20">Rate (₹)</th>
                <th className="p-2 border-r border-slate-300 text-right w-20">Taxable (₹)</th>
                <th className="p-2 border-r border-slate-300 text-center w-16">GST %</th>
                <th className="p-2 text-right w-24">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lines.map((line: any, idx: number) => (
                <tr key={line.id || idx}>
                  <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-300 font-medium">
                    {line.item?.name || 'Product Item'}
                    {line.item?.code && <span className="block text-[10px] text-slate-500 font-mono">Code: {line.item.code}</span>}
                  </td>
                  <td className="p-2 border-r border-slate-300 text-center font-mono">{line.item?.hsnCode || '8517'}</td>
                  <td className="p-2 border-r border-slate-300 text-right font-mono">{Number(line.quantity)}</td>
                  <td className="p-2 border-r border-slate-300 text-right font-mono">{Number(line.unitPrice).toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-300 text-right font-mono">{Number(line.taxableAmount).toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-300 text-center font-mono">{Number(line.gstRate)}%</td>
                  <td className="p-2 text-right font-bold font-mono">{Number(line.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals & Tax Summary */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-300 pt-4">
          <div className="space-y-2">
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] space-y-1">
              <span className="font-bold uppercase text-slate-700">Bank Payment Details:</span>
              <p className="text-slate-600">Bank Name: <span className="font-semibold text-slate-900">HDFC Bank Ltd</span></p>
              <p className="text-slate-600">A/c Name: <span className="font-semibold text-slate-900">{comp.name || 'FinFlow Enterprise Ltd'}</span></p>
              <p className="text-slate-600">A/c No: <span className="font-mono text-slate-900 font-bold">50200012345678</span></p>
              <p className="text-slate-600">IFSC Code: <span className="font-mono text-slate-900 font-bold">HDFC0001234</span></p>
            </div>

            {invoice.notes && (
              <div className="text-[11px] text-slate-600">
                <span className="font-bold text-slate-700">Notes:</span> {invoice.notes}
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-right text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Taxable Subtotal:</span>
              <span className="font-mono font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>

            {cgst > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                <span>Central GST (CGST):</span>
                <span className="font-mono">₹{cgst.toFixed(2)}</span>
              </div>
            )}

            {sgst > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                <span>State GST (SGST):</span>
                <span className="font-mono">₹{sgst.toFixed(2)}</span>
              </div>
            )}

            {igst > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                <span>Integrated GST (IGST):</span>
                <span className="font-mono">₹{igst.toFixed(2)}</span>
              </div>
            )}

            {freight > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                <span>Freight & Insurance:</span>
                <span className="font-mono">₹{freight.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 text-sm font-extrabold text-slate-900 border-t-2 border-slate-800">
              <span>Grand Total:</span>
              <span className="font-mono text-base">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="mt-8 pt-8 border-t border-slate-300 flex items-end justify-between">
          <div className="text-[10px] text-slate-500 max-w-sm">
            <p className="font-bold text-slate-700 uppercase">Declaration:</p>
            <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
          </div>

          <div className="text-center">
            <p className="font-bold text-slate-900 text-xs mb-8">For {comp.name || 'FinFlow Enterprise Ltd'}</p>
            <p className="border-t border-slate-400 pt-1 text-[11px] font-semibold text-slate-700">Authorised Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}

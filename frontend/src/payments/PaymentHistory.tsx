import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import PaymentsService from './PaymentsService';
import { PaymentHistoryItem } from './types';

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await PaymentsService.getPaymentHistory();
      setPayments(response.data);
    } catch (err) {
      setError('Failed to fetch payment history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!payments || payments.length === 0) {
      return;
    }
    const headers = ['Date', 'Amount', 'Status', 'Description'];
    const dataToExport = payments.map(payment => [
      new Date(payment.created).toLocaleDateString(),
      payment.amount.toFixed(2),
      payment.status,
      payment.description || 'No description provided'
    ]);

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'payment_history.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (error) {
    return <div className="alert alert-error mt-4">{error}</div>;
  }

  return (
    <div className="mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Payment History</h1>

      <div className="bg-base-100 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transactions</h2>
            <div className="flex space-x-2">
              <button className="btn btn-sm btn-outline" onClick={exportToCSV}>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
          {!payments || payments.length === 0 ? (
            <div className="text-center text-base-content opacity-70">You have no transactions.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: PaymentHistoryItem) => (
                    <tr key={payment.id}>
                      <td>{new Date(payment.created).toLocaleDateString()}</td>
                      <td>${payment.amount.toFixed(2)}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.refunded ? 'refunded' : payment.status}
                        </span>
                      </td>
                      <td>{payment.description || 'No description provided'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;

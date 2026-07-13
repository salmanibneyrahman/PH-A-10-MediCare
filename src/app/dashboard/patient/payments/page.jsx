"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { getPatientPayments } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

export default function PatientPaymentsPage() {
  const { dbUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      if (!dbUser?._id) return;
      setLoading(true);
      try {
        const data = await getPatientPayments(dbUser._id.toString());
        setPayments(data || []);
      } catch {
        toast.error("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [dbUser]);

  const totalSpent = payments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  if (loading)
    return <LoadingSpinner text="Loading payment history..." />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-white">
          Payment History
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Track all your consultation payment records
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: "Total Spent",
            value: `$${totalSpent}`,
            icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            color: "from-emerald-500 to-teal-600",
            text: "text-emerald-400",
          },
          {
            label: "Total Transactions",
            value: payments.length,
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
            color: "from-cyan-500 to-blue-600",
            text: "text-cyan-400",
          },
          {
            label: "Last Payment",
            value:
              payments.length > 0 ? `$${payments[0]?.amount}` : "$0",
            icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
            color: "from-indigo-500 to-purple-600",
            text: "text-indigo-400",
          },
        ].map((card) => (
          <Card
            key={card.label}
            className="glass-card border border-white/10"
          >
            <CardBody className="p-5 flex flex-col gap-3">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={card.icon}
                  />
                </svg>
              </div>
              <div>
                <p className={`text-2xl font-black ${card.text}`}>
                  {card.value}
                </p>
                <p className="text-slate-400 text-sm">{card.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Payments Table */}
      <Card className="glass-card border border-white/10">
        <CardBody className="p-0">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">
                  No payment records
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Your payment history will appear here after you book
                  appointments.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Doctor</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        <span className="text-slate-400 font-mono text-xs">
                          {payment.transactionId
                            ? `${payment.transactionId.slice(0, 22)}...`
                            : "—"}
                        </span>
                      </td>
                      <td>
                        <span className="text-slate-200 text-sm font-medium">
                          {payment.doctorId || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="text-emerald-400 font-bold text-sm">
                          ${payment.amount}
                        </span>
                      </td>
                      <td>
                        <span className="text-slate-400 text-sm">
                          {payment.paymentDate
                            ? new Date(
                                payment.paymentDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 capitalize">
                          {payment.paymentMethod || "stripe"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
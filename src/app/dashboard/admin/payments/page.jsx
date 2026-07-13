"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Input } from "@heroui/react";
import { getAllPayments } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      try {
        const data = await getAllPayments();
        setPayments(data || []);
        setFiltered(data || []);
      } catch {
        toast.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(payments);
      return;
    }
    setFiltered(
      payments.filter(
        (p) =>
          p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.doctor?.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
          p.transactionId?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, payments]);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) return <LoadingSpinner text="Loading payment records..." />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-white">Payment Management</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track all financial transactions on the platform
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: "Total Revenue",
            value: `$${totalRevenue}`,
            color: "from-emerald-500 to-teal-600",
            text: "text-emerald-400",
            icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          },
          {
            label: "Total Transactions",
            value: payments.length,
            color: "from-cyan-500 to-blue-600",
            text: "text-cyan-400",
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
          },
          {
            label: "Average Transaction",
            value: payments.length > 0 ? `$${Math.round(totalRevenue / payments.length)}` : "$0",
            color: "from-indigo-500 to-purple-600",
            text: "text-indigo-400",
            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
          },
        ].map((card) => (
          <Card key={card.label} className="glass-card border border-white/10">
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

      {/* Search */}
      <Input
        placeholder="Search by patient, doctor or transaction ID..."
        value={search}
        onValueChange={setSearch}
        classNames={{
          inputWrapper:
            "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all",
          input: "text-slate-200 placeholder:text-slate-500 text-sm",
        }}
        startContent={
          <svg
            className="w-4 h-4 text-slate-500 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
      />

      {/* Table */}
      <Card className="glass-card border border-white/10">
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <svg
                className="w-16 h-16 text-slate-700"
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
              <p className="text-slate-400 font-medium">No payment records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        <span className="text-slate-400 font-mono text-xs">
                          {payment.transactionId
                            ? payment.transactionId.slice(0, 24) + "..."
                            : "—"}
                        </span>
                      </td>
                      <td>
                        <p className="text-white text-sm font-medium">
                          {payment.patient?.name || "Unknown"}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {payment.patient?.email}
                        </p>
                      </td>
                      <td>
                        <p className="text-white text-sm font-medium">
                          {payment.doctor?.doctorName || "Unknown"}
                        </p>
                        <p className="text-cyan-400 text-xs">
                          {payment.doctor?.specialization}
                        </p>
                      </td>
                      <td>
                        <span className="text-emerald-400 font-bold text-sm">
                          ${payment.amount}
                        </span>
                      </td>
                      <td className="text-slate-400 text-sm">
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )
                          : "—"}
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
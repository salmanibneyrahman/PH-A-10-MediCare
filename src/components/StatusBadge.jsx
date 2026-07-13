export default function StatusBadge({ status }) {
    const statusConfig = {
        pending: {
            label: "Pending",
            className: "badge-warning",
        },
        confirmed: {
            label: "Confirmed",
            className: "badge-info",
        },
        completed: {
            label: "Completed",
            className: "badge-success",
        },
        cancelled: {
            label: "Cancelled",
            className: "badge-danger",
        },
        rejected: {
            label: "Rejected",
            className: "badge-danger",
        },
        paid: {
            label: "Paid",
            className: "badge-success",
        },
        unpaid: {
            label: "Unpaid",
            className: "badge-warning",
        },
        verified: {
            label: "Verified",
            className: "badge-success",
        },
        unverified: {
            label: "Unverified",
            className: "badge-warning",
        },
        active: {
            label: "Active",
            className: "badge-success",
        },
        suspended: {
            label: "Suspended",
            className: "badge-danger",
        },
        accepted: {
            label: "Accepted",
            className: "badge-info",
        },
    };

    const config = statusConfig[status?.toLowerCase()] || {
        label: status || "Unknown",
        className: "badge-info",
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${config.className}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
            {config.label}
        </span>
    );
}
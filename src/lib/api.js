"use client";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getToken() {
    try {
        const { authClient } = await import("./authClient");
        const session = await authClient.getSession();
        return session?.data?.session?.token || null;
    } catch {
        return null;
    }
}

async function apiFetch(endpoint, options = {}) {
    const token = await getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ error: "Something went wrong" }));
        throw new Error(error.error || error.message || "API request failed");
    }
    return response.json();
}

// ─── USERS ────────────────────────────────────
export const getUsers = () => apiFetch("/api/users");

export const getUserByEmail = (email) =>
    apiFetch(`/api/users/${encodeURIComponent(email)}`);

export const createUser = (data) =>
    apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updateUser = (email, data) =>
    apiFetch(`/api/users/${encodeURIComponent(email)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

export const deleteUser = (id) =>
    apiFetch(`/api/users/${id}`, { method: "DELETE" });

export const updateUserStatus = (id, status) =>
    apiFetch(`/api/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });

// ─── DOCTORS ──────────────────────────────────
export const getDoctors = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/doctors?${query}`);
};

export const getFeaturedDoctors = () =>
    apiFetch("/api/doctors/featured");

export const getDoctorById = (id) => apiFetch(`/api/doctors/${id}`);

export const getDoctorByEmail = (email) =>
    apiFetch(`/api/doctors/profile/${encodeURIComponent(email)}`);

export const getAllDoctorsAdmin = () => apiFetch("/api/admin/doctors");

export const createDoctor = (data) =>
    apiFetch("/api/doctors", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updateDoctor = (id, data) =>
    apiFetch(`/api/doctors/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

export const verifyDoctor = (id, status) =>
    apiFetch(`/api/doctors/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });

// ─── APPOINTMENTS ─────────────────────────────
export const getAllAppointments = () => apiFetch("/api/appointments");

export const getPatientAppointments = (patientId) =>
    apiFetch(`/api/appointments/patient/${patientId}`);

export const getDoctorAppointments = (doctorId) =>
    apiFetch(`/api/appointments/doctor/${doctorId}`);

export const createAppointment = (data) =>
    apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updateAppointment = (id, data) =>
    apiFetch(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

export const cancelAppointment = (id) =>
    apiFetch(`/api/appointments/${id}`, { method: "DELETE" });

// Convenience wrappers
export const updateAppointmentStatus = (id, appointmentStatus) =>
    updateAppointment(id, { appointmentStatus });

export const rescheduleAppointment = (id, data) =>
    updateAppointment(id, {
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        appointmentStatus: "pending",
    });

// ─── REVIEWS ──────────────────────────────────
export const getAllReviews = () => apiFetch("/api/reviews");

export const getDoctorReviews = (doctorId) =>
    apiFetch(`/api/reviews/doctor/${doctorId}`);

export const getPatientReviews = (patientId) =>
    apiFetch(`/api/reviews/patient/${patientId}`);

export const createReview = (data) =>
    apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updateReview = (id, data) =>
    apiFetch(`/api/reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

export const deleteReview = (id) =>
    apiFetch(`/api/reviews/${id}`, { method: "DELETE" });

// ─── PAYMENTS ─────────────────────────────────
export const getAllPayments = () => apiFetch("/api/payments");

export const getPatientPayments = (patientId) =>
    apiFetch(`/api/payments/patient/${patientId}`);

export const createPayment = (data) =>
    apiFetch("/api/payments", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const createPaymentIntent = (data) =>
    apiFetch("/api/stripe/create-payment-intent", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const confirmPayment = (data) =>
    apiFetch("/api/stripe/confirm-payment", {
        method: "POST",
        body: JSON.stringify(data),
    });

// ─── PRESCRIPTIONS ────────────────────────────
export const getPrescriptionByAppointment = (appointmentId) =>
    apiFetch(`/api/prescriptions/appointment/${appointmentId}`);

export const getPatientPrescriptions = (patientId) =>
    apiFetch(`/api/prescriptions/patient/${patientId}`);

export const createPrescription = (data) =>
    apiFetch("/api/prescriptions", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updatePrescription = (id, data) =>
    apiFetch(`/api/prescriptions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

// ─── STATS & ANALYTICS ────────────────────────
export const getStats = () => apiFetch("/api/stats");

export const getAnalytics = () => apiFetch("/api/admin/analytics");
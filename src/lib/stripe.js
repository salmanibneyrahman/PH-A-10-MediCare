"use client";

import { loadStripe } from "@stripe/stripe-js";

// loadStripe must be called OUTSIDE any component so the Stripe object
// isn't recreated on every render.
let stripePromise;

export function getStripe() {
    if (!stripePromise) {
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!key) {
            console.error(
                "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing from .env.local"
            );
            return null;
        }
        stripePromise = loadStripe(key);
    }
    return stripePromise;
}

// Dark theme matching the MediCare glass UI.
export const stripeAppearance = {
    theme: "night",
    variables: {
        colorPrimary: "#06b6d4",
        colorBackground: "#0d1b2a",
        colorText: "#e2e8f0",
        colorTextSecondary: "#94a3b8",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "12px",
        spacingUnit: "4px",
    },
    rules: {
        ".Input": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "none",
        },
        ".Input:focus": {
            border: "1px solid #06b6d4",
            boxShadow: "0 0 0 1px rgba(6, 182, 212, 0.3)",
        },
        ".Label": {
            color: "#94a3b8",
            fontSize: "13px",
        },
        ".Tab": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        ".Tab--selected": {
            backgroundColor: "rgba(6, 182, 212, 0.1)",
            border: "1px solid rgba(6, 182, 212, 0.4)",
        },
        // The phone-country / autofill dropdown renders inside Stripe's
        // iframe and defaults to a light palette, which was unreadable
        // on the dark modal.
        ".Dropdown": {
            backgroundColor: "#0d1b2a",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
        },
        ".DropdownItem": {
            backgroundColor: "transparent",
            color: "#e2e8f0",
        },
        ".DropdownItem--highlight": {
            backgroundColor: "rgba(6, 182, 212, 0.15)",
            color: "#22d3ee",
        },
        ".PickerItem": {
            backgroundColor: "#0d1b2a",
            color: "#e2e8f0",
            border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        ".PickerItem--selected": {
            backgroundColor: "rgba(6, 182, 212, 0.15)",
            color: "#22d3ee",
        },
        ".PickerItem--highlight": {
            backgroundColor: "rgba(255, 255, 255, 0.06)",
        },
        ".Block": {
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
        },
    },
};
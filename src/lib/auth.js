import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt, bearer } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI);
// await client.connect();
const db = client.db("MediCare");

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "patient",
      },
      phone: {
        type: "string",
        required: false,
      },
      gender: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "active",
      },
      photo: {
        type: "string",
        required: false,
      },
    },
  },
  // Required by the Express backend: it verifies tokens with jwtVerify()
  // against /api/auth/jwks. Without this plugin there is no JWKS endpoint
  // and the session token is an opaque string, not a JWT — which is what
  // caused "Invalid Compact JWS".
  plugins: [jwt(), bearer()],
});
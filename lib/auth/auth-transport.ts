import axios from "axios";

// Auth lifecycle requests never recurse through the protected-request interceptor.
export const authTransport = axios.create({ baseURL: "/api", withCredentials: true, timeout: 45_000, headers: { "Content-Type": "application/json" } });

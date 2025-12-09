import api from "./apiClient";

export const registerUserApi = async (data) => {
  // data = { name, email, password }
  const res = await api.post("/api/auth/register", data);
  return res.data; // { message, user, token }
};

export const loginUserApi = async (data) => {
  // data = { email, password }
  const res = await api.post("/api/auth/login", data);
  return res.data; // { message, user, token }
};

export const getCurrentUserApi = async () => {
  const res = await api.get("/api/auth/me");
  return res.data; // { user }
};

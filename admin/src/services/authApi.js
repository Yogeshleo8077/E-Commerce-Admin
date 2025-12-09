import api from "./apiClient";

export const loginAdminApi = async (data) => {
  const res = await api.post("/api/auth/login", data);
  return res.data; // { message, user, token }
};

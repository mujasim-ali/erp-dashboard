import API from "./axios";

export const getDashboardStats = () =>
  API.get("/dashboard/stats");
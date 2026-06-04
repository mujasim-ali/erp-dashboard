import API from "./axios";

export const getInventory = () =>
  API.get("/inventory");

export const createInventory = (data) =>
  API.post("/inventory", data);

export const updateInventory = (id, data) =>
  API.put(`/inventory/${id}`, data);

export const deleteInventory = (id) =>
  API.delete(`/inventory/${id}`);
import axios from "axios";

const AUTH_URL =
  "https://ungodly-abstract-saddling.ngrok-free.dev/api/auth";

export const loginUser = async (data) => {
  return axios.post(`${AUTH_URL}/login`, data);
};

export const signupUser = async (data) => {
  return axios.post(`${AUTH_URL}/signup`, data);
};
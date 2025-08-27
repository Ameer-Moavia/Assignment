import axios from "axios";
import { useUserStore } from "../stores/useUserStore";

export const api = () => {
  const { user } = useUserStore.getState();
  const token = user?.token || localStorage.getItem("token");

  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
};
export const apiFormData = () => {
  const { user } = useUserStore.getState();
  const token = user?.token || localStorage.getItem("token");

  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  });
};
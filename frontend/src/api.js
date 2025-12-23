import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend URL
  withCredentials: true, // send cookies
});

export default api;

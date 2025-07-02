import axios, {AxiosInstance} from "axios";
import.meta.env.VITE_DJANGO_URL; 

//for calls that don't require JWT authentication.
const axiosPublicInstance: AxiosInstance = axios.create({
  // baseURL: "http://localhost:8080/api/",
  baseURL: `http://${import.meta.env.VITE_DJANGO_URL}/api/`,
  headers: { "Content-Type": "application/json" },
});

export default axiosPublicInstance;


import axios, {AxiosInstance} from "axios";

//for calls that don't require JWT authentication.
const axiosPublicInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/",
  headers: { "Content-Type": "application/json" },
});

export default axiosPublicInstance;
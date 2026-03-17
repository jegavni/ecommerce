import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const AxiosInterceptor = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          // ❌ cookie invalid / expired
          navigate("/login", { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return () => API.interceptors.response.eject(interceptor);
  }, [navigate]);

  return children;
};

export default AxiosInterceptor;
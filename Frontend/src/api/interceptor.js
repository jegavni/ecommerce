import { store } from "../Redux/store";
import { logoutUser } from "../Redux/slices/userSlice";

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logoutUser());

      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
import { useDispatch } from "react-redux";
import { login, register, getMe } from "../api/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();

  async function handleRegister({ fullName, email, password }) {
    dispatch(setLoading(true));
    try {
      const response = await register({ username: fullName, email, password });
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Registration failed"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    dispatch(setLoading(true));
    try {
      const response = await login(email, password);

      dispatch(setUser(response.user));
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Login failed"));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    dispatch(setLoading(true));
    try {
      const response = await getMe();
      dispatch(setUser(response.user));
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Can't fetch user data"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  return { handleRegister, handleLogin, handleGetMe };
}

import { RouterProvider } from "react-router";
import { router } from "./app.routes";
import { useAuth } from "../features/auth/hook/useAuth";
import { useEffect } from "react";

const App = () => {
  const { handleGetMe } = useAuth();

  useEffect(() => {
    handleGetMe().catch(() => {});
  }, []);
  return <RouterProvider router={router} />;
};

export default App;

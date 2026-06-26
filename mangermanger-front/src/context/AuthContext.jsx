import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setRole(savedRole);
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await API.post("/login/", { username, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("role", data.role);
    setUser(data.user);
    setRole(data.role);
    return data; // retourner les données pour que ClientLogin puisse lire le rôle
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Simple polling hook to fetch notifications periodically
export function useNotifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchNotifs = async () => {
      if (!user) return;
      try {
        const r = await API.get("/notifications/");
        if (mounted) setNotifications(r.data.results || r.data);
      } catch (e) {}
    };
    fetchNotifs();
    const t = setInterval(fetchNotifs, 15000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [user]);

  return { notifications };
}

export const useAuth = () => useContext(AuthContext);

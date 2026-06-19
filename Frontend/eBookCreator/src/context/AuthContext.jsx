import React, { createContext, useState, useEffect, useContext } from "react";

// Create context
const AuthContext = createContext();

const API_BASE = "http://localhost:5000/api/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user profile on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token expired or invalid
          localStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error validating user token:", error);
        // Clear token on server/network errors to prevent infinite loops
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register action
  const register = async (username, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Save token & user state
      localStorage.setItem("token", data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
      });
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error("Register request failed:", error);
      throw error;
    }
  };

  // Login action
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token & user state
      localStorage.setItem("token", data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
      });
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error("Login request failed:", error);
      throw error;
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

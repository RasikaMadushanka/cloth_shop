import React, { useState } from "react";
import { adminApi } from "../api/Service/apiService";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await adminApi.login({
        username,
        password,
      });

      const user = res.data;

      // Save user in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "SUPER_ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/inventory");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/cloth-icon.png"
            alt="Logo"
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6">
          Login
        </h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;
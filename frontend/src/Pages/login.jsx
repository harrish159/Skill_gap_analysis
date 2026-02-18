import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // ⛔ stop page refresh

    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      console.log("--> Login Response Data:", res.data);
      console.log("--> Raw Role from Backend:", res.data.user?.role);

      // Save token & role & user details
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("role", res.data.user?.role);
      sessionStorage.setItem("user", JSON.stringify(res.data.user)); // For ProtectedRoute
      sessionStorage.setItem("userId", res.data.user?.id);   // For simplified access in other components

      // Redirect based on role (normalize to uppercase)
      const role = (res.data.user?.role || "").toUpperCase();
      console.log("--> Normalized Role for Navigation:", role);

      if (role === "ADMIN") {
        console.log("--> Navigating to ADMIN Dashboard");
        navigate("/admin/dashboard");
      }
      else if (role === "FACULTY") {
        console.log("--> Navigating to FACULTY Dashboard");
        navigate("/faculty/dashboard");
      }
      else if (role === "HOD") {
        console.log("--> Navigating to HOD Dashboard");
        navigate("/hod/dashboard");
      }
      else {
        console.error("--> Unknown Role:", role);
        alert(`Login successful but unknown role: ${role}`);
      }
    } catch (err) {
      alert("Login failed either Email or Password is incorrect");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h1>

        {/* ✅ FORM START */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mb-4"
          >
            Login
          </button>
        </form>
        {/* ✅ FORM END */}

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t"></div>
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t"></div>
        </div>

        {/* Continue with Google */}
        <button className="w-full border py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium">
            Continue with Google
          </span>
        </button>
      </div>
    </div>
  );
};

export default Login;

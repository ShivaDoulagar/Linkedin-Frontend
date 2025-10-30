import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Auth.css";

const Login = () => {
  useEffect(() => {
    AOS.init({
      duration: 300,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "https://linkedin-backend-kzfo.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.name);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" data-aos="fade-up" data-aos-delay="100">
        <h1 data-aos="fade-down" data-aos-delay="200">
          LinkedIn{" "}
        </h1>
        <h2 data-aos="fade-down" data-aos-delay="300">
          Sign In
        </h2>
        {error && (
          <div className="error" data-aos="fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} data-aos="fade-up" data-aos-delay="400">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
        </form>

        <p className="switch-auth">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;

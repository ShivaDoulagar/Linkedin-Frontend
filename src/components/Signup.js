import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "./Auth.css";
import "aos/dist/aos.css";

const Signup = () => {
  useEffect(() => {
    AOS.init({
      duration: 300,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(
        "https://linkedin-backend-kzfo.onrender.com/api/auth/signup",
        {
          name,
          email,
          password,
        }
      );

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" data-aos="fade-up">
        <h1 data-aos="fade-down" data-aos-delay="100">
          LinkedIn{" "}
        </h1>
        <h2 data-aos="fade-down" data-aos-delay="200">
          Sign Up
        </h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSignup} data-aos="fade-up">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
          <button type="submit">Sign Up</button>
        </form>

        <p className="switch-auth">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;

import React, { useState } from "react";
import {
    FaShieldAlt,
    FaEnvelope,
    FaLock,
    FaUser,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";
import "./Login.css";

function Login({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setMessage("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setMessage("Please fill all required fields.");
            return;
        }

        if (isSignUp) {
            if (!formData.name) {
                setMessage("Please enter your full name.");
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setMessage("Passwords do not match.");
                return;
            }

            setMessage("Account created successfully!");
            setTimeout(() => {
                setIsSignUp(false);
                setMessage("");
            }, 1000);

            return;
        }

        // Frontend login authentication
        const displayName = formData.name || formData.email.split("@")[0] || "Security Analyst";
        onLogin({
            name: displayName,
            email: formData.email || "analyst@cyberdefence.com"
        });
    };

    return (
        <div className="login-page">

            <div className="cyber-grid"></div>

            <div className="login-container">

                {/* Left Section */}
                <div className="login-info">
                    <div className="shield-icon">
                        <FaShieldAlt />
                    </div>

                    <h1>AI BASED</h1>
                    <h2>CYBER DEFENCE</h2>

                    <p>
                        Intelligent network monitoring and AI-powered
                        threat detection system.
                    </p>

                    <div className="security-status">
                        <span className="status-dot"></span>
                        System Protected
                    </div>
                </div>

                {/* Right Section */}
                <div className="login-box">

                    <div className="form-header">
                        <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
                        <p>
                            {isSignUp
                                ? "Create your Cyber Defence account"
                                : "Sign in to access your security dashboard"}
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="auth-toggle">
                        <button
                            className={!isSignUp ? "active" : ""}
                            onClick={() => {
                                setIsSignUp(false);
                                setMessage("");
                            }}
                            type="button"
                        >
                            Sign In
                        </button>

                        <button
                            className={isSignUp ? "active" : ""}
                            onClick={() => {
                                setIsSignUp(true);
                                setMessage("");
                            }}
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {isSignUp && (
                            <div className="input-group">
                                <FaUser />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <FaEnvelope />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <FaLock />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />

                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        {isSignUp && (
                            <div className="input-group">
                                <FaLock />

                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />

                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        )}

                        {!isSignUp && (
                            <div className="form-options">
                                <label>
                                    <input type="checkbox" />
                                    Remember me
                                </label>

                                <button type="button" className="forgot-btn">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {message && (
                            <div className="login-message">
                                {message}
                            </div>
                        )}

                        <button className="login-btn" type="submit">
                            {isSignUp ? "Create Account" : "Sign In"}
                        </button>

                    </form>

                    <div className="switch-text">
                        {isSignUp ? (
                            <>
                                Already have an account?
                                <button
                                    onClick={() => {
                                        setIsSignUp(false);
                                        setMessage("");
                                    }}
                                >
                                    Sign In
                                </button>
                            </>
                        ) : (
                            <>
                                Don't have an account?
                                <button
                                    onClick={() => {
                                        setIsSignUp(true);
                                        setMessage("");
                                    }}
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;
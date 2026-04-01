import React, { useState } from "react";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";

const Register = () => {
  const { handleRegister } = useAuth();
  const { loading, error } = useSelector((state) => state.auth);

  const [isRegistered, setIsRegistered] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!agreeTerms) {
      alert("Please agree to terms");
      return;
    }

    try {
      await handleRegister({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      // ✅ After success
      setIsRegistered(true);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ After registration success
  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#202020] text-white">
        <div className="bg-[#313131] p-8 rounded-xl text-center">
          <h2 className="text-2xl mb-4">📩 Verify Your Email</h2>
          <p className="text-gray-300">
            We have sent a verification link to your email.
          </p>
          <p className="text-gray-400 mt-2">
            Please check your inbox and verify your account.
          </p>

          <a
            href="/login"
            className="inline-block mt-6 px-4 py-2 bg-red-600 rounded-lg"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#202020] flex items-center justify-center p-4">
      {" "}
      <div className="w-full max-w-md">
        {" "}
        {/* Card */}{" "}
        <div className="bg-[#313131] backdrop-blur-xl border rounded-2xl shadow-2xl p-8">
          {" "}
          {/* Header */}{" "}
          <div className="text-center mb-8">
            {" "}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
              {" "}
              Create Account{" "}
            </h1>{" "}
            <p className="text-gray-300 text-sm">
              Join us and get started
            </p>{" "}
          </div>{" "}
          {/* Error Message */}{" "}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg">
              {" "}
              <p className="text-red-400 text-sm">{error}</p>{" "}
            </div>
          )}{" "}
          {/* Form */}{" "}
          <form onSubmit={handleSubmit} className="space-y-4">
            {" "}
            {/* Full Name Input */}{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {" "}
                Full Name{" "}
              </label>{" "}
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-slate-800/50 border border-red-900/30 focus:border-red-500 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                required
              />{" "}
            </div>{" "}
            {/* Email Input */}{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {" "}
                Email Address{" "}
              </label>{" "}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-slate-800/50 border border-red-900/30 focus:border-red-500 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                required
              />{" "}
            </div>{" "}
            {/* Password Input */}{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {" "}
                Password{" "}
              </label>{" "}
              <div className="relative">
                {" "}
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-red-900/30 focus:border-red-500 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  required
                />{" "}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {" "}
                  {showPassword ? "👁️" : "👁️‍🗨️"}{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* Confirm Password Input */}{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {" "}
                Confirm Password{" "}
              </label>{" "}
              <div className="relative">
                {" "}
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-red-900/30 focus:border-red-500 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  required
                />{" "}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {" "}
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* Terms Checkbox */}{" "}
            <div className="flex items-start gap-3 pt-2">
              {" "}
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 bg-slate-800 border border-red-900/30 rounded accent-red-600 cursor-pointer"
              />{" "}
              <label
                htmlFor="terms"
                className="text-sm text-gray-300 cursor-pointer"
              >
                {" "}
                I agree to the{" "}
                <a
                  href="#"
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  {" "}
                  Terms & Conditions{" "}
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  {" "}
                  Privacy Policy{" "}
                </a>{" "}
              </label>{" "}
            </div>{" "}
            {/* Submit Button */}{" "}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-900/50"
            >
              {" "}
              {loading ? "Creating Account..." : "Create Account"}{" "}
            </button>{" "}
          </form>{" "}
          {/* Login Link */}{" "}
          <div className="text-center mt-6">
            {" "}
            <p className="text-gray-300 text-sm">
              {" "}
              Already have an account?{" "}
              <a
                href="/login"
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                {" "}
                Sign in{" "}
              </a>{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

export default Register;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  const { handleLogin } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin({ email, password });
    navigate("/");
  };
  if(!loading && user) {
    navigate("/");
  }

  return (
    <div className="min-h-screen w-full bg-[#202020] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#313131] backdrop-blur-xl border rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-300 text-sm">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-slate-800/50 border border-red-900/30 focus:border-red-500 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-200">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-red-900/30 focus:border-red-500 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-7 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-900/50"
            >
              Sign In
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-4">
            <p className="text-gray-300 text-sm">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

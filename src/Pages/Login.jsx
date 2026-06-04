import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/amdox-logo.png";
import illustration from "../assets/login-illustration.png";
import { loginUser } from "../api/authApi";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await loginUser({
        email,
        password,
      });

      const data = res.data;

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));

        localStorage.setItem("token", data.token);

        navigate("/dashboard");
      }
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("RESPONSE:", err.response);
      console.log("DATA:", err.response?.data);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Server error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center px-4 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a] overflow-hidden">
      <div className="absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-blue-500/10 rounded-full blur-[120px] top-10 left-10"></div>
      <div className="absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-indigo-500/10 rounded-full blur-[120px] bottom-10 right-10"></div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl flex w-full max-w-5xl overflow-hidden">
        <div className="hidden md:flex w-1/2 items-center justify-center">
          <img
            src={illustration}
            alt=""
            className="w-full h-full object-cover p-6 opacity-90"
          />
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="" className="h-12 mb-2" />
            <h2 className="text-xl font-bold text-white">
              Login to Your Account
            </h2>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 text-white p-2 w-full mb-4 rounded border border-white/30"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/10 text-white p-2 w-full mb-4 rounded border border-white/30"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-600 text-white p-2 w-full rounded"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center mt-4 text-sm text-gray-300">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-400 cursor-pointer"
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

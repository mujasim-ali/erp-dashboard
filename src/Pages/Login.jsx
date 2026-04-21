import { useNavigate } from "react-router-dom";
import logo from "../assets/amdox-logo.png";
import illustration from "../assets/login-illustration.png";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex justify-center items-center px-4 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a]">
      {/* Glow Effects */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] top-10 left-10"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] bottom-10 right-10"></div>

      {/* Glass Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl flex w-full max-w-5xl overflow-hidden hover:shadow-blue-500/10 transition">
        {/* LEFT IMAGE */}
        <div className="hidden md:flex w-1/2 items-center justify-center">
          <img
            src={illustration}
            alt="Work Illustration"
            className="w-full h-full object-cover p-6 opacity-90"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Company Logo" className="h-12 mb-2" />
            <h2 className="text-xl font-bold text-white">
              Login to Your Account
            </h2>
          </div>

          <input
            type="email"
            placeholder="Email"
            className="bg-white/10 text-white placeholder-gray-300 border border-white/30 p-2 w-full mb-4 rounded focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            className="bg-white/10 text-white placeholder-gray-300 border border-white/30 p-2 w-full mb-4 rounded focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
          />

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-2 w-full rounded-lg hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
          >
            Login
          </button>

          <p className="text-center mt-4 text-sm text-gray-300">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-400 cursor-pointer hover:underline"
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

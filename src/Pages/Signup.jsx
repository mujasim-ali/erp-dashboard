import { useNavigate } from "react-router-dom";
import logo from "../assets/amdox-logo.png";
import illustration from "../assets/login-illustration.png";

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex justify-center items-center px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Glow Effects */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl bottom-10 right-10"></div>

      {/* Glass Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg flex w-full max-w-5xl overflow-hidden">
        {/* LEFT IMAGE */}
        <div className="hidden md:flex w-1/2 items-center justify-center">
          <img
            src={illustration}
            alt="Work Illustration"
            className="w-full h-full object-contain opacity-90"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Company Logo" className="h-12 mb-2" />
            <h2 className="text-xl font-bold text-white">
              Create Your Account
            </h2>
          </div>

          <input
            type="text"
            placeholder="Name"
            className="bg-white/20 text-white placeholder-gray-300 border border-white/30 p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="email"
            placeholder="Email"
            className="bg-white/20 text-white placeholder-gray-300 border border-white/30 p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            className="bg-white/20 text-white placeholder-gray-300 border border-white/30 p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Confirm Password */}
          <input
            type="password"
            placeholder="Confirm Password"
            className="bg-white/20 text-white placeholder-gray-300 border border-white/30 p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700 transition shadow-md"
          >
            Sign Up
          </button>

          <p className="text-center mt-4 text-sm text-gray-300">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-blue-400 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

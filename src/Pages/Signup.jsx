import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 flex justify-center items-center bg-gray-100">
      
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-xl mb-4 text-center font-bold">Sign Up</h2>

        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700 transition"
        >
          Sign Up
        </button>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>

    </div>
  );
};

export default Signup;
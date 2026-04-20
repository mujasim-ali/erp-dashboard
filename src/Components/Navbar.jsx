import { useNavigate } from "react-router-dom";

const Navbar = ({ title, setOpen }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden text-xl"
        >
          ☰
        </button>

        <h1 className="font-bold text-lg sm:text-xl">{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <p className="text-gray-600 hidden sm:block">Hi, Admin</p>

        <button
          onClick={() => navigate("/")}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
import { Link } from "react-router-dom";

const Sidebar = ({ open, setOpen }) => {
  return (
    <div
      className={`bg-gray-900 text-white p-5 fixed top-0 left-0 h-screen lg:min-h-screen w-60 transform 
      ${open ? "translate-x-0" : "-translate-x-full"} 
      transition-transform duration-300 lg:translate-x-0 lg:static z-50`}
    >
      {/* Close button (mobile only) */}
      <button
        onClick={() => setOpen(false)}
        className="lg:hidden mb-4 text-right w-full"
      >
        ❌
      </button>

      <h2 className="text-xl font-bold mb-6">Amdox ERP System</h2>

      <ul className="space-y-4">
        <li>
          <Link to="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/employees" onClick={() => setOpen(false)}>
            Employees
          </Link>
        </li>
        <li>
          <Link to="/projects" onClick={() => setOpen(false)}>
            Projects
          </Link>
        </li>
        <li>
          <Link to="/inventory" onClick={() => setOpen(false)}>
            Inventory
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

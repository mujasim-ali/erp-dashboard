import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, title }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">

      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1 min-h-screen bg-gray-100">
        <Navbar title={title} setOpen={setOpen} />

        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>

    </div>
  );
};

export default Layout;
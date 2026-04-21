import { useState } from "react";
import Layout from "../Components/Layout";

const Employees = () => {
  const [search, setSearch] = useState("");

  const [employees, setEmployees] = useState([
    { name: "Ali", email: "ali@gmail.com", role: "Manager" },
    { name: "Rahul", email: "rahul@gmail.com", role: "Developer" },
    { name: "Sara", email: "sara@gmail.com", role: "HR" },
    { name: "John", email: "john@gmail.com", role: "Designer" },
  ]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const handleAddEmployee = () => {
    if (!name || !email || !role) return;

    const newEmployee = { name, email, role };
    setEmployees([...employees, newEmployee]);

    //clear inputs
    setName("");
    setEmail("");
    setRole("");
  };

  const filteredEmployees = employees.filter((emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout title="Employees">
      <div className="flex flex-col gap-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 mb-4 w-full sm:w-60 rounded"
        />

        {/* Table */}
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.email} className="border-b hover:bg-gray-100">
                  <td className="p-2">{emp.name}</td>
                  <td className="p-2">{emp.email}</td>
                  <td className="p-2">{emp.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg mb-4">Add Employee</h2>

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mb-2 w-full sm:w-auto"
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 mb-2 w-full sm:w-auto"
          />
          <input
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 mb-2 w-full sm:w-auto"
          />

          <button
            onClick={handleAddEmployee}
            className="bg-blue-600 text-white p-2"
          >
            Add
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Employees;

import { useState } from "react";
import Layout from "../Components/Layout";

const Employees = () => {
  const [search, setSearch] = useState("");

  const employees = [
    { name: "Ali", email: "ali@gmail.com", role: "Manager" },
    { name: "Rahul", email: "rahul@gmail.com", role: "Developer" },
    { name: "Sara", email: "sara@gmail.com", role: "HR" },
    { name: "John", email: "john@gmail.com", role: "Designer" },
  ];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
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
              {filteredEmployees.map((emp, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
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

          <input placeholder="Name" className="border p-2 mb-2 w-full sm:w-auto" />
          <input placeholder="Email" className="border p-2 mb-2 w-full sm:w-auto" />
          <input placeholder="Role" className="border p-2 mb-2 w-full sm:w-auto" />

          <button className="bg-blue-600 text-white p-2">Add</button>
        </div>

      </div>
    </Layout>
  );
};

export default Employees;
import { useState } from "react";
import Layout from "../Components/Layout";

const Projects = () => {
  //  1. Projects state
  const [projects, setProjects] = useState([
    { name: "ERP System", manager: "Ali", status: "In Progress" },
    { name: "Website", manager: "Rahul", status: "Completed" },
    { name: "Design", manager: "John", status: "Completed" },
  ]);

  //  2. Form state
  const [name, setName] = useState("");
  const [manager, setManager] = useState("");
  const [status, setStatus] = useState("");

  //  3. Add function
  const handleAddProject = () => {
    if (!name || !manager || !status) return;

    const newProject = { name, manager, status };

    setProjects([...projects, newProject]);

    // Clear inputs
    setName("");
    setManager("");
    setStatus("");
  };

  return (
    <Layout title="Projects">
      <div className="flex flex-col gap-6">

        {/* Table */}
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Project Name</th>
                <th className="p-2">Manager</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="p-2">{project.name}</td>
                  <td className="p-2">{project.manager}</td>
                  <td className="p-2">
                    <span
                      className={
                        project.status === "Completed"
                          ? "bg-green-100 text-green-700 px-2 py-1 rounded"
                          : "bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
                      }
                    >
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg mb-4">Add Project</h2>

          <input
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mb-2 w-full sm:w-auto"
          />

          <input
            placeholder="Manager"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            className="border p-2 mb-2 w-full sm:w-auto"
          />

          <input
            placeholder="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 mb-2 w-full sm:w-auto"
          />

          <button
            onClick={handleAddProject}
            className="bg-blue-600 text-white p-2"
          >
            Add
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default Projects;
import { useState } from "react";
import Layout from "../Components/Layout";
import Modal from "../Components/Modal";
import ConfirmModal from "../Components/ConfirmModal";
import ProjectForm from "../Components/ProjectForm";

const Projects = () => {
  const [projects, setProjects] = useState([
    { id: 1, name: "ERP System", manager: "Ali", status: "In Progress" },
    { id: 2, name: "Website", manager: "Rahul", status: "Completed" },
    { id: 3, name: "Design", manager: "John", status: "Completed" },
  ]);

  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // ADD + EDIT
  const handleSave = (project) => {
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? project : p))
      );
    } else {
      setProjects((prev) => [...prev, project]);
    }

    setOpen(false);
    setEditingProject(null);
  };

  // DELETE
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    setProjects((prev) =>
      prev.filter((p) => p.id !== selectedId)
    );
    setConfirmOpen(false);
    setSelectedId(null);
  };

  // EDIT
  const handleEdit = (project) => {
    setEditingProject(project);
    setOpen(true);
  };

  return (
    <Layout title="Projects">
      <div className="flex flex-col gap-6">

        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <h1 className="text-lg sm:text-xl font-semibold">
            Projects
          </h1>

          <button
            onClick={() => {
              setEditingProject(null);
              setOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Project
          </button>
        </div>

        {/* Table */}
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Project Name</th>
                <th className="p-2">Manager</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b hover:bg-gray-100">

                  <td className="p-2">{project.name}</td>
                  <td className="p-2">{project.manager}</td>

                  <td className="p-2">
                    <span
                      className={
                        project.status === "Completed"
                          ? "bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                          : "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm"
                      }
                    >
                      {project.status}
                    </span>
                  </td>

                  <td className="p-2 flex flex-col sm:flex-row gap-2">

                    <button
                      onClick={() => handleEdit(project)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteClick(project.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {open && (
          <Modal onClose={() => setOpen(false)}>
            <ProjectForm
              onSave={handleSave}
              editingProject={editingProject}
            />
          </Modal>
        )}

        {/* Confirm Delete */}
        {confirmOpen && (
          <ConfirmModal
            onConfirm={confirmDelete}
            onCancel={() => setConfirmOpen(false)}
          />
        )}

      </div>
    </Layout>
  );
};

export default Projects;
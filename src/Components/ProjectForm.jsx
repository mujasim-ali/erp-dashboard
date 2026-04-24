import { useState, useEffect } from "react";

const ProjectForm = ({ onSave, editingProject }) => {
  const [form, setForm] = useState({
    name: "",
    manager: "",
    status: "",
  });

  useEffect(() => {
    if (editingProject) {
      setForm(editingProject);
    }
  }, [editingProject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.manager || !form.status) return;

    onSave({
      id: editingProject ? editingProject.id : Date.now(),
      ...form,
    });

    setForm({ name: "", manager: "", status: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      <h2 className="text-lg sm:text-xl font-semibold">
        {editingProject ? "Edit Project" : "Add Project"}
      </h2>

      <input
        placeholder="Project Name"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
        className="border p-3 rounded w-full"
      />

      <input
        placeholder="Manager"
        value={form.manager}
        onChange={(e) =>
          setForm({ ...form, manager: e.target.value })
        }
        className="border p-3 rounded w-full"
      />

      <select
        value={form.status}
        onChange={(e) =>
          setForm({ ...form, status: e.target.value })
        }
        className="border p-3 rounded w-full"
      >
        <option value="">Select Status</option>
        <option value="Completed">Completed</option>
        <option value="In Progress">In Progress</option>
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white py-3 rounded w-full hover:bg-blue-700"
      >
        {editingProject ? "Update Project" : "Add Project"}
      </button>
    </form>
  );
};

export default ProjectForm;
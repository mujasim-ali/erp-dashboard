import { useState, useEffect } from "react";

const EmployeeForm = ({ onSave, editingEmployee }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (editingEmployee) {
      setForm(editingEmployee);
    }
  }, [editingEmployee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role) return;

    onSave({
      id: editingEmployee ? editingEmployee.id : Date.now(),
      ...form,
    });

    setForm({ name: "", email: "", role: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      <h2 className="text-lg sm:text-xl font-semibold">
        {editingEmployee ? "Edit Employee" : "Add Employee"}
      </h2>

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
        className="border p-3 rounded w-full"
      />

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
        className="border p-3 rounded w-full"
      />

      <input
        placeholder="Role"
        value={form.role}
        onChange={(e) =>
          setForm({ ...form, role: e.target.value })
        }
        className="border p-3 rounded w-full"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white py-3 rounded w-full hover:bg-blue-700"
      >
        {editingEmployee ? "Update Employee" : "Add Employee"}
      </button>
    </form>
  );
};

export default EmployeeForm;
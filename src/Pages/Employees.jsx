import { useState } from "react";
import Layout from "../Components/Layout";
import DataTable from "../Components/DataTable";
import EmployeeForm from "../Components/EmployeeForm";
import Modal from "../Components/Modal";
import ConfirmModal from "../Components/ConfirmModal";

const Employees = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: "Ali", email: "ali@gmail.com", role: "Manager" },
    { id: 2, name: "Rahul", email: "rahul@gmail.com", role: "Developer" },
  ]);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // ADD + EDIT
  const handleSave = (emp) => {
    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === emp.id ? emp : e))
      );
    } else {
      setEmployees((prev) => [...prev, emp]);
    }

    setOpen(false);
    setEditingEmployee(null);
  };

  // DELETE (open popup)
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  // DELETE confirm
  const confirmDelete = () => {
    setEmployees((prev) =>
      prev.filter((emp) => emp.id !== selectedId)
    );
    setConfirmOpen(false);
    setSelectedId(null);
  };

  // EDIT
  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setOpen(true);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Employees">
      <div className="flex flex-col gap-6">

        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full sm:w-60"
          />

          <button
            onClick={() => {
              setEditingEmployee(null);
              setOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Employee
          </button>
        </div>

        {/* Table */}
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <DataTable
            data={filteredEmployees}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </div>

        {/* Add/Edit Modal */}
        {open && (
          <Modal onClose={() => setOpen(false)}>
            <EmployeeForm
              onSave={handleSave}
              editingEmployee={editingEmployee}
            />
          </Modal>
        )}

        {/* Confirm Delete Modal */}
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

export default Employees;
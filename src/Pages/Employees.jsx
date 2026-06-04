import { useState } from "react";
import Layout from "../Components/Layout";
import DataTable from "../Components/DataTable";
import EmployeeForm from "../Components/EmployeeForm";
import Modal from "../Components/Modal";
import ConfirmModal from "../Components/ConfirmModal";
import { useEffect } from "react";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employeeApi";

const Employees = () => {
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();

      setEmployees(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ADD + EDIT
  const handleSave = async (emp) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee._id, emp);
      } else {
        await createEmployee(emp);
      }

      fetchEmployees();

      setOpen(false);
      setEditingEmployee(null);
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE (open popup)
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  // DELETE confirm
  const confirmDelete = async () => {
    try {
      await deleteEmployee(selectedId);

      fetchEmployees();

      setConfirmOpen(false);
      setSelectedId(null);
    } catch (err) {
      console.log(err);
    }
  };

  // EDIT
  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setOpen(true);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()),
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

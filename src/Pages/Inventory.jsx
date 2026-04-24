import { useState } from "react";
import Layout from "../Components/Layout";
import Modal from "../Components/Modal";
import ConfirmModal from "../Components/ConfirmModal";
import InventoryForm from "../Components/InventoryForm";

const Inventory = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Laptop", quantity: 10, status: "Available" },
    { id: 2, name: "Mouse", quantity: 50, status: "Available" },
    { id: 3, name: "Keyboard", quantity: 60, status: "Available" },
    { id: 4, name: "Monitor", quantity: 0, status: "Not Available" },
  ]);

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // ADD + EDIT
  const handleSaveItem = (item) => {
    if (editingItem) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    } else {
      setItems((prev) => [...prev, item]);
    }

    setOpen(false);
    setEditingItem(null);
  };

  // DELETE
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    setItems((prev) => prev.filter((item) => item.id !== selectedId));
    setConfirmOpen(false);
    setSelectedId(null);
  };

  // EDIT
  const handleEdit = (item) => {
    setEditingItem(item);
    setOpen(true);
  };

  return (
    <Layout title="Inventory">
      <div className="flex flex-col gap-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <h1 className="text-lg sm:text-xl font-semibold">Inventory</h1>

          <button
            onClick={() => {
              setEditingItem(null);
              setOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Item
          </button>
        </div>

        {/* Table */}
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Item Name</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-100">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.quantity}</td>

                  <td className="p-2">
                    <span
                      className={
                        item.status === "Available"
                          ? "bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                          : "bg-red-100 text-red-700 px-2 py-1 rounded text-sm"
                      }
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteClick(item.id)}
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

        {/* Modal (Add/Edit) */}
        {open && (
          <Modal onClose={() => setOpen(false)}>
            <InventoryForm onSave={handleSaveItem} editingItem={editingItem} />
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

export default Inventory;

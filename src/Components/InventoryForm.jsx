import { useState, useEffect } from "react";

const InventoryForm = ({ onSave, editingItem }) => {
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    status: "",
  });

  useEffect(() => {
    if (editingItem) {
      setForm(editingItem);
    }
  }, [editingItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.status) return;

    onSave({
      id: editingItem ? editingItem.id : Date.now(),
      ...form,
    });

    setForm({ name: "", quantity: "", status: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg sm:text-xl font-semibold">
        {editingItem ? "Edit Item" : "Add Item"}
      </h2>

      <input
        placeholder="Item Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="border p-3 rounded w-full"
      />

      <input
        placeholder="Quantity"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        className="border p-3 rounded w-full"
      />

      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        className="border p-3 rounded w-full"
      >
        <option value="">Select Status</option>
        <option value="Available">Available</option>
        <option value="Not Available">Not Available</option>
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white py-3 rounded w-full hover:bg-blue-700"
      >
        {editingItem ? "Update Item" : "Add Item"}
      </button>
    </form>
  );
};

export default InventoryForm;

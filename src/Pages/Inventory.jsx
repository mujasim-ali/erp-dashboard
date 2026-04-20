import Layout from "../Components/Layout";

const Inventory = () => {
  const items = [
    { name: "Laptop", quantity: 10, status: "Available" },
    { name: "Mouse", quantity: 50, status: "Available" },
    { name: "Keyboard", quantity: 60, status: "Available" },
    { name: "Monitor", quantity: 0, status: "Not Available" },
  ];

  return (
    <Layout title="Inventory">
      <div className="flex flex-col gap-6">

        {/* Table */}
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Item Name</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">
                    <span
                      className={
                        item.status === "Available"
                          ? "bg-green-100 text-green-700 px-2 py-1 rounded"
                          : "bg-red-100 text-red-700 px-2 py-1 rounded"
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg mb-4">Add Item</h2>

          <input placeholder="Item Name" className="border p-2 mb-2 w-full sm:w-auto" />
          <input placeholder="Quantity" className="border p-2 mb-2 w-full sm:w-auto" />
          <input placeholder="Status" className="border p-2 mb-2 w-full sm:w-auto" />

          <button className="bg-blue-600 text-white p-2">Add</button>
        </div>

      </div>
    </Layout>
  );
};

export default Inventory;
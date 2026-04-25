const DataTable = ({ data, onEdit, onDelete }) => {
  return (
    <table className="w-full sm:min-w-[500px]">
      <thead>
        <tr className="text-left border-b">
          <th className="p-2">Name</th>
          <th className="p-2">Email</th>
          <th className="p-2">Role</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>

      <tbody>
        {data.map((emp) => (
          <tr key={emp.id} className="border-b hover:bg-gray-100">
            <td className="p-2">{emp.name}</td>
            <td className="p-2">{emp.email}</td>
            <td className="p-2">{emp.role}</td>

            <td className="p-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onEdit(emp)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(emp.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
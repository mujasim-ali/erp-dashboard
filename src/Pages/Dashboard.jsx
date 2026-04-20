import Card from "../Components/Card";
import Layout from "../Components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const data = [
    { name: "Jan", projects: 4 },
    { name: "Feb", projects: 6 },
    { name: "Mar", projects: 8 },
    { name: "Apr", projects: 5 },
  ];

  return (
    <Layout title="Dashboard">
      <div className="flex flex-col gap-6">
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Total Employees" value="50" />
          <Card title="Total Projects" value="12" />
          <Card title="Inventory Items" value="120" />
        </div>

        {/* Chart */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg mb-4">Project Overview</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="projects" fill="#111827" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

import Card from "../Components/Card";
import Layout from "../Components/Layout";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const barData = [
    { name: "Jan", projects: 4 },
    { name: "Feb", projects: 6 },
    { name: "Mar", projects: 8 },
    { name: "Apr", projects: 5 },
  ];

  const pieData = [
    { name: "Completed", value: 7 },
    { name: "In Progress", value: 5 },
  ];

  const COLORS = ["#16a34a", "#f59e0b"];

  return (
    <Layout title="Dashboard">
      <div className="flex flex-col gap-6">
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card title="Total Employees" value="50" />
          <Card title="Total Projects" value="12" />
          <Card title="Inventory Items" value="120" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white p-4 sm:p-5 rounded-xl shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-4">
              Project Overview
            </h2>

            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="projects"
                    fill="#111827"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-4 sm:p-5 rounded-xl shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-4">
              Project Status
            </h2>

            <div className="w-full h-[250px] sm:h-[300px] flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={90} label>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

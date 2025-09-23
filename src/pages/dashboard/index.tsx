import {
  Package,
  Box,
  CheckCircle,
  BarChart3
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";

const getStats = (t: any) => [
  {
    title: t('dashboard.produced'),
    value: "12,540",
    change: "+12%",
    icon: <Package size={28} />,
    color: "bg-blue-500",
  },
  {
    title: t('dashboard.passedQC'),
    value: "11,720",
    change: "+9%",
    icon: <CheckCircle size={28} />,
    color: "bg-green-500",
  },
  {
    title: t('dashboard.returned'),
    value: "820",
    change: "-3%",
    icon: <BarChart3 size={28} />,
    color: "bg-red-500",
  },
  {
    title: t('dashboard.warehouseStock'),
    value: "8,310",
    change: "+4%",
    icon: <Box size={28} />,
    color: "bg-yellow-500",
  },
];

const productionData = [
  { oy: "Yan", ishlabChiqarilgan: 4000, qaytarilgan: 240 },
  { oy: "Fev", ishlabChiqarilgan: 4200, qaytarilgan: 260 },
  { oy: "Mar", ishlabChiqarilgan: 4600, qaytarilgan: 180 },
  { oy: "Apr", ishlabChiqarilgan: 4800, qaytarilgan: 200 },
  { oy: "May", ishlabChiqarilgan: 5000, qaytarilgan: 300 },
  { oy: "Iyun", ishlabChiqarilgan: 5300, qaytarilgan: 280 },
];

const qcData = [
  { oy: "Yan", otgan: 3900, otmagan: 1500 },
  { oy: "Fev", otgan: 4000, otmagan: 1120 },
  { oy: "Mar", otgan: 4200, otmagan: 1110 },
  { oy: "Apr", otgan: 4500, otmagan: 1150 },
  { oy: "May", otgan: 4700, otmagan: 1130 },
  { oy: "Iyun", otgan: 4900, otmagan: 190 },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const stats = getStats(t);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <BarChart3 size={30} className="text-blue-500" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-500 text-base">
              {t('dashboard.subtitle')}
            </p>
          </div>
        </div>

        {/* Statistik kartalar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          {stats.map((item) => (
            <div
              key={item.title}
              className="relative bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-gray-500 text-sm font-medium mb-1">
                    {item.title}
                  </h2>
                  <p className="text-3xl font-bold text-gray-800 mb-2">
                    {item.value}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${item.change.startsWith("+")
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                      }`}
                  >
                    {item.change} o‘tgan oyga nisbatan
                  </span>
                </div>
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-lg ${item.color} group-hover:scale-110 transition-transform`}
                >
                  {item.icon}
                </div>
              </div>
              <div className="absolute bottom-2 right-4 opacity-10 text-6xl">
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Grafiklar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ishlab chiqarish grafik */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-7 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center gap-2">
              <BarChart3 size={22} className="text-blue-400" /> Ishlab chiqarish
              statistikasi
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="oy" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ishlabChiqarilgan"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Ishlab chiqarilgan"
                  />
                  <Line
                    type="monotone"
                    dataKey="qaytarilgan"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Qaytarilgan"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* QC statistikasi grafik */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-7 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-green-600 flex items-center gap-2">
              <CheckCircle size={22} className="text-green-400" /> QC
              statistikasi
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qcData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="oy" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="otgan"
                    fill="#22c55e"
                    name="QC’dan o'tgan"
                    radius={[10, 10, 0, 0]}
                  />
                  <Bar
                    dataKey="otmagan"
                    fill="#f43f5e"
                    name="QC’dan o'tmagan"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

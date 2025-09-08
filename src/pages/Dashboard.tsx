import { useCRM } from '@/context/CRMContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const { customers, leads, getDashboardStats } = useCRM();
  const stats = getDashboardStats();

  // Recent leads (last 5)
  const recentLeads = leads
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Chart data
  const statusColors = {
    New: '#3B82F6',
    Contacted: '#F59E0B',
    Converted: '#10B981',
    Lost: '#EF4444',
  };

  const leadStatusData = {
    labels: Object.keys(stats.leadsByStatus),
    datasets: [
      {
        data: Object.values(stats.leadsByStatus),
        backgroundColor: Object.keys(stats.leadsByStatus).map(status => statusColors[status as keyof typeof statusColors]),
        borderWidth: 0,
      },
    ],
  };

  const valueByStatusData = {
    labels: Object.keys(stats.valueByStatus),
    datasets: [
      {
        label: 'Value ($)',
        data: Object.values(stats.valueByStatus),
        backgroundColor: Object.keys(stats.valueByStatus).map(status => statusColors[status as keyof typeof statusColors]),
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Converted': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your CRM.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="crm-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Active customer accounts
              </p>
            </CardContent>
          </Card>

          <Card className="crm-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                Leads in pipeline
              </p>
            </CardContent>
          </Card>

          <Card className="crm-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total pipeline value
              </p>
            </CardContent>
          </Card>

          <Card className="crm-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalLeads > 0 
                  ? Math.round((stats.leadsByStatus.Converted || 0) / stats.totalLeads * 100)
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Leads to customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="crm-shadow">
            <CardHeader>
              <CardTitle>Leads by Status</CardTitle>
              <CardDescription>
                Distribution of leads across different stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {stats.totalLeads > 0 ? (
                  <Pie data={leadStatusData} options={chartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No leads data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="crm-shadow">
            <CardHeader>
              <CardTitle>Value by Status</CardTitle>
              <CardDescription>
                Revenue potential across different lead stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {stats.totalLeads > 0 ? (
                  <Bar data={valueByStatusData} options={barChartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No value data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="crm-shadow">
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>
              Latest leads added to your pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead) => {
                  const customer = customers.find(c => c._id === lead.customerId);
                  return (
                    <div key={lead._id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                      <div className="space-y-1">
                        <p className="font-medium">{lead.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer?.name} • ${lead.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent leads found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
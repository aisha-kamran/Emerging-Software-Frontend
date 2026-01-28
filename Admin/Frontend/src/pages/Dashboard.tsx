import { FileText, Users, CheckCircle, Clock, Activity, ArrowUpRight } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotification } from '@/components/ui/ToastNotification';

// Interfaces
interface DashboardStats {
  total: number;
  drafts: number;
  published: number;
}

interface BlogPost {
  id: number;
  title: string;
  author: string;
  created_at: string;
  status: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToastNotification();
  
  const [stats, setStats] = useState<DashboardStats>({ total: 0, drafts: 0, published: 0 });
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [adminCount, setAdminCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, blogsData, adminsData] = await Promise.all([
          api.fetchBlogSummary(),
          api.fetchBlogs(), // Fetch all to slice later
          api.fetchAdmins()
        ]);

        setStats(summaryData);
        // Sirf top 5 recent blogs dikhayenge
        setBlogs(Array.isArray(blogsData) ? blogsData.slice(0, 5) : []);
        setAdminCount(adminsData.length);
      } catch (error) {
        console.error("Dashboard Error:", error);
        // Silent fail for UI smoothness
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch { return 'N/A'; }
  };

  // Stats Data
  const statCards = [
    { label: 'Total Blogs', value: stats.total, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Drafts', value: stats.drafts, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Team Members', value: adminCount, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ];

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle={`Welcome back, ${user?.full_name || 'Admin'}!`}>
      
      {/* 1. Stats Grid (Responsive: 1 col mobile, 2 col tablet, 4 col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className={`p-5 rounded-xl border bg-gray-900 ${stat.border} hover:bg-gray-800/50 transition-all duration-300`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {/* <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">+2.5%</span> */}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recent Blogs Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Recent Blogs
            </h2>
            <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {blogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No blogs found. Start writing!</div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-700">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-sm font-medium text-white truncate">{blog.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      By {blog.author} • {formatDate(blog.created_at)}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border ${
                    blog.status === 'published' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {blog.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Activity Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" /> Activity Log
            </h2>
          </div>

          <div className="relative pl-4 border-l border-gray-800 space-y-8">
            {blogs.length === 0 ? (
               <div className="text-center py-8 text-gray-500 pl-4 border-l-0">No recent activity</div>
            ) : (
              blogs.map((blog, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-purple-500 ring-4 ring-gray-900 group-hover:bg-purple-400 transition-colors"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-white">{blog.author}</span> created a new blog
                    </p>
                    <span className="text-xs text-gray-500">{formatDate(blog.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate group-hover:text-gray-400 transition-colors">
                    "{blog.title}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;
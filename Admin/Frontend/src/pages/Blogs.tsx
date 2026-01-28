import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, FileText } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from '@/components/layout/AdminLayout';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToastNotification } from '@/components/ui/ToastNotification';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

// Interface
interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  status: string;
  created_at: string;
}

const Blogs = () => {
  const { user } = useAuth();
  const { showToast } = useToastNotification();
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');

  // --- EDITOR SETTINGS ---
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'link', 'image'
  ];

  // --- Load Blogs ---
  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await api.fetchBlogs();
      if (Array.isArray(data)) {
        setBlogs(data);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  // --- Handlers ---
  const openCreateModal = () => {
    setSelectedBlog(null);
    setTitle('');
    setContent('');
    setStatus('draft');
    setIsModalOpen(true);
  };

  const openEditModal = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setStatus(blog.status);
    setIsModalOpen(true);
  };

  const openDeleteModal = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
        showToast('error', 'Title is required');
        return;
    }

    const payload = {
      title,
      content,
      status,
      author: user?.full_name || 'Admin',
    };

    try {
      if (selectedBlog) {
        await api.updateBlog(selectedBlog.id, payload);
        showToast('success', 'Blog updated');
      } else {
        await api.createBlog(payload);
        showToast('success', 'Blog created');
      }
      setIsModalOpen(false);
      loadBlogs();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Operation failed';
      showToast('error', message);
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;
    try {
      await api.deleteBlog(selectedBlog.id);
      showToast('success', 'Deleted');
      setIsDeleteModalOpen(false);
      loadBlogs();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Delete failed';
      showToast('error', message);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString(); } catch { return 'N/A'; }
  };

  return (
    <AdminLayout title="Blog Management" subtitle="Create rich content blogs">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blogs..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500"
          />
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" />
          Create New Blog
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-400">
                <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                {loading ? <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr> : 
                filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4 text-white font-medium max-w-xs truncate">{blog.title}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs ${blog.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                {blog.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(blog.created_at)}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button onClick={() => openEditModal(blog)} className="text-blue-400 mr-3 hover:text-blue-300"><Edit2 size={18}/></button>
                            <button onClick={() => openDeleteModal(blog)} className="text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- RESPONSIVE MODAL FIX START --- */}
{/* --- MODAL FIX (WEB & MOBILE) --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBlog ? 'Edit Blog' : 'Create Blog'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          
          {/* 
             Changes:
             1. max-h-[85vh]: Height badha di taake web par bada dikhe.
             2. [&::-webkit-scrollbar]:hidden: Scrollbar ko chupa diya (Clean Look).
          */}
          <div className="flex-1 overflow-y-auto max-h-[85vh] p-1 space-y-4 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500" 
                    placeholder="Blog Headline..." 
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content (Images & Text)</label>
                <div className="bg-white text-black rounded-lg overflow-hidden">
                    <ReactQuill 
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        // Web par height auto adjust hogi, mobile par fix rahegi
                        className="h-64 sm:h-[350px] mb-12 sm:mb-10" 
                        placeholder="Write here..."
                    />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700 shrink-0">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium">Save Blog</button>
          </div>

        </form>
      </Modal>
      {/* --- RESPONSIVE MODAL FIX END --- */}

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} title="Delete Blog" message="Sure?" confirmLabel="Delete" type="danger" />
    </AdminLayout>
  );
};

export default Blogs;
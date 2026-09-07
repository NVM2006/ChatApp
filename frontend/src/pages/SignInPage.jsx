import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js'; 

function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { signin } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
   signin(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
        
    
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-pink-500 mb-2">
            Đăng nhập
          </h1>
          <p className="text-slate-400">Chào mừng bạn quay trở lại</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="size-5 text-slate-400" />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-500 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>


          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="size-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white placeholder-slate-500 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

        
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg mt-4"
          >
            Đăng nhập
            <LogIn className="size-5" />
          </button>

        </form>

   
        <div className="mt-8 text-center text-sm text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/signup" className="text-pink-400 hover:text-pink-300 font-medium hover:underline transition-colors">
            Tạo tài khoản mới
          </Link>
        </div>

      </div>
    </div>
  );
}

export default SignInPage;
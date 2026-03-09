import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, FolderPlus, Folder, Settings, Code2, Users } from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  
  const navigation = [
    { name: '仪表盘', href: '/dashboard', icon: Home },
    { name: '新建项目', href: '/new', icon: FolderPlus },
    { name: '项目列表', href: '/projects', icon: Folder },
    { name: '设置', href: '/settings', icon: Settings },
  ]
  
  const isActive = (href) => location.pathname === href
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部导航 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">DevTeam</h1>
                  <p className="text-xs text-gray-500">AI开发团队</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                <Users className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">12个Agent</span>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">王</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 侧边栏 */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                      ${active 
                        ? 'bg-primary-50 text-primary-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
            
            {/* 快速统计 */}
            <div className="mt-8 card">
              <h3 className="text-sm font-medium text-gray-700 mb-4">快速统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总项目</span>
                  <span className="text-lg font-bold text-gray-900">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">进行中</span>
                  <span className="text-lg font-bold text-primary-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">已完成</span>
                  <span className="text-lg font-bold text-green-600">5</span>
                </div>
              </div>
            </div>
          </aside>
          
          {/* 主内容 */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

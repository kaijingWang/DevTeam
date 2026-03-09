import { Link } from 'react-router-dom'
import { 
  TrendingUp, Clock, CheckCircle, AlertCircle,
  Code, FileText, Bug, Sparkles, Users, Zap
} from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { name: '总项目数', value: '8', change: '+2', icon: Code, color: 'blue' },
    { name: '进行中', value: '3', change: '+1', icon: Clock, color: 'yellow' },
    { name: '已完成', value: '5', change: '+1', icon: CheckCircle, color: 'green' },
    { name: '待修复', value: '2', change: '-1', icon: AlertCircle, color: 'red' },
  ]
  
  const recentProjects = [
    { 
      id: 1, 
      name: 'E-commerce Platform', 
      status: 'in-progress', 
      progress: 65,
      agents: ['PM', 'Backend', 'Frontend'],
      updatedAt: '2分钟前'
    },
    { 
      id: 2, 
      name: 'Blog System', 
      status: 'completed', 
      progress: 100,
      agents: ['PM', 'Backend', 'Frontend', 'QA'],
      updatedAt: '1小时前'
    },
    { 
      id: 3, 
      name: 'Admin Dashboard', 
      status: 'in-progress', 
      progress: 45,
      agents: ['PM', 'UI Designer', 'Frontend'],
      updatedAt: '3小时前'
    },
  ]
  
  const activities = [
    { type: 'success', message: 'Blog System 项目已完成', time: '1小时前' },
    { type: 'info', message: 'E-commerce Platform 后端开发中', time: '2小时前' },
    { type: 'warning', message: 'Admin Dashboard 发现2个问题', time: '3小时前' },
    { type: 'success', message: 'API文档已生成', time: '5小时前' },
  ]
  
  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">欢迎回来，王凯景！</h2>
            <p className="text-primary-100">你的AI开发团队已准备就绪</p>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8" />
            <div className="text-right">
              <div className="text-3xl font-bold">12</div>
              <div className="text-sm text-primary-100">个Agent</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            yellow: 'bg-yellow-50 text-yellow-600',
            green: 'bg-green-50 text-green-600',
            red: 'bg-red-50 text-red-600',
          }
          
          return (
            <div key={stat.name} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} 本周</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 最近项目和活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近项目 */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">最近项目</h3>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部 →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <span className={`
                    px-2 py-1 text-xs rounded-full
                    ${project.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                    }
                  `}>
                    {project.status === 'completed' ? '已完成' : '进行中'}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>进度</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        project.status === 'completed' ? 'bg-green-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div className="flex -space-x-2">
                      {project.agents.map((agent, i) => (
                        <div 
                          key={i}
                          className="w-6 h-6 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center"
                          title={agent}
                        >
                          <span className="text-xs text-primary-700">{agent[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{project.updatedAt}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* 活动日志 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">活动日志</h3>
          
          <div className="space-y-4">
            {activities.map((activity, i) => {
              const iconClasses = {
                success: 'bg-green-100 text-green-600',
                info: 'bg-blue-100 text-blue-600',
                warning: 'bg-yellow-100 text-yellow-600',
              }
              
              return (
                <div key={i} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconClasses[activity.type]}`}>
                    {activity.type === 'success' && <CheckCircle className="w-4 h-4" />}
                    {activity.type === 'info' && <Zap className="w-4 h-4" />}
                    {activity.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* 快速操作 */}
      <div className="card bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/new" className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">新建项目</div>
              <div className="text-sm text-gray-500">开始新的开发</div>
            </div>
          </Link>
          
          <button className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">生成文档</div>
              <div className="text-sm text-gray-500">自动生成文档</div>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Bug className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">修复Bug</div>
              <div className="text-sm text-gray-500">AI自动修复</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

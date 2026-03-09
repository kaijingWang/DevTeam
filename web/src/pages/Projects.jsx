import { Link } from 'react-router-dom'
import { Clock, CheckCircle, Folder } from 'lucide-react'

export default function Projects() {
  const projects = [
    { id: 1, name: 'E-commerce Platform', status: 'in-progress', progress: 65, updatedAt: '2分钟前' },
    { id: 2, name: 'Blog System', status: 'completed', progress: 100, updatedAt: '1小时前' },
    { id: 3, name: 'Admin Dashboard', status: 'in-progress', progress: 45, updatedAt: '3小时前' },
    { id: 4, name: 'Mobile App API', status: 'completed', progress: 100, updatedAt: '1天前' },
    { id: 5, name: 'Chat Application', status: 'in-progress', progress: 30, updatedAt: '2天前' },
  ]
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">项目列表</h1>
          <p className="text-gray-600">管理你的所有项目</p>
        </div>
        <Link to="/new" className="btn-primary">
          + 新建项目
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-primary-600" />
              </div>
              <span className={`
                px-3 py-1 text-xs rounded-full font-medium
                ${project.status === 'completed' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
                }
              `}>
                {project.status === 'completed' ? '已完成' : '进行中'}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
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
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {project.updatedAt}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

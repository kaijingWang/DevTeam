import { useParams } from 'react-router-dom'
import { Users, Clock, CheckCircle, FileText, Code } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  
  const project = {
    name: 'E-commerce Platform',
    description: '一个完整的电商平台，包含商品管理、订单系统、支付集成等功能',
    status: 'in-progress',
    progress: 65,
    createdAt: '2024-03-01',
    agents: [
      { name: 'PM Agent', status: 'completed', output: 'PRD文档已生成' },
      { name: 'Architect Agent', status: 'completed', output: '技术方案已完成' },
      { name: 'Backend Agent', status: 'in-progress', output: '正在开发API...' },
      { name: 'Frontend Agent', status: 'pending', output: '等待中' },
    ]
  }
  
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium">
            进行中
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">总进度</div>
            <div className="text-2xl font-bold text-gray-900">{project.progress}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">创建时间</div>
            <div className="text-lg font-medium text-gray-900">{project.createdAt}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">参与Agent</div>
            <div className="text-lg font-medium text-gray-900">{project.agents.length}个</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-primary-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Agent工作状态</h2>
        <div className="space-y-4">
          {project.agents.map((agent, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${agent.status === 'completed' ? 'bg-green-100' : 
                  agent.status === 'in-progress' ? 'bg-yellow-100' : 'bg-gray-200'}
              `}>
                {agent.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {agent.status === 'in-progress' && <Clock className="w-5 h-5 text-yellow-600 animate-spin" />}
                {agent.status === 'pending' && <Users className="w-5 h-5 text-gray-600" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{agent.name}</div>
                <div className="text-sm text-gray-600">{agent.output}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

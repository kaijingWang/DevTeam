import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Code, Rocket, FileText } from 'lucide-react'

export default function NewProject() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: '',
    mode: 'auto'
  })
  
  const templates = [
    { id: 'express-api', name: 'Express REST API', icon: '🔧', desc: 'Node.js后端API' },
    { id: 'react-app', name: 'React SPA', icon: '⚛️', desc: 'React单页应用' },
    { id: 'nextjs-app', name: 'Next.js全栈', icon: '▲', desc: 'Next.js应用' },
    { id: 'custom', name: '自定义', icon: '✨', desc: '从零开始' },
  ]
  
  const modes = [
    { id: 'auto', name: '自动模式', icon: Rocket, desc: '全自动运行，无需确认' },
    { id: 'interactive', name: '交互模式', icon: Sparkles, desc: '每步询问确认' },
    { id: 'step', name: '步进模式', icon: Code, desc: '每步暂停查看' },
  ]
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // 这里应该调用API创建项目
    console.log('创建项目:', formData)
    navigate('/projects')
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">创建新项目</h1>
        <p className="text-gray-600">让AI团队帮你快速开发</p>
      </div>
      
      {/* 步骤指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-medium
                ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {s}
              </div>
              {s < 3 && (
                <div className={`
                  flex-1 h-1 mx-4
                  ${step > s ? 'bg-primary-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">基本信息</span>
          <span className="text-sm text-gray-600">选择模板</span>
          <span className="text-sm text-gray-600">运行模式</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 步骤1: 基本信息 */}
        {step === 1 && (
          <div className="card space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目名称 *
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="my-awesome-project"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目描述 *
              </label>
              <textarea
                required
                rows={4}
                className="input"
                placeholder="描述你想要开发的功能..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 提示：描述越详细，AI生成的代码质量越高
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary"
                disabled={!formData.name || !formData.description}
              >
                下一步 →
              </button>
            </div>
          </div>
        )}
        
        {/* 步骤2: 选择模板 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">选择项目模板</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, template: template.id })}
                    className={`
                      p-6 border-2 rounded-lg text-left transition-all
                      ${formData.template === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary"
              >
                ← 上一步
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-primary"
                disabled={!formData.template}
              >
                下一步 →
              </button>
            </div>
          </div>
        )}
        
        {/* 步骤3: 运行模式 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">选择运行模式</h3>
              <div className="space-y-4">
                {modes.map((mode) => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: mode.id })}
                      className={`
                        w-full p-6 border-2 rounded-lg text-left transition-all flex items-start space-x-4
                        ${formData.mode === mode.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                        ${formData.mode === mode.id ? 'bg-primary-100' : 'bg-gray-100'}
                      `}>
                        <Icon className={`w-6 h-6 ${formData.mode === mode.id ? 'text-primary-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{mode.name}</h4>
                        <p className="text-sm text-gray-600">{mode.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* 项目预览 */}
            <div className="card bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">项目预览</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">项目名称:</span>
                  <span className="font-medium text-gray-900">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">模板:</span>
                  <span className="font-medium text-gray-900">
                    {templates.find(t => t.id === formData.template)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">运行模式:</span>
                  <span className="font-medium text-gray-900">
                    {modes.find(m => m.id === formData.mode)?.name}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-600">描述:</span>
                  <p className="mt-1 text-gray-900">{formData.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary"
              >
                ← 上一步
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>开始创建</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

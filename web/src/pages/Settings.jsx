import { useState } from 'react'
import { Save, Key, Cpu, Palette } from 'lucide-react'

export default function Settings() {
  const [config, setConfig] = useState({
    apiKey: '••••••••••••••••',
    provider: 'claude',
    model: 'claude-3-sonnet',
    theme: 'light'
  })
  
  const [saved, setSaved] = useState(false)
  
  const handleSave = (e) => {
    e.preventDefault()
    // 保存配置
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }
  
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">设置</h1>
        <p className="text-gray-600">配置你的DevTeam CLI</p>
      </div>
      
      <form onSubmit={handleSave} className="space-y-6">
        {/* API配置 */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">API配置</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LLM提供商
              </label>
              <select 
                className="input"
                value={config.provider}
                onChange={(e) => setConfig({ ...config, provider: e.target.value })}
              >
                <option value="claude">Claude (Anthropic)</option>
                <option value="openai">OpenAI GPT-4</option>
                <option value="ollama">Ollama (本地)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                className="input"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型
              </label>
              <select 
                className="input"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
              >
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="llama2">Llama 2</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* 界面配置 */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">界面配置</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主题
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setConfig({ ...config, theme: 'light' })}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all
                  ${config.theme === 'light' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                `}
              >
                <div className="font-medium text-gray-900">浅色主题</div>
                <div className="text-sm text-gray-600 mt-1">适合白天使用</div>
              </button>
              
              <button
                type="button"
                onClick={() => setConfig({ ...config, theme: 'dark' })}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all
                  ${config.theme === 'dark' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                `}
              >
                <div className="font-medium text-gray-900">深色主题</div>
                <div className="text-sm text-gray-600 mt-1">适合夜间使用</div>
              </button>
            </div>
          </div>
        </div>
        
        {/* 保存按钮 */}
        <div className="flex items-center justify-between">
          {saved && (
            <div className="text-green-600 font-medium">
              ✓ 设置已保存
            </div>
          )}
          <button type="submit" className="btn-primary ml-auto flex items-center space-x-2">
            <Save className="w-5 h-5" />
            <span>保存设置</span>
          </button>
        </div>
      </form>
    </div>
  )
}

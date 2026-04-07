<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-6">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- 头部 -->
      <header class="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">公众号助手</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            批量查询公众号并导出 JSON，生成的配置请前往 
            <a href="https://down.mptext.top/dashboard/account" target="_blank" class="text-blue-500 hover:underline inline-flex items-center gap-1">
              控制台 <ExternalLink :size="12" />
            </a> 使用
          </p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="relative group">
            <input 
              v-model="apiKey"
              :type="showKey ? 'text' : 'password'"
              placeholder="请输入 API 密钥" 
              class="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm border-0 focus:ring-2 focus:ring-blue-500 w-64 transition-all"
            />
            <button @click="showKey = !showKey" class="absolute right-3 top-2.5 text-slate-400 hover:text-blue-500">
              <Eye v-if="!showKey" :size="16" />
              <EyeOff v-else :size="16" />
            </button>
          </div>
        </div>
      </header>

      <main class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 输入区 -->
        <section class="space-y-4">
          <div class="flex justify-between items-end">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <ListIcon :size="20" class="text-blue-500" />
              待查询关键词
            </h2>
            <span class="text-xs text-slate-500">{{ keywordCount }} 个建议查询</span>
          </div>
          <textarea 
            v-model="inputKeywords"
            placeholder="请每行粘贴一个关键词..."
            class="w-full h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-inner"
          ></textarea>
          
          <div class="flex gap-4">
            <button 
              @click="handleStart"
              :disabled="isProcessing || !inputKeywords.trim()"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Play v-if="!isProcessing" :size="20" />
              <Loader2 v-else :size="20" class="animate-spin" />
              {{ isProcessing ? '处理中...' : '开始批量查询' }}
            </button>
            
            <button 
              @click="exportJson"
              :disabled="isProcessing || accounts.length === 0"
              class="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Download :size="20" />
              导出 JSON
            </button>
          </div>
        </section>

        <!-- 结果区 -->
        <section class="space-y-4">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <Database :size="20" class="text-emerald-500" />
            查询进度与结果
          </h2>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl h-[28rem] overflow-hidden flex flex-col shadow-sm">
            <!-- 进度条 -->
            <div class="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div class="flex justify-between text-xs mb-2">
                <span>进度: {{ progress }}%</span>
                <span>{{ accounts.length }} / {{ totalToProcess }} 已完成</span>
              </div>
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-blue-500 transition-all duration-500 ease-out"
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
            </div>
            
            <!-- 结果列表 -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div v-if="logs.length === 0" class="h-full flex items-center justify-center text-slate-400 text-sm italic">
                等待开始任务...
              </div>
              <div 
                v-for="(log, i) in logs" 
                :key="i"
                class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-sm flex items-center gap-3 relative transition-all"
                :class="log.status === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'"
              >
                <div v-if="log.status === 'success'" class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                  <img :src="log.data.round_head_img" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                  <AlertCircle :size="16" />
                </div>
                <div class="flex-1 truncate pr-16 text-xs">
                  <p class="font-medium truncate text-sm" :class="log.status === 'error' ? 'text-red-600 dark:text-red-400' : ''">{{ log.keyword }}</p>
                  <p class="text-[10px] text-slate-500 italic mt-0.5">{{ log.message }}</p>
                </div>
                <div v-if="log.status === 'error'" class="absolute right-3 top-3">
                    <button 
                        @click="retryKeyword(log, i)" 
                        title="重试此关键词"
                        class="p-1 px-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors flex items-center gap-1 text-[10px]"
                    >
                        <RotateCcw :size="12" /> 重试
                    </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- 提示 -->
      <footer class="text-center text-xs text-slate-400 py-4 space-y-1">
        <p>该工具仅用于批量导出公众号信息，API 由 down.mptext.top 提供支持。</p>
        <p>请确保生成的 JSON 文件导入到 <a href="https://down.mptext.top/dashboard/account" target="_blank" class="text-blue-400 hover:underline">down.mptext.top/dashboard/account</a> 进行下一步操作。</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { 
  Eye, EyeOff, Play, Download, Loader2, ListIcon, 
  Database, AlertCircle, CheckCircle2, ExternalLink, RotateCcw
} from 'lucide-vue-next'

const apiKey = ref('')
const showKey = ref(false)
const inputKeywords = ref('')
const isProcessing = ref(false)
const accounts = ref([])
const logs = ref([])
const totalToProcess = ref(0)

// 从内存/存储加载 Key
onMounted(() => {
  const saved = localStorage.getItem('auth_api_key')
  if (saved) apiKey.value = saved
})

// 监听 Key 变化自动保存
watch(apiKey, (val) => {
  localStorage.setItem('auth_api_key', val)
})

const keywordCount = computed(() => {
  return inputKeywords.value.split('\n').filter(k => k.trim()).length
})

const progress = computed(() => {
  if (totalToProcess.value === 0) return 0
  const processed = logs.value.length
  return Math.round((processed / totalToProcess.value) * 100)
})

const handleStart = () => {
  if (!apiKey.value) {
    alert('请先输入 API 密钥 (X-Auth-Key)。密钥通常在扫码登录后自动获取，或手动填写站点提取的密钥。')
    return
  }
  startProcessing()
}

const fetchAccount = async (keyword) => {
  return await $fetch('/api/remote/public/v1/account', {
    params: { keyword, size: 1 },
    headers: {
      'X-Auth-Key': apiKey.value
    }
  })
}

const startProcessing = async () => {
  const keywords = inputKeywords.value.split('\n').filter(k => k.trim())
  if (keywords.length === 0) return
  
  isProcessing.value = true
  accounts.value = []
  logs.value = []
  totalToProcess.value = keywords.length
  
  for (const keyword of keywords) {
    await processOne(keyword)
  }
  
  isProcessing.value = false
}

const processOne = async (keyword) => {
    try {
      const response = await fetchAccount(keyword)
      if (response.list && response.list.length > 0) {
        const item = response.list[0]
        accounts.value.push(item)
        logs.value.unshift({
          keyword,
          status: 'success',
          message: `获取到: ${item.nickname}`,
          data: item
        })
      } else {
        logs.value.unshift({
          keyword,
          status: 'error',
          message: '未找到相关结果',
          data: null
        })
      }
    } catch (err) {
      logs.value.unshift({
        keyword,
        status: 'error',
        message: err.message || '网络请求失败',
        data: null
      })
    }
}

const retryKeyword = async (log, index) => {
    const keyword = prompt('请确认或修改关键词:', log.keyword)
    if (keyword === null) return // 取消
    
    // 移除旧记录
    logs.value.splice(index, 1)
    
    // 这里我们不改变 totalToProcess, 仅仅是重跑一次
    try {
      const response = await fetchAccount(keyword)
      if (response.list && response.list.length > 0) {
        const item = response.list[0]
        accounts.value.push(item)
        logs.value.unshift({
          keyword,
          status: 'success',
          message: `获取到: ${item.nickname}`,
          data: item
        })
      } else {
        logs.value.unshift({
          keyword,
          status: 'error',
          message: '未找到相关结果',
          data: null
        })
      }
    } catch (err) {
      logs.value.unshift({
        keyword,
        status: 'error',
        message: err.message || '重试失败',
        data: null
      })
    }
}

const exportJson = () => {
  const result = {
    version: "1.0",
    usefor: "wechat-article-exporter",
    accounts: accounts.value
  }
  
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wechat-accounts-${new Date().getTime()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style>
/* 玻璃拟态与柔和光效 */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}
.dark .glass {
  background: rgba(15, 23, 42, 0.7);
}

::selection {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}
</style>

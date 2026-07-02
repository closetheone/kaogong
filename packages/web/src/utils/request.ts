// API 基础配置
const BASE_URL = 'http://localhost:3000/api'

// 请求封装
export const request = async <T = any>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    header?: any
  } = {}
): Promise<T> => {
  const { method = 'GET', data, header = {} } = options

  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      }
    })

    if (response.statusCode === 200) {
      return response.data as T
    } else {
      throw new Error(`请求失败: ${response.statusCode}`)
    }
  } catch (error) {
    console.error('API请求错误:', error)
    throw error
  }
}

// API 接口定义
export const api = {
  // 用户相关
  user: {
    login: (data: { openId: string; nickname?: string; avatar?: string }) =>
      request('/user/login', { method: 'POST', data }),
    
    getProfile: () =>
      request('/user/profile'),
    
    updateProfile: (data: any) =>
      request('/user/profile', { method: 'PUT', data })
  },

  // 题目相关
  question: {
    getList: (params: { category?: string; page?: number; pageSize?: number }) =>
      request('/questions', { data: params }),
    
    getDetail: (id: string) =>
      request(`/questions/${id}`),
    
    getRandom: (params: { category: string; count: number }) =>
      request('/questions/random', { data: params })
  },

  // 练习相关
  practice: {
    submit: (data: { questionId: string; userAnswer: string; timeSpent: number }) =>
      request('/practice/submit', { method: 'POST', data }),
    
    getHistory: (params?: { page?: number; pageSize?: number }) =>
      request('/practice/history', { data: params }),
    
    getStats: () =>
      request('/practice/stats')
  },

  // 错题相关
  wrong: {
    getList: (params?: { page?: number; pageSize?: number }) =>
      request('/wrong-questions', { data: params }),
    
    remove: (id: string) =>
      request(`/wrong-questions/${id}`, { method: 'DELETE' })
  }
}

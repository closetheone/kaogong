import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter, useLoad } from '@tarojs/taro'
import { useState } from 'react'
import './result.scss'

interface ExamResult {
  score: number
  correctCount: number
  totalCount: number
  duration: number
  categoryStats: Record<string, {
    total: number
    correct: number
    accuracy: number
  }>
}

export default function MockExamResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    loadResult()
  })

  const loadResult = async () => {
    try {
      // TODO: 调用API获取考试结果
      // const res = await api.mockExam.getResult(router.params.examId)
      // setResult(res.data)
      
      // 模拟数据
      setResult({
        score: 75,
        correctCount: 23,
        totalCount: 30,
        duration: 7200,
        categoryStats: {
          '言语理解与表达': { total: 8, correct: 6, accuracy: 75 },
          '数量关系': { total: 6, correct: 4, accuracy: 67 },
          '判断推理': { total: 8, correct: 7, accuracy: 88 },
          '资料分析': { total: 5, correct: 4, accuracy: 80 },
          '常识判断': { total: 3, correct: 2, accuracy: 67 }
        }
      })
    } catch (error) {
      console.error('加载结果失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = () => {
    Taro.navigateTo({
      url: `/pages/mock-exam/review?examId=${router.params.examId}`
    })
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  if (loading) {
    return (
      <View className='loading-page'>
        <Text>加载中...</Text>
      </View>
    )
  }

  if (!result) {
    return (
      <View className='error-page'>
        <Text>加载失败</Text>
      </View>
    )
  }

  const accuracy = Math.round((result.correctCount / result.totalCount) * 100)
  const durationMinutes = Math.floor(result.duration / 60)

  return (
    <View className='result-page'>
      <View className='score-section'>
        <View className='score-circle'>
          <Text className='score-value'>{result.score}</Text>
          <Text className='score-label'>分</Text>
        </View>
        <View className='score-info'>
          <Text className='accuracy'>正确率 {accuracy}%</Text>
          <Text className='detail'>
            答对 {result.correctCount}/{result.totalCount} 题
          </Text>
          <Text className='time'>用时 {durationMinutes} 分钟</Text>
        </View>
      </View>

      <View className='stats-section'>
        <Text className='section-title'>各模块表现</Text>
        <View className='category-list'>
          {Object.entries(result.categoryStats).map(([category, stats]) => (
            <View key={category} className='category-item'>
              <View className='category-header'>
                <Text className='category-name'>{category}</Text>
                <Text className='category-accuracy'>{stats.accuracy}%</Text>
              </View>
              <View className='progress-bar'>
                <View 
                  className='progress-fill'
                  style={{ width: `${stats.accuracy}%` }}
                />
              </View>
              <Text className='category-detail'>
                {stats.correct}/{stats.total} 题
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className='actions'>
        <Button className='review-btn' onClick={handleReview}>
          查看答案解析
        </Button>
        <Button className='back-btn' onClick={handleBack}>
          返回首页
        </Button>
      </View>
    </View>
  )
}

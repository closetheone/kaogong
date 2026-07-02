import { View, Text, Button } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

interface ExamHistory {
  id: string
  examType: string
  score: number
  correctCount: number
  totalCount: number
  duration: number
  startTime: string
  endTime: string
}

export default function MockExamPage() {
  const [examHistory, setExamHistory] = useState<ExamHistory[]>([])
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    loadExamHistory()
  })

  const loadExamHistory = async () => {
    setLoading(true)
    try {
      // TODO: 调用API获取考试历史
      // const res = await api.mockExam.getHistory()
      // setExamHistory(res.data.list)
      
      // 模拟数据
      setExamHistory([
        {
          id: '1',
          examType: '行测',
          score: 75,
          correctCount: 23,
          totalCount: 30,
          duration: 120,
          startTime: '2024-01-15 14:00',
          endTime: '2024-01-15 16:00'
        }
      ])
    } catch (error) {
      console.error('加载考试历史失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = () => {
    Taro.showActionSheet({
      itemList: ['行测模拟', '申论模拟', '综合模拟'],
      success: (res) => {
        const examTypes = ['行测', '申论', '综合']
        const examType = examTypes[res.tapIndex]
        Taro.navigateTo({
          url: `/pages/mock-exam/exam?examType=${examType}&duration=120`
        })
      }
    })
  }

  const handleViewResult = (examId: string) => {
    Taro.navigateTo({
      url: `/pages/mock-exam/result?examId=${examId}`
    })
  }

  return (
    <View className='mock-exam-page'>
      <View className='header'>
        <Text className='title'>模拟考试</Text>
        <Text className='subtitle'>模拟真实考试环境，检验学习效果</Text>
      </View>

      <View className='start-section'>
        <Button className='start-btn' onClick={handleStartExam}>
          开始新考试
        </Button>
        <View className='exam-types'>
          <View className='type-item'>
            <Text className='type-icon'>📝</Text>
            <Text className='type-name'>行测</Text>
            <Text className='type-desc'>30题 120分钟</Text>
          </View>
          <View className='type-item'>
            <Text className='type-icon'>📄</Text>
            <Text className='type-name'>申论</Text>
            <Text className='type-desc'>5题 180分钟</Text>
          </View>
          <View className='type-item'>
            <Text className='type-icon'>📚</Text>
            <Text className='type-name'>综合</Text>
            <Text className='type-desc'>35题 150分钟</Text>
          </View>
        </View>
      </View>

      <View className='history-section'>
        <Text className='section-title'>考试历史</Text>
        {loading ? (
          <View className='loading'>
            <Text>加载中...</Text>
          </View>
        ) : examHistory.length === 0 ? (
          <View className='empty'>
            <Text>暂无考试记录</Text>
          </View>
        ) : (
          <View className='history-list'>
            {examHistory.map(exam => (
              <View key={exam.id} className='history-item'>
                <View className='exam-info'>
                  <Text className='exam-type'>{exam.examType}</Text>
                  <Text className='exam-time'>{exam.startTime}</Text>
                </View>
                <View className='exam-score'>
                  <Text className='score-value'>{exam.score}</Text>
                  <Text className='score-label'>分</Text>
                </View>
                <View className='exam-detail'>
                  <Text>正确 {exam.correctCount}/{exam.totalCount}</Text>
                  <Text>用时 {Math.floor(exam.duration / 60)}分钟</Text>
                </View>
                <Button 
                  className='view-btn'
                  onClick={() => handleViewResult(exam.id)}
                >
                  查看详情
                </Button>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface WrongQuestion {
  id: string
  question: string
  userAnswer: string
  correctAnswer: string
  category: string
  wrongTime: string
}

// 模拟错题数据
const mockWrongQuestions: WrongQuestion[] = [
  {
    id: '1',
    question: '言语理解与表达：下列句子中，没有语病的一项是...',
    userAnswer: 'A',
    correctAnswer: 'C',
    category: '言语理解',
    wrongTime: '2024-01-15 14:30'
  },
  {
    id: '2',
    question: '数量关系：甲乙两人同时从A地出发前往B地...',
    userAnswer: 'B',
    correctAnswer: 'C',
    category: '数量关系',
    wrongTime: '2024-01-15 10:20'
  }
]

export default function WrongBook() {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    // TODO: 从API获取错题数据
    // loadWrongQuestions()
    setWrongQuestions(mockWrongQuestions)
  }, [])

  const filteredQuestions = filter === 'all' 
    ? wrongQuestions 
    : wrongQuestions.filter(q => q.category === filter)

  const handleReview = (questionId: string) => {
    Taro.navigateTo({
      url: `/pages/practice/detail?reviewId=${questionId}`
    })
  }

  const handleRemove = (questionId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要从错题本中删除这道题吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用API删除
          setWrongQuestions(wrongQuestions.filter(q => q.id !== questionId))
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }

  return (
    <View className='wrong-book'>
      <View className='header'>
        <Text className='title'>错题本</Text>
        <Text className='count'>共 {wrongQuestions.length} 道错题</Text>
      </View>

      <View className='filter-tabs'>
        <View 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </View>
        <View 
          className={`tab ${filter === '言语理解' ? 'active' : ''}`}
          onClick={() => setFilter('言语理解')}
        >
          言语理解
        </View>
        <View 
          className={`tab ${filter === '数量关系' ? 'active' : ''}`}
          onClick={() => setFilter('数量关系')}
        >
          数量关系
        </View>
        <View 
          className={`tab ${filter === '判断推理' ? 'active' : ''}`}
          onClick={() => setFilter('判断推理')}
        >
          判断推理
        </View>
      </View>

      {filteredQuestions.length === 0 ? (
        <View className='empty'>
          <Text className='empty-icon'>🎉</Text>
          <Text className='empty-text'>暂无错题，继续保持！</Text>
        </View>
      ) : (
        <View className='question-list'>
          {filteredQuestions.map(question => (
            <View key={question.id} className='question-card'>
              <View className='question-header'>
                <Text className='category-tag'>{question.category}</Text>
                <Text className='wrong-time'>{question.wrongTime}</Text>
              </View>
              
              <View className='question-content'>
                <Text>{question.question}</Text>
              </View>

              <View className='answer-info'>
                <View className='answer-item'>
                  <Text className='label'>你的答案：</Text>
                  <Text className='user-answer wrong'>{question.userAnswer}</Text>
                </View>
                <View className='answer-item'>
                  <Text className='label'>正确答案：</Text>
                  <Text className='correct-answer'>{question.correctAnswer}</Text>
                </View>
              </View>

              <View className='actions'>
                <View 
                  className='btn-review'
                  onClick={() => handleReview(question.id)}
                >
                  重新练习
                </View>
                <View 
                  className='btn-remove'
                  onClick={() => handleRemove(question.id)}
                >
                  删除
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

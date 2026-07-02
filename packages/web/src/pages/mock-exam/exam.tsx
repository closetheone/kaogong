import { View, Text, Button, Radio, RadioGroup } from '@tarojs/components'
import Taro, { useRouter, useLoad } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './exam.scss'

interface Question {
  id: string
  content: string
  options: string[]
  category: string
}

export default function MockExamPage() {
  const router = useRouter()
  const { examType, duration } = router.params

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(parseInt(duration) * 60)
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    loadQuestions()
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const loadQuestions = async () => {
    try {
      // TODO: 调用API获取考试题目
      // const res = await api.mockExam.create({ examType, duration })
      // setQuestions(res.data.questions)
      
      // 模拟数据
      setQuestions([
        {
          id: '1',
          content: '言语理解与表达：下列句子中，没有语病的一项是：',
          options: [
            'A. 通过这次活动，使我们开阔了眼界',
            'B. 学生能否培养良好的学习习惯，关键在于要有坚定的信念',
            'C. 我们要继承和发扬中华民族的优秀传统文化',
            'D. 为了防止不再出现安全事故，学校加强了管理'
          ],
          category: '言语理解与表达'
        },
        {
          id: '2',
          content: '数量关系：甲乙两人同时从A地出发前往B地，甲的速度是乙的1.5倍，当甲到达B地时，乙距离B地还有20公里。问A、B两地相距多少公里？',
          options: [
            'A. 40公里',
            'B. 50公里',
            'C. 60公里',
            'D. 80公里'
          ],
          category: '数量关系'
        }
      ])
    } catch (error) {
      console.error('加载题目失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (e) => {
    const currentQuestion = questions[currentIndex]
    setAnswers({
      ...answers,
      [currentQuestion.id]: e.detail.value
    })
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSubmit = async () => {
    Taro.showModal({
      title: '确认提交',
      content: `已答 ${Object.keys(answers).length}/${questions.length} 题，确认提交吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            // TODO: 调用API提交答案
            // await api.mockExam.submit({
            //   examId: router.params.examId,
            //   answers: Object.entries(answers).map(([questionId, answer]) => ({
            //     questionId,
            //     answer
            //   }))
            // })
            
            Taro.showToast({
              title: '提交成功',
              icon: 'success'
            })

            setTimeout(() => {
              Taro.redirectTo({
                url: '/pages/mock-exam/result'
              })
            }, 1500)
          } catch (error) {
            console.error('提交失败:', error)
            Taro.showToast({
              title: '提交失败',
              icon: 'error'
            })
          }
        }
      }
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <View className='loading-page'>
        <Text>加载中...</Text>
      </View>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <View className='exam-page'>
      <View className='header'>
        <View className='timer'>
          <Text className='timer-icon'>⏱️</Text>
          <Text className='timer-text'>{formatTime(timeLeft)}</Text>
        </View>
        <View className='progress'>
          <Text>{currentIndex + 1} / {questions.length}</Text>
        </View>
      </View>

      <View className='question-card'>
        <View className='question-category'>
          <Text>{currentQuestion.category}</Text>
        </View>
        <Text className='question-content'>{currentQuestion.content}</Text>
        
        <RadioGroup className='options' onChange={handleAnswerChange}>
          {currentQuestion.options.map((option, index) => (
            <View key={index} className='option-item'>
              <Radio 
                value={option.charAt(0)}
                checked={answers[currentQuestion.id] === option.charAt(0)}
                color='#667eea'
              />
              <Text className='option-text'>{option}</Text>
            </View>
          ))}
        </RadioGroup>
      </View>

      <View className='actions'>
        <Button 
          className='nav-btn' 
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          上一题
        </Button>
        
        {currentIndex === questions.length - 1 ? (
          <Button className='submit-btn' onClick={handleSubmit}>
            提交试卷
          </Button>
        ) : (
          <Button className='nav-btn' onClick={handleNext}>
            下一题
          </Button>
        )}
      </View>

      <View className='question-nav'>
        {questions.map((q, index) => (
          <View
            key={q.id}
            className={`nav-dot ${index === currentIndex ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
            onClick={() => setCurrentIndex(index)}
          >
            <Text>{index + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

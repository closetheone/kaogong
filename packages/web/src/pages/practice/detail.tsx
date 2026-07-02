import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './detail.scss'

interface Question {
  id: string
  content: string
  options: string[]
  answer: string
  explanation: string
}

// 模拟题目数据
const mockQuestions: Question[] = [
  {
    id: '1',
    content: '言语理解与表达：下列句子中，没有语病的一项是：',
    options: [
      'A. 通过这次活动，使我们开阔了眼界',
      'B. 学生能否培养良好的学习习惯，关键在于要有坚定的信念',
      'C. 我们要继承和发扬中华民族的优秀传统文化',
      'D. 为了防止不再出现安全事故，学校加强了管理'
    ],
    answer: 'C',
    explanation: 'A项缺少主语，应去掉"通过"或"使"；B项两面对一面，"能否"是两面，"要有坚定的信念"是一面；D项否定不当，"防止"和"不再"双重否定表肯定，与句意不符。'
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
    answer: 'C',
    explanation: '设AB距离为x公里，乙的速度为v，则甲的速度为1.5v。甲到达B地用时x/1.5v，此时乙走了v*(x/1.5v)=x/1.5公里，距离B地还有x-x/1.5=x/3=20公里，所以x=60公里。'
  }
]

export default function PracticeDetail() {
  const router = useRouter()
  const { category = '', name = '' } = router.params

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showResult, setShowResult] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    // TODO: 根据category从API获取题目
    // loadQuestions(category)
    setQuestions(mockQuestions)
  }, [category])

  const currentQuestion = questions[currentIndex]

  const handleSelectAnswer = (answer: string) => {
    if (showResult) return
    setSelectedAnswer(answer)
  }

  const handleSubmit = () => {
    if (!selectedAnswer) {
      Taro.showToast({
        title: '请选择答案',
        icon: 'none'
      })
      return
    }
    setShowResult(true)
    
    // TODO: 提交答案到API
    // api.practice.submit({
    //   questionId: currentQuestion.id,
    //   userAnswer: selectedAnswer,
    //   timeSpent: 0
    // })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer('')
      setShowResult(false)
    } else {
      Taro.showToast({
        title: '已经是最后一题了',
        icon: 'none'
      })
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer('')
      setShowResult(false)
    } else {
      Taro.showToast({
        title: '已经是第一题了',
        icon: 'none'
      })
    }
  }

  if (!currentQuestion) {
    return (
      <View className='loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='practice-detail'>
      <View className='progress'>
        <Text>{currentIndex + 1} / {questions.length}</Text>
      </View>

      <View className='question-card'>
        <Text className='question-content'>{currentQuestion.content}</Text>
        
        <View className='options'>
          {currentQuestion.options.map((option, index) => {
            const optionKey = String.fromCharCode(65 + index) // A, B, C, D
            const isSelected = selectedAnswer === optionKey
            const isCorrect = showResult && optionKey === currentQuestion.answer
            const isWrong = showResult && isSelected && optionKey !== currentQuestion.answer

            let className = 'option-item'
            if (isSelected) className += ' selected'
            if (isCorrect) className += ' correct'
            if (isWrong) className += ' wrong'

            return (
              <View
                key={index}
                className={className}
                onClick={() => handleSelectAnswer(optionKey)}
              >
                <Text>{option}</Text>
              </View>
            )
          })}
        </View>
      </View>

      {showResult && (
        <View className='result-card'>
          <View className='result-header'>
            <Text className={selectedAnswer === currentQuestion.answer ? 'correct' : 'wrong'}>
              {selectedAnswer === currentQuestion.answer ? '✓ 回答正确' : '✗ 回答错误'}
            </Text>
          </View>
          <View className='explanation'>
            <Text className='explanation-title'>解析：</Text>
            <Text className='explanation-content'>{currentQuestion.explanation}</Text>
          </View>
        </View>
      )}

      <View className='actions'>
        {!showResult ? (
          <Button className='btn-submit' onClick={handleSubmit}>
            提交答案
          </Button>
        ) : (
          <Button className='btn-next' onClick={handleNext}>
            下一题
          </Button>
        )}
        
        <View className='nav-buttons'>
          <Button 
            className='btn-nav' 
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            上一题
          </Button>
          <Button 
            className='btn-nav' 
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
          >
            下一题
          </Button>
        </View>
      </View>
    </View>
  )
}

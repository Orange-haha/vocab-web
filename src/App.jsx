import { useEffect, useState } from 'react'
import words from './data/words.json'
import './App.css'

function App() {
  const [index, setIndex] = useState(0)
  const [showExample, setShowExample] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const [newWord, setNewWord] = useState({
  word: '',
  partOfSpeech: '',
  meaningCn: '',
  ukPhonetic: '',
  usPhonetic: '',
  exampleEn: '',
  exampleCn: '',
})

  const [speakAccent, setSpeakAccent] = useState('us')
  const [searchText, setSearchText] = useState('')
  const [selectedDay, setSelectedDay] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [customWords, setCustomWords] = useState(() => {
  const savedCustomWords = localStorage.getItem('cet4-custom-words')
  return savedCustomWords ? JSON.parse(savedCustomWords) : []
})

  const [wordStatus, setWordStatus] = useState(() => {
    const savedStatus = localStorage.getItem('cet4-word-status')
    return savedStatus ? JSON.parse(savedStatus) : {}
  })

const allWords = [...words, ...customWords]

  const days = [...new Set(words.map((item) => item.day))].sort(
    (a, b) => a - b
  )

const filteredWords = allWords.filter((item) => {
    const keyword = searchText.trim().toLowerCase()
    const status = wordStatus[item.id] || '未学习'

    const matchDay =
      selectedDay === 'all' || item.day === Number(selectedDay)

    const matchStatus =
      selectedStatus === 'all' || status === selectedStatus

    const matchKeyword =
      !keyword ||
      item.word.toLowerCase().includes(keyword) ||
      item.meaningCn.includes(keyword)

    return matchDay && matchStatus && matchKeyword
  })

  const currentWord = filteredWords[index]
  const currentStatus = currentWord
    ? wordStatus[currentWord.id] || '未学习'
    : '未学习'

  const knownCount = Object.values(wordStatus).filter(
    (status) => status === '认识'
  ).length

  const unknownCount = Object.values(wordStatus).filter(
    (status) => status === '不认识'
  ).length

  const unlearnedCount = allWords.length - knownCount - unknownCount
  const learnedCount = knownCount + unknownCount
const progressPercent = Math.round((learnedCount / allWords.length) * 100)
const selectedDayWords =
  selectedDay === 'all'
    ? []
    : words.filter((item) => item.day === Number(selectedDay))

const selectedDayKnownCount = selectedDayWords.filter(
  (item) => wordStatus[item.id] === '认识'
).length

const selectedDayUnknownCount = selectedDayWords.filter(
  (item) => wordStatus[item.id] === '不认识'
).length

function handleNewWordChange(event) {
  const { name, value } = event.target

  setNewWord((prevWord) => ({
    ...prevWord,
    [name]: value,
  }))
}

function saveNewWord() {
  const word = newWord.word.trim()
  const meaningCn = newWord.meaningCn.trim()

  if (!word || !meaningCn) {
    window.alert('请至少填写“单词”和“中文释义”。')
    return
  }

  const newCustomWord = {
    id: `custom-${Date.now()}`,
    word,
    partOfSpeech: newWord.partOfSpeech.trim() || '自定义',
    meaningCn,
    ukPhonetic: newWord.ukPhonetic.trim(),
    usPhonetic: newWord.usPhonetic.trim(),
    exampleEn: newWord.exampleEn.trim(),
    exampleCn: newWord.exampleCn.trim(),
    day: 0,
    tag: 'custom',
    level: 0,
  }

  const newCustomWords = [...customWords, newCustomWord]

  setCustomWords(newCustomWords)
  localStorage.setItem('cet4-custom-words', JSON.stringify(newCustomWords))

  setNewWord({
    word: '',
    partOfSpeech: '',
    meaningCn: '',
    ukPhonetic: '',
    usPhonetic: '',
    exampleEn: '',
    exampleCn: '',
  })

  setSearchText('')
  setSelectedDay('all')
  setSelectedStatus('all')
  setIndex(allWords.length)
  setShowAddForm(false)
  resetCard()

  window.alert('新单词已保存。')
}

const selectedDayLearnedCount =
  selectedDayKnownCount + selectedDayUnknownCount

const selectedDayProgressPercent = selectedDayWords.length
  ? Math.round((selectedDayLearnedCount / selectedDayWords.length) * 100)
  : 0

  function resetCard() {
    setShowExample(false)
    setShowAnswer(false)
  }

  function handleSearchChange(event) {
    setSearchText(event.target.value)
    setIndex(0)
    resetCard()
  }

  function handleDayChange(event) {
    setSelectedDay(event.target.value)
    setIndex(0)
    resetCard()
  }

  function handleStatusChange(event) {
    setSelectedStatus(event.target.value)
    setIndex(0)
    resetCard()
  }

  function clearSearch() {
    setSearchText('')
    setIndex(0)
    resetCard()
  }

  function saveStatus(newStatus) {
  if (!currentWord) {
    return
  }

  const newWordStatus = {
    ...wordStatus,
    [currentWord.id]: newStatus,
  }

  setWordStatus(newWordStatus)
  localStorage.setItem('cet4-word-status', JSON.stringify(newWordStatus))

  resetCard()

  setTimeout(() => {
    setIndex((prevIndex) => {
      if (filteredWords.length <= 1) {
        return 0
      }

      if (prevIndex >= filteredWords.length - 1) {
        return 0
      }

      return prevIndex + 1
    })
  }, 150)
}

function clearCurrentStatus() {
  if (!currentWord) {
    return
  }

  const newWordStatus = { ...wordStatus }
  delete newWordStatus[currentWord.id]

  setWordStatus(newWordStatus)
  localStorage.setItem('cet4-word-status', JSON.stringify(newWordStatus))
}

function deleteCurrentCustomWord() {
  if (!currentWord) {
    return
  }

  if (currentWord.tag !== 'custom') {
    window.alert('只能删除你自己添加的自定义单词，不能删除四级核心词。')
    return
  }

  const result = window.confirm(`确定要删除单词 "${currentWord.word}" 吗？`)

  if (!result) {
    return
  }

  const newCustomWords = customWords.filter(
    (item) => item.id !== currentWord.id
  )

  const newWordStatus = { ...wordStatus }
  delete newWordStatus[currentWord.id]

  setCustomWords(newCustomWords)
  setWordStatus(newWordStatus)

  localStorage.setItem('cet4-custom-words', JSON.stringify(newCustomWords))
  localStorage.setItem('cet4-word-status', JSON.stringify(newWordStatus))

  setIndex(0)
  resetCard()

  window.alert('自定义单词已删除。')
}

  function resetStudyRecord() {
    const result = window.confirm('确定要清空所有学习记录吗？清空后无法恢复。')

    if (!result) {
      return
    }

    setWordStatus({})
    localStorage.removeItem('cet4-word-status')
    setIndex(0)
    setSelectedStatus('all')
    resetCard()
  }

function startTodayUnlearned() {
  if (selectedDay === 'all') {
    window.alert('请先选择“背诵第几天”，再开始今日未学习单词。')
    return
  }

  setSelectedStatus('未学习')
  setIndex(0)
  resetCard()
}

function speakExample() {
  if (!currentWord || !currentWord.exampleEn) {
    window.alert('当前单词没有英文例句。')
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(currentWord.exampleEn)
  utterance.lang = 'en-US'
  utterance.rate = 0.85

  window.speechSynthesis.speak(utterance)
}

function speakWord(accent) {
  if (!currentWord) {
    return
  }

  if (!window.speechSynthesis) {
    window.alert('当前浏览器不支持朗读功能')
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(currentWord.word)
  utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US'
  utterance.rate = 0.85
  utterance.pitch = 1

  window.speechSynthesis.speak(utterance)
}

  function previousWord() {
    resetCard()

    setIndex((prevIndex) => {
      if (prevIndex <= 0) {
        return filteredWords.length - 1
      }

      return prevIndex - 1
    })
  }

  function nextWord() {
    resetCard()

    setIndex((prevIndex) => {
      if (prevIndex >= filteredWords.length - 1) {
        return 0
      }

      return prevIndex + 1
    })
  }

  function randomWord() {
    resetCard()

    if (filteredWords.length <= 1) {
      setIndex(0)
      return
    }

    let randomIndex = Math.floor(Math.random() * filteredWords.length)

    while (randomIndex === index) {
      randomIndex = Math.floor(Math.random() * filteredWords.length)
    }

    setIndex(randomIndex)
  }

useEffect(() => {
  function handleKeyDown(event) {
    const tagName = event.target.tagName.toLowerCase()

    if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
      return
    }

    if (event.code === 'Space') {
      event.preventDefault()
      setShowAnswer((prev) => !prev)
    }

    if (event.key === 'ArrowRight') {
      nextWord()
    }

    if (event.key === 'ArrowLeft') {
      previousWord()
    }

    if (event.key.toLowerCase() === 'r') {
      randomWord()
    }

    if (event.key.toLowerCase() === 's') {
  speakWord(speakAccent)
}

    if (event.key.toLowerCase() === 'k') {
      if (showAnswer) {
        saveStatus('认识')
      }
    }

    if (event.key.toLowerCase() === 'u') {
      if (showAnswer) {
        saveStatus('不认识')
      }
    }

    if (event.key.toLowerCase() === 'm') {
  if (showAnswer) {
    clearCurrentStatus()
  }
}
  }

  window.addEventListener('keydown', handleKeyDown)

  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
})

useEffect(() => {
  if (!autoSpeak || !currentWord) {
    return
  }

  const timer = setTimeout(() => {
    speakWord(speakAccent)
  }, 250)

  return () => {
    clearTimeout(timer)
  }
}, [autoSpeak, currentWord, speakAccent])

  return (
    <div className="app">
      <h1>英语四级 700 核心词汇</h1>

      <div className="stats">
        <div>
          <strong>{knownCount}</strong>
          <span>已认识</span>
        </div>

        <div>
          <strong>{unknownCount}</strong>
          <span>不认识</span>
        </div>

        <div>
          <strong>{unlearnedCount}</strong>
          <span>未学习</span>
        </div>
      </div>
       <div className="progress-box">
        <div className="progress-info">
          <span>学习进度</span>
          <strong>{progressPercent}%</strong>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p>
          已学习 {learnedCount} / {allWords.length} 个单词
        </p>
      </div>
       <div className="daily-goal">
        {selectedDay === 'all' ? (
          <>
            <h3>每日学习目标</h3>
            <p>建议先选择“背诵第几天”，按天完成学习任务。</p>
            这套词库当前一共 {allWords.length} 个单词，其中四级核心词分为 {days.length} 天背完。
          </>
        ) : (
          <>
            <h3>背诵第 {selectedDay} 天目标</h3>

            <div className="daily-goal-main">
              <strong>{selectedDayProgressPercent}%</strong>
              <span>
                已学习 {selectedDayLearnedCount} / {selectedDayWords.length} 个
              </span>
            </div>

            <div className="daily-goal-detail">
              <span>已认识：{selectedDayKnownCount}</span>
              <span>不认识：{selectedDayUnknownCount}</span>
              <span>
                未学习：
                {selectedDayWords.length - selectedDayLearnedCount}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="search-box">
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="搜索单词或中文释义，例如 alter / 改变"
        />

        {searchText && (
          <button onClick={clearSearch}>
            清空
          </button>
        )}
      </div>

      <div className="filter-box">
        <select value={selectedDay} onChange={handleDayChange}>
          <option value="all">全部单词</option>
          {days.map((day) => (
            <option key={day} value={day}>
              背诵第 {day} 天
            </option>
          ))}
        </select>
      </div>

      <div className="filter-box">
        <select value={selectedStatus} onChange={handleStatusChange}>
          <option value="all">全部状态</option>
          <option value="认识">只看已认识</option>
          <option value="不认识">只看不认识</option>
          <option value="未学习">只看未学习</option>
        </select>
      </div>

      <div className="action-buttons">
  <button className="focus-button" onClick={startTodayUnlearned}>
    今日只背未学习单词
  </button>

  <button className="add-word-button" onClick={() => setShowAddForm(!showAddForm)}>
    {showAddForm ? '收起新增单词' : '添加新单词'}
  </button>

  <button className="reset-button" onClick={resetStudyRecord}>
    清空学习记录
  </button>
</div>

{showAddForm && (
  <div className="add-word-form">
    <h3>添加新单词</h3>

    <input
      name="word"
      value={newWord.word}
      onChange={handleNewWordChange}
      placeholder="单词，例如 accurate"
    />

    <input
      name="partOfSpeech"
      value={newWord.partOfSpeech}
      onChange={handleNewWordChange}
      placeholder="词性，例如 adj."
    />

    <input
      name="meaningCn"
      value={newWord.meaningCn}
      onChange={handleNewWordChange}
      placeholder="中文释义，例如 准确的，精确的"
    />

    <input
      name="ukPhonetic"
      value={newWord.ukPhonetic}
      onChange={handleNewWordChange}
      placeholder="英式音标，例如 /ˈækjərət/"
    />

    <input
      name="usPhonetic"
      value={newWord.usPhonetic}
      onChange={handleNewWordChange}
      placeholder="美式音标，例如 /ˈækjərət/"
    />

    <textarea
      name="exampleEn"
      value={newWord.exampleEn}
      onChange={handleNewWordChange}
      placeholder="英文例句，例如 The report is accurate."
    />

    <textarea
      name="exampleCn"
      value={newWord.exampleCn}
      onChange={handleNewWordChange}
      placeholder="中文翻译，例如 这份报告是准确的。"
    />

    <div className="form-actions">
  <button onClick={saveNewWord}>
    保存新单词
  </button>

  <button
    className="reset-button"
    onClick={() =>
      setNewWord({
        word: '',
        partOfSpeech: '',
        meaningCn: '',
        ukPhonetic: '',
        usPhonetic: '',
        exampleEn: '',
        exampleCn: '',
      })
    }
  >
    清空表单
  </button>
</div>

<p className="form-tip">
  自定义单词会保存在当前浏览器中，刷新页面后仍然存在。
</p>
  </div>
)}

      {filteredWords.length === 0 ? (
        <div className="card">
          <p className="meaning">没有找到相关单词</p>
          <p className="day">请换一个关键词、背诵天数或掌握状态试试</p>
        </div>
      ) : (
        <div className="card">
          <p className="progress">
            第 {index + 1} / {filteredWords.length} 个
            {(searchText || selectedDay !== 'all' || selectedStatus !== 'all') &&
              `，当前筛选共 ${filteredWords.length} 个结果`}
          </p>

         <h2 className="word-title" onClick={() => speakWord(speakAccent)}>
  {currentWord.word}
</h2>

          <p className="phonetic">
            英音：{currentWord.ukPhonetic || '待补充'}
          </p>

          <p className="phonetic">
            美音：{currentWord.usPhonetic || '待补充'}
          </p>

       <div className="speak-buttons">
  <button onClick={() => speakWord('uk')}>
    英式朗读
  </button>

  <button onClick={() => speakWord('us')}>
    美式朗读
  </button>

  <button className="example-speak-button" onClick={speakExample}>
  朗读例句
</button>

  <button
    className={autoSpeak ? 'auto-speak-active' : ''}
    onClick={() => setAutoSpeak(!autoSpeak)}
  >
    {autoSpeak ? '自动朗读：开' : '自动朗读：关'}
  </button>

  <select
    className="accent-select"
    value={speakAccent}
    onChange={(event) => setSpeakAccent(event.target.value)}
  >
    <option value="us">自动美音</option>
    <option value="uk">自动英音</option>
  </select>
</div>

          <div className="button-group">
            <button onClick={() => setShowAnswer(!showAnswer)}>
              {showAnswer ? '隐藏答案' : '显示答案'}
            </button>
          </div>

          {showAnswer && (
            <>
              <p className="meaning">
                {currentWord.partOfSpeech} {currentWord.meaningCn}
              </p>

              <p className="day">
                背诵第 {currentWord.day} 天
              </p>

              <p className="status">
                当前状态：{currentStatus}
              </p>

          <div className="button-group">
  <button onClick={() => saveStatus('认识')}>
    认识
  </button>

  <button onClick={() => saveStatus('不认识')}>
    不认识
  </button>

  <button className="unlearn-button" onClick={clearCurrentStatus}>
    改为未学习
  </button>

  {currentWord.tag === 'custom' && (
    <button className="delete-word-button" onClick={deleteCurrentCustomWord}>
      删除自定义单词
    </button>
  )}
</div>

{showAnswer && (
  <div className="example">
    <p>{currentWord.exampleEn || '英文例句待补充'}</p>
    <p>{currentWord.exampleCn || '中文翻译待补充'}</p>
  </div>
)}
            </>
          )}

          <div className="button-group">
            <button onClick={previousWord}>
              上一个单词
            </button>

            <button onClick={randomWord}>
              随机单词
            </button>

            <button onClick={nextWord}>
              下一个单词
            </button>
          </div>
        </div>
 )}

  <div className="shortcut-hint">
  <span>空格：显示 / 隐藏答案</span>
  <span>← 上一个</span>
  <span>→ 下一个</span>
  <span>R 随机</span>
  <span>S 朗读</span>
  <span>K 认识</span>
  <span>U 不认识</span>
  <span>M 改为未学习</span>
</div>
    </div>
  )
}

export default App
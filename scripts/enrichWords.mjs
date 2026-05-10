import fs from 'fs/promises'
import path from 'path'

const inputPath = path.resolve('src/data/words.json')
const outputPath = path.resolve('src/data/words_enriched.json')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function pickPhonetic(phonetics, accent) {
  if (!Array.isArray(phonetics)) {
    return ''
  }

  const withText = phonetics.filter((item) => item.text)

  if (withText.length === 0) {
    return ''
  }

  const target = withText.find((item) => {
    const audio = item.audio || ''

    if (accent === 'uk') {
      return audio.includes('-uk') || audio.includes('uk.mp3')
    }

    if (accent === 'us') {
      return audio.includes('-us') || audio.includes('us.mp3')
    }

    return false
  })

  return target?.text || withText[0].text || ''
}

function pickExample(meanings) {
  if (!Array.isArray(meanings)) {
    return ''
  }

  for (const meaning of meanings) {
    if (!Array.isArray(meaning.definitions)) {
      continue
    }

    for (const definition of meaning.definitions) {
      if (definition.example) {
        return definition.example
      }
    }
  }

  return ''
}

async function fetchDictionaryData(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!Array.isArray(data) || data.length === 0) {
      return null
    }

    return data[0]
  } catch (error) {
    return null
  }
}

async function main() {
  const rawText = await fs.readFile(inputPath, 'utf-8')
  const words = JSON.parse(rawText)

  const enrichedWords = []
  const failedWords = []

  for (let i = 0; i < words.length; i++) {
    const item = words[i]
    const word = item.word

    console.log(`正在处理 ${i + 1}/${words.length}: ${word}`)

    const dictionaryData = await fetchDictionaryData(word)

    if (!dictionaryData) {
      failedWords.push(word)
      enrichedWords.push({
        ...item,
        notes: `${item.notes || ''} | 未从词典接口找到数据`.trim(),
      })

      await sleep(300)
      continue
    }

    const ukPhonetic =
      item.ukPhonetic || pickPhonetic(dictionaryData.phonetics, 'uk')

    const usPhonetic =
      item.usPhonetic || pickPhonetic(dictionaryData.phonetics, 'us')

    const exampleEn =
      item.exampleEn || pickExample(dictionaryData.meanings)

    enrichedWords.push({
      ...item,
      ukPhonetic,
      usPhonetic,
      exampleEn,
      exampleCn: item.exampleCn || '',
      notes: item.notes || '',
    })

    await sleep(300)
  }

  await fs.writeFile(outputPath, JSON.stringify(enrichedWords, null, 2), 'utf-8')

  console.log('')
  console.log('处理完成。')
  console.log(`输出文件：${outputPath}`)
  console.log(`未找到词典数据的单词数量：${failedWords.length}`)

  if (failedWords.length > 0) {
    console.log('未找到的单词：')
    console.log(failedWords.join(', '))
  }
}

main()
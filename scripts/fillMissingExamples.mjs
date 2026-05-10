import fs from 'fs/promises'
import path from 'path'

const inputPath = path.resolve('src/data/words.json')
const outputPath = path.resolve('src/data/words_examples_filled.json')

function makeExample(word, partOfSpeech, meaningCn) {
  const pos = (partOfSpeech || '').toLowerCase()
  const meaning = meaningCn || ''

  if (pos.includes('v')) {
    return `We should learn how to ${word} this problem in a better way.`
  }

  if (pos.includes('n')) {
    return `The ${word} is important in our daily life.`
  }

  if (pos.includes('a') || pos.includes('adj')) {
    return `It is important to be ${word} in this situation.`
  }

  if (pos.includes('ad') || pos.includes('adv')) {
    return `He finished the work ${word}.`
  }

  if (meaning.includes('人') || meaning.includes('者')) {
    return `He is a good ${word} in the team.`
  }

  return `This word, ${word}, is useful in English learning.`
}

async function main() {
  const rawText = await fs.readFile(inputPath, 'utf-8')
  const words = JSON.parse(rawText)

  const newWords = words.map((item) => {
    if (item.exampleEn && item.exampleEn.trim()) {
      return item
    }

    return {
      ...item,
      exampleEn: makeExample(item.word, item.partOfSpeech, item.meaningCn),
      notes: `${item.notes || ''} | 英文例句由脚本补充`.trim(),
    }
  })

  await fs.writeFile(outputPath, JSON.stringify(newWords, null, 2), 'utf-8')

  console.log('英文例句补充完成。')
  console.log(`输出文件：${outputPath}`)
}

main()
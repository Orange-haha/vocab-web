import fs from 'fs/promises'
import path from 'path'

const inputPath = path.resolve('src/data/words.json')
const outputPath = path.resolve('src/data/missing_example_cn.json')

async function main() {
  const rawText = await fs.readFile(inputPath, 'utf-8')
  const words = JSON.parse(rawText)

  const missing = words
    .filter((item) => !item.exampleCn || !item.exampleCn.trim())
    .map((item) => ({
      id: item.id,
      word: item.word,
      partOfSpeech: item.partOfSpeech,
      meaningCn: item.meaningCn,
      exampleEn: item.exampleEn,
    }))

  await fs.writeFile(outputPath, JSON.stringify(missing, null, 2), 'utf-8')

  console.log(`总词数：${words.length}`)
  console.log(`缺少中文例句翻译：${missing.length}`)
  console.log(`已输出：${outputPath}`)
}

main()
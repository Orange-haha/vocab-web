import fs from 'fs/promises'
import path from 'path'

const wordsPath = path.resolve('src/data/words.json')
const batchPath = path.resolve('src/data/example_batch_51_700.json')
const outputPath = path.resolve('src/data/words_final_full_700.json')

async function main() {
  const wordsText = await fs.readFile(wordsPath, 'utf-8')
  const batchText = await fs.readFile(batchPath, 'utf-8')

  const words = JSON.parse(wordsText)
  const batch = JSON.parse(batchText)

  if (words.length !== 700) {
    throw new Error(`当前 words.json 不是 700 个单词，而是 ${words.length} 个。请先停止。`)
  }

  if (batch.length !== 650) {
    throw new Error(`批次文件不是 650 个单词，而是 ${batch.length} 个。请先停止。`)
  }

  const batchMap = new Map(
    batch.map((item) => [
      item.id,
      {
        word: item.word,
        exampleEn: item.exampleEn,
        exampleCn: item.exampleCn,
      },
    ])
  )

  let updatedCount = 0
  const unmatchedItems = []
  const missingItems = []

  const newWords = words.map((item) => {
    const batchItem = batchMap.get(item.id)

    if (!batchItem) {
      if (item.id >= 51 && item.id <= 700) {
        missingItems.push({
          id: item.id,
          word: item.word,
        })
      }

      return item
    }

    if (batchItem.word !== item.word) {
      unmatchedItems.push({
        id: item.id,
        wordInWords: item.word,
        wordInBatch: batchItem.word,
      })

      return item
    }

    updatedCount++

    return {
      ...item,
      exampleEn: batchItem.exampleEn,
      exampleCn: batchItem.exampleCn,
      notes: `${item.notes || ''} | 51-700例句已重写`.trim(),
    }
  })

  if (newWords.length !== 700) {
    throw new Error(`合并后的词库不是 700 个，而是 ${newWords.length} 个。`)
  }

  if (updatedCount !== 650) {
    throw new Error(`应该更新 650 个，但实际更新了 ${updatedCount} 个。`)
  }

  if (unmatchedItems.length > 0) {
    console.log('发现 id 对应但 word 不一致的项目：')
    console.log(JSON.stringify(unmatchedItems, null, 2))
    throw new Error('存在 word 不一致，已停止生成。')
  }

  if (missingItems.length > 0) {
    console.log('51-700 中这些单词没有在批次文件里找到：')
    console.log(JSON.stringify(missingItems, null, 2))
    throw new Error('存在缺失单词，已停止生成。')
  }

  await fs.writeFile(outputPath, JSON.stringify(newWords, null, 2), 'utf-8')

  console.log('安全合并完成。')
  console.log(`基础词库数量：${words.length}`)
  console.log(`批次文件数量：${batch.length}`)
  console.log(`成功更新：${updatedCount} 个单词`)
  console.log(`输出文件：${outputPath}`)
}

main()
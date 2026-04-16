import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const rootDir = dirname(__filename)
const excludeDirs = new Set([".git", "node_modules", "scripts", "assets"])
const templatePath = path.join(rootDir, "story-template.md")

// 读取模板
const template = fs.readFileSync(templatePath, "utf-8")

/**
 * 计算文件夹内所有 md 文件的总字数（仅统计中文字符）
 * @param {string} folderPath - 故事文件夹路径
 * @returns {string} 格式化的字数，如 "约 6 千字" 或 "约 110 千字"
 */
function calculateWordCount(folderPath) {
  let totalChars = 0

  const files = fs.readdirSync(folderPath)

  for (const file of files) {
    // 只统计 .md 文件，排除 README.md 和 config.json
    if (file.endsWith(".md") && file !== "README.md") {
      const content = fs.readFileSync(path.join(folderPath, file), "utf-8")
      // 去除空格、换行、标点符号后统计中文字符数
      const text = content.replace(/[ \n\r\t，。！？；：""''（）【】《》]/g, "")
      const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
      totalChars += chineseChars
    }
  }

  // 转换为字数（千字为单位）
  if (totalChars >= 10000) {
    const thousandWords = Math.round(totalChars / 1000)
    return `约 ${thousandWords} 千字`
  } else if (totalChars >= 1000) {
    const thousandWords = Math.round(totalChars / 1000)
    return `约 ${thousandWords} 千字`
  } else if (totalChars > 0) {
    return `约 ${totalChars} 字`
  } else {
    return "字数待补充"
  }
}

// 渲染模板
function renderTemplate(tmpl, data) {
  let result = tmpl

  // 处理 {{#if key}}...{{else}}...{{/if}}
  result = result.replace(
    /\{\{#if ([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, key, ifContent, elseContent) => {
      return data[key] ? ifContent : elseContent
    },
  )

  // 处理条件块 {{#if key}}...{{/if}}（无 else）
  result = result.replace(
    /\{\{#if ([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, key, content) => {
      return data[key] ? content : ""
    },
  )

  // 处理条件相等 {{#if (eq key "value")}}...{{/if}}
  result = result.replace(
    /\{\{#if \(eq "([^"]+)" "([^"]+)"\)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, key, value, content) => {
      return data[key] === value ? content : ""
    },
  )

  // 处理普通变量 {{key}}
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return data[key.trim()] !== undefined ? data[key.trim()] : ""
  })

  return result
}

// 扫描故事文件夹
const items = fs.readdirSync(rootDir)
const storyFolders = items
  .filter((item) => {
    if (!fs.statSync(path.join(rootDir, item)).isDirectory()) return false
    if (excludeDirs.has(item)) return false
    return /^\d+-/.test(item)
  })
  .sort()

const stories = []

for (const folder of storyFolders) {
  const folderPath = path.join(rootDir, folder)
  const configPath = path.join(folderPath, "config.json")

  if (!fs.existsSync(configPath)) {
    console.log(`⚠️ 跳过 ${folder}：缺少 config.json`)
    continue
  }

  // 读取配置
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))

  // 如果没有 wordCount 字段，自动计算
  if (!config.wordCount) {
    config.wordCount = calculateWordCount(folderPath)
    console.log(`📊 ${folder}: 自动计算字数为 ${config.wordCount}`)
  }

  // 生成该故事的 README
  const readmeContent = renderTemplate(template, config)
  fs.writeFileSync(path.join(folderPath, "README.md"), readmeContent, "utf-8")

  console.log(`✅ 生成 ${folder}/README.md`)

  // 收集信息用于根目录 README
  stories.push({
    folder: folder,
    title: config.title,
    type: config.type,
    wordCount: config.wordCount,
    summary:
      config.summary && config.summary.length > 80
        ? config.summary.slice(0, 80) + "..."
        : config.summary || "无简介",
  })
}

// 生成根目录 README
let rootReadme = `# 我的故事集

欢迎来到我的创作仓库。

## 📖 故事列表

| 故事 | 类型 | 字数 | 简介 |
|------|------|------|------|
`

for (const story of stories) {
  rootReadme += `| [${story.title}](./${story.folder}) | ${story.type} | ${story.wordCount} | ${story.summary} |\n`
}

rootReadme += `

## ☕ 赞助支持

<details>
<summary>如果你喜欢我的创作，可以请我喝杯咖啡。</summary>

<img src="./assets/wechat.jpg" width="200" height="280" alt="微信收款码" />
<img src="./assets/alipay.jpg" width="200" height="280" alt="支付宝收款码" />

</details>
`

rootReadme += `

## ⚖️ 许可证

原创故事采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可证。

二创故事版权归原作者所有，禁止商用。

---

*本 README 由脚本自动生成，请勿手动编辑。*
`

fs.writeFileSync(path.join(rootDir, "README.md"), rootReadme, "utf-8")
console.log(`\n✅ 根目录 README.md 已生成，共 ${stories.length} 个故事`)

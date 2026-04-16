# 《{{title}}》

## 📝 基本信息

- **类型**：{{type}}
- **字数**：{{wordCount}}
- **状态**：{{status}}
- **首次发布**：{{created}}
- **最后更新**：{{updated}}

## 📖 简介

{{summary}}

## 📚 阅读指引
{{#if isMultiChapter}}
- 按章节顺序阅读：`chapter-1.md` → `chapter-2.md` ...
  {{else}}
- 正文文件：`text.md`
  {{/if}}
## ⚖️ 声明
{{#if (eq type "原创")}}
本作品采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可证。你可以署名共享、非商业使用，修改后的作品需沿用相同许可。
{{else}}
本作品是基于《{{originalWork}}》（原作：{{originalAuthor}}）的同人创作。原作角色、世界观等元素的版权归原作者及版权方所有。

本人对原创情节和对话主张著作权，采用 CC BY-NC-SA 4.0 许可。**禁止将本故事用于任何商业用途。**
{{/if}}

---

_本 README 由脚本自动生成，请勿手动编辑。_

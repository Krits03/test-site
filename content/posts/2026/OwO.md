---
title: MarkDown测试
description: 这是一个MarkDown语法测试文档
date: 2026-04-07 00:06:00
updated: 2026-04-07 00:06:01
hideInfo: true
aside: [toc, site]
---
# Markdown 语法测试文档

> 本文档用于测试 Markdown 渲染器对各类语法的支持情况。
> 引用块可以跨行书写，也可以嵌套。

---

## 1. 标题

# H1 一级标题
## H2 二级标题
### H3 三级标题
#### H4 四级标题
##### H5 五级标题
###### H6 六级标题

另一种写法（Setext）：

一级标题
===

二级标题
---

## 2. 段落与换行

这是第一个段落。段落之间用空行分隔。

这是第二个段落。  
这一行前面有两个空格，因此会强制换行。

## 3. 文本强调

- **粗体文本**
- *斜体文本*
- ***粗斜体文本***
- ~~删除线文本~~
- `行内代码`
- 普通文本与 **粗体**、*斜体* 混排
- 下划线（HTML）：<u>下划线文本</u>

## 4. 列表

### 无序列表

- 苹果
- 香蕉
  - 嵌套项 A
  - 嵌套项 B
    - 更深一层
- 橙子

### 有序列表

1. 第一步
2. 第二步
   1. 子步骤 2.1
   2. 子步骤 2.2
3. 第三步

### 任务列表

- [x] 已完成的任务
- [ ] 未完成的任务
- [ ] 待办事项

## 5. 引用

> 这是一级引用。
>
> > 这是嵌套的二级引用。
>
> 回到一级引用。
>
> —— 某个名人

## 6. 代码

行内代码：使用 `console.log("Hello")` 输出日志。

缩进式代码块（4 个空格）：

    function hello() {
      return "Hello, World!";
    }

围栏代码块（JavaScript）：

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
```

围栏代码块（Python）：

```python
def greet(name: str) -> str:
    """返回问候语"""
    return f"Hello, {name}!"

print(greet("Markdown"))
```

围栏代码块（JSON）：

```json
{
  "name": "markdown-test",
  "version": "1.0.0",
  "tags": ["markdown", "test"],
  "enabled": true,
  "count": 42
}
```

围栏代码块（Bash）：

```bash
#!/bin/bash
echo "当前目录：$(pwd)"
for i in {1..3}; do
  echo "第 $i 次循环"
done
```

无语言标注的代码块：

```
纯文本代码块
没有语法高亮
```

## 7. 链接

- 行内链接：[OpenAI](https://openai.com)
- 带标题的链接：[Markdown 规范](https://spec.commonmark.org "CommonMark 规范")
- 引用式链接：[Google][1]
- 自动链接：<https://www.example.com>
- 邮箱链接：<someone@example.com>
- 裸链接：https://github.com

[1]: https://www.google.com

## 8. 图片

![不链接的图片](https://vercel-blob.api.kr033.top/api/download/post/md-test/20260926/1790430002038-1101100 1101001 1100001 1101110 1100111 1111000 1101001 1101110 101110 1111000 1111001 1111010 101111 1100001 1110000 1101001 101111 1110110 110001 101111 1101100 1101001 1100001 1101110 1100111 1111000 1101001 1101110 111111.png)

带链接的图片：

[![带链接的图片](https://vercel-blob.api.kr033.top/api/download/post/md-test/20260926/1790430115603-key=e0153680b7d4a1cbe5287edb83f7f733.png)](https://uutool.cn/txt2bin/)

## 9. 表格

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 内容 A |  内容 B  |  内容 C |
| 较长的单元格内容 | 短 | 12345 |
| `代码` | **粗体** | *斜体* |

简单表格：

| 名称 | 数量 |
|------|------|
| 苹果 | 3 |
| 香蕉 | 5 |

转义竖线：| 含 \| 竖线的单元格 | 正常 |

## 10. 分割线

三种写法效果相同：

---

***

___

## 11. 转义字符

以下字符可通过反斜杠转义显示：

\* 不是斜体 \*
\# 不是标题
\[ 不是链接 \]
\` 不是代码 \`

## 12. HTML 标签

<div align="center">居中的 HTML 内容</div>

按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制。

换行标签：第一行<br>第二行

<details>
<summary>点击展开详情</summary>

这里是折叠内容。

</details>

## 13. 脚注

这是一段带脚注的文字[^1]，还有第二个脚注[^note]。

[^1]: 这是第一个脚注的内容。
[^note]: 这是命名脚注的内容。

## 14. 数学公式（部分渲染器支持）

行内公式：$E = mc^2$

块级公式：

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

## 15. Emoji（部分渲染器支持）

:smile: :rocket: :+1: :tada: :heart:

## 16. 定义列表（部分渲染器支持）

术语一
: 术语一的定义说明

术语二
: 术语二的定义说明
: 术语二的另一个定义

---

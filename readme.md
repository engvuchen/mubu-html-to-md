# mubu-html-to-md

1. 使用 `posthtml-parser` 解析幕布导出的 HTML，生成 MD 文件；
2. 标题转为节点；最大支持节点层级是 9；
3. 若使用 `mdanki` 转到 md 到 anki，建议使用序号区分内容。例：三级标题建议使用`（1）`、四级标题用 `1、`;

![](https://api2.mubu.com/v3/document_image/c3da97c1-dad1-4985-9b91-ffec5c79724a-371922.jpg)

使用案例：

打开 test.html 所在的文件夹，使用 powershell 或任意终端执行以下指令：

1. 下载后使用

```bash
npm i -g mubu-html2md
npx mubu-html2md --convert test.html test.md
npx mubu-html2md --convert test.html test.md
```

2. 使用远程版本

```bash
npx mubu-html2md --convert test.html test.md
```

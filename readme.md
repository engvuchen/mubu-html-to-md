# mubu-html-to-md

1. 使用 `posthtml-parser` 解析幕布导出的 HTML，生成 MD 文件；
2. 标题转为节点；最大支持节点层级是 9；

使用案例：

1. 下载后使用

```bash
npm i -g mubu-html2md
npx mubu-html2md --convert test.html test.md
npx mubu-html2md --convert test.html test.md
```

2. 使用远程版本

```bash
mubu-html2md --convert test.html test.md
```

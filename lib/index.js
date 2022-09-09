const { parser } = require('posthtml-parser');
const fs = require('fs');
const { walk, pipeSearch, getDate, cmdMap } = require('../lib/util');
let [, , , sourceFileName, targetFileName] = process.argv;

let missParams = [
  {
    data: sourceFileName,
    tips: [`eg: ${cmdMap.convert}`, 'need sourceFile'],
  },
  {
    data: targetFileName,
    tips: [`eg: ${cmdMap.convert}`, 'need targetFile'],
  },
].some(({ data, tips }) => {
  if (!data) {
    console.log(tips.join('\n'));
    return true;
  }
});
if (missParams) return;
if (!sourceFileName.endsWith('.html')) sourceFileName = `${sourceFileName}.html`;
if (!targetFileName.endsWith('.md')) targetFileName = `${targetFileName}.md`;
sourceFileName = `${process.cwd()}/${sourceFileName}`;
targetFileName = `${process.cwd()}/${targetFileName}`;

const html = fs.readFileSync(sourceFileName, 'utf-8');
fs.writeFileSync(targetFileName, html2md(html));
console.log(`Success. See ${targetFileName}`);

function html2md(html) {
  let docTypeHtmlList = parser(html);
  let bodyJSON = pipeSearch(['html', 'body'], docTypeHtmlList);
  let title = pipeSearch(['div'], bodyJSON?.content)?.content?.[0] || `${getDate()}`;
  let md = `# ${title}\n\n`;
  md = walk(md, bodyJSON?.content);
  return md;
}

module.export = {
  html2md,
};

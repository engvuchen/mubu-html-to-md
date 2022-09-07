const { parser } = require('posthtml-parser');
const fs = require('fs');
const { walk, pipeSearch, getDate } = require('../lib/index');
const { cmdMap } = require('../lib/util');
const [, , , sourceFileName, targetFileName] = process.argv;

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
if (!sourceFileName.endsWith('.html')) sourceFileName = `${source}.html`;
if (!targetFileName.endsWith('.md')) targetFileName = `${targetFileName}.md`;

const html = fs.readFileSync(sourceFileName, 'utf-8');
let docTypeHtmlList = parser(html);
let bodyJSON = pipeSearch(['html', 'body'], docTypeHtmlList);
let title = pipeSearch(['div'], bodyJSON?.content)?.content?.[0] || `${getDate()}`;
let md = `# ${title}\n`;
walk(bodyJSON?.content);
fs.writeFileSync(targetFileName, md);

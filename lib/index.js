const fs = require('fs');
const { html2md, cmdMap } = require('../lib/util');

function callByCmd() {
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
}

module.export = {
  html2md,
  callByCmd,
};

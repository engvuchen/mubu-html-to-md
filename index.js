const { parser } = require('posthtml-parser');
const fs = require('fs');
const attrReg = /\[(.+)\]/g;
const tagReg = /^(\w+)/;

const html = fs.readFileSync('./01-Vue+常见面试题.html', 'utf-8');

// console.log(parser(html)) // Logs a PostHTML AST

let docTypeHtmlList = parser(html);
// let bodyJSON = docTypeHtmlList?.find(currItem => currItem.tag === 'html')?.content?.find(currItem => currItem.tag === 'body');
let bodyJSON = pipeSearch(['html', 'body'], docTypeHtmlList);

// console.log('docTypeHtmlList', docTypeHtmlList);

console.log('bodyJSON', bodyJSON);

let title = pipeSearch(['div'], bodyJSON?.content)?.content?.[0] || `${getDate()}`;
let md = `# ${title}\n`;
function walk(list = [], depth = 2) {
  let { length: len } = list;
  if (!len) return;
  for (let i = 0; i < len; i++) {
    let curr = list[i];
    if (typeof curr !== 'object') continue;

    // ul > li > div.content + div.children
    let title = pipeSearch(['div[class="content"]'], curr?.content)?.content[0]?.content?.[0];
    if (title) {
      if (depth < 4) title = `${title.padStart(title.length + depth, '#')}`;
      md += title;
    }

    let content = pipeSearch(['div[class="content"]'])?.content;
    if (Array.isArray(content) && content.length) walk(content, depth + 1);
  }
}
let ulJSON = pipeSearch(['ul'], bodyJSON?.content);
walk(ulJSON?.content);

function pipeSearch(tags = [], list = []) {
  let result;

  tags.reduce((accu, currTag) => {
    if (!Array.isArray(list) || (Array.isArray(list) && !list.length)) {
      console.error('pipeSearch: list is empty');
      return;
    }

    let conditions = genConditions(currTag);
    // console.log('conditions', conditions)

    let foundResult = list.find(currItem => {
      if (typeof currItem !== 'object') return;
      // todo:
      // let conditions = [attrName ? currItem?.attrs?.[attrName] === attrVal : true, currItem.tag === tag];
      return conditions.every(condition => condition(currItem));
    });

    if (!foundResult) return;
    list = foundResult?.content;
    result = foundResult;
  }, {});

  console.log('result', result);

  return result;
}
function genConditions(search) {
  let attrConditions =
    Array.from(search.matchAll(attrReg))?.reduce((accu, currList) => {
      let [, attrStr] = currList;
      if (!attrStr) return; // 获取 div[class="content"] 方括号的内容
      let [attrName, attrVal] = attrStr.split('=');
      accu.push(data => {
        // console.log('data', data);
        // console.log('attrVal', attrVal);

        return data?.attrs?.[attrName] === attrVal;
      });
      return accu;
    }, []) || [];

  let [, tag] = tagReg.exec(search) || [];
  attrConditions.push(data => {
    return data?.tag === tag;
  });

  // console.log('attrConditions', attrConditions);
  return attrConditions;
}
function getDate() {
  let date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
    2,
    '0'
  )}`;
}

fs.writeFileSync('./result.md', md);

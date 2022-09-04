const { parser } = require('posthtml-parser');
const fs = require('fs');
const attrReg = /\[(.+)\]/g;
const tagReg = /^(\w+)/;

const html = fs.readFileSync('./01-Vue+常见面试题.html', 'utf-8');
let docTypeHtmlList = parser(html);
let bodyJSON = pipeSearch(['html', 'body'], docTypeHtmlList);
let title = pipeSearch(['div'], bodyJSON?.content)?.content?.[0] || `${getDate()}`;
let md = `# ${title}\n`;
walk(bodyJSON?.content);

function walk(list = [], depth = 2) {
  let { length: len } = list;
  if (!len) return;

  // ul > li * n > ( div.content + div.image-list + div.note +  div.children )
  let ulList = search('ul[class="node-list"]', list) || [];
  let { length: ulListLen } = ulList;
  for (let i = 0; i < ulListLen; i++) {
    let ul = ulList[i];
    let liList = search('li[class="node"]', ul.content) || [];
    let { length: liListLen } = liList;
    if (!liListLen) continue;
    for (let i = 0; i < liListLen; i++) {
      let li = liList[i];

      // todo: title 节点旁边，还有 div.image-list / div.note
      let titleDiv = search('div[class="content"]', li.content)[0];
      let title = titleDiv?.content?.reduce((accu, curr) => {
        accu += curr?.content?.[0] || '' + '';
        return accu;
      }, '');
      if (title) {
        if (depth < 10) title = `${getMdTitle(depth) + title}`;
        md += `${title}\n`;
      }
      // let ulImageList = search('ul[class="image-list"]', li.content)[0];

      let childContentList = search('div[class="children"]', li.content) || [];
      let { length: childContentListLen } = childContentList;
      for (let i = 0; i < childContentListLen; i++) {
        walk(childContentList[i]?.content || [], depth + 1);
      }
    }
  }
}
function padImgsToMd(liContentList) {
  let ulImageList = search('ul[class="image-list"]', li.content)[0];
}

// 找到一个 list 中符合 指定条件的 项 - 遍历第一个匹配的内容
function pipeSearch(tags = [], list = []) {
  let result;

  tags.forEach(currTag => {
    if (!Array.isArray(list) || (Array.isArray(list) && !list.length)) {
      return;
    }
    let conditions = genConditions(currTag);
    let foundResult = list.find(currItem => {
      if (typeof currItem !== 'object') return;
      if (conditions.some(conditionFn => !conditionFn(currItem))) return false;
      return true;
    });
    if (!foundResult) return;
    list = foundResult?.content;
    result = foundResult;
  });

  // console.log('result', result);
  return result;
}
function search(tag = '', list) {
  if (!Array.isArray(list) || (Array.isArray(list) && !list.length)) {
    return;
  }
  let conditions = genConditions(tag);
  return list?.filter(currItem => {
    if (typeof currItem !== 'object') return;
    if (conditions.some(conditionFn => !conditionFn(currItem))) return false;
    return currItem;
  });
}

function genConditions(searchStr = '') {
  // 构造标签条件
  let tagConditionFn = (tag, data) => {
    // console.log('tagFn', data.tag, tag);
    return data?.tag === tag;
  };
  let tagConditions = [];
  let [, tag = ''] = tagReg.exec(searchStr) || [];
  if (tag) tagConditions.push(tagConditionFn.bind(this, tag));

  // 构造属性条件
  let attrConditions =
    Array.from(searchStr.matchAll(attrReg))?.reduce((accu, currList) => {
      let [, attrStr] = currList;
      if (!attrStr) return; // 获取 div[class="content"] 方括号的内容
      let [attrName, attrVal] = attrStr.split('=');
      attrVal = attrVal.replace(/"/g, '');
      if (attrVal) {
        let attrConditionFn = (attrName, attrVal, data) => {
          // console.log('attrValFn', data?.attrs?.[attrName], attrVal);

          return data?.attrs?.[attrName].includes(attrVal);
        };
        accu.push(attrConditionFn.bind(this, attrName, attrVal));
      }
      return accu;
    }, []) || [];

  return [...tagConditions, ...attrConditions];
}
function getDate() {
  let date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
    2,
    '0'
  )}`;
}
function getMdTitle(depth) {
  return new Array(depth).fill('#').join('') + ' ';
}

fs.writeFileSync('./result.md', md);

const { parser } = require('posthtml-parser');
const path = require('path');
const fs = require('fs');
const pkg = readPkg();
const cmdMap = {
  version: `${pkg.name} --version, -v`,
  convert: `${pkg.name} --convert sourceFile targetFile`,
};
const attrReg = /\[(.+)\]/g;
const tagReg = /^(\w+)/;

function walk(md = '', list = [], depth = 2) {
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

      // 处理标题 - 加粗/代码文本/
      let titleDiv = search('div[class="content"]', li.content)[0];
      let title =
        titleDiv?.content?.reduce((accu, curr) => {
          let txtInSpan = curr?.content?.[0];
          if (typeof txtInSpan === 'string') {
            let className = curr?.attrs?.class;
            if (className?.includes('codepan')) txtInSpan = `\`${txtInSpan}\``;
            if (className?.includes('italic')) txtInSpan = `*${txtInSpan}*`;
            if (className?.includes('bold')) txtInSpan = `**${txtInSpan}**`;
            accu += txtInSpan;
          }
          return accu;
        }, '') || '';
      if (title) {
        if (depth < 10) title = `${getMdTitle(depth) + title}`;
        md += `${title}\n\n`;
      }
      // console.log('process md', md);
      // 处理图片
      let ulImage = search('ul[class="image-list"]', li.content)?.[0] || {}; // 多张图片，只有一个图片列表
      let liImageItemList = search('li[class="image-item"]', ulImage.content) || [];
      let { length: liImageItemListLen } = liImageItemList;
      for (let i = 0; i < liImageItemListLen; i++) {
        let currImageItem = liImageItemList[i];
        let liImageItem = search('img', currImageItem.content)?.[0] || {};
        let { src } = liImageItem.attrs;
        if (src) md += `![](${src})\n\n`;
      }
      // 处理标题备注
      let divNote = search('div[class="note"]', li.content)?.[0] || {}; // 多个标题备注，只有一个图片列表
      let divNoteSpan = search('span', divNote.content)?.[0] || {};
      let note = divNoteSpan?.content?.[0] || '';
      if (note) md += `> ${note} \n\n`;

      // 处理子节点
      let childContentList = search('div[class="children"]', li.content) || [];
      let { length: childContentListLen } = childContentList;
      for (let i = 0; i < childContentListLen; i++) {
        md = walk(md, childContentList[i]?.content || [], depth + 1);
      }
    }
    return md;
  }
}
function html2md(html) {
  let docTypeHtmlList = parser(html);
  let bodyJSON = pipeSearch(['html', 'body'], docTypeHtmlList);
  let title = pipeSearch(['div'], bodyJSON?.content)?.content?.[0] || `${getDate()}`;
  let md = `# ${title}\n\n`;
  md = walk(md, bodyJSON?.content);
  return md;
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
function readPkg() {
  // let pkgPath = `${process.cwd()}/package.json`;
  let pkgPath = `${path.join(__dirname, '../package.json')}`;
  return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
}
function help() {
  const list = ['Usage', ...Object.values(cmdMap)];
  console.log(list.join('\n'));
}
function version() {
  // let pkg = readPkg(`${path.join(__dirname, '../package.json')}`);
  console.log(`${pkg.name}: ${pkg.version}`);
}

module.exports = {
  walk,
  html2md,
  pipeSearch,
  getDate,
  readPkg,
  help,
  version,
  pkg,
  cmdMap,
};

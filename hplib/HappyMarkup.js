if (typeof require !== "undefined") {
  HappyTemplate = require("./HappyTemplate.js");
}

const HappyMarkup = {
  findNextOpeningTag: function (src, tag, start) {
    start = start || 0;

    let tagStart = start;
    for (tagStart = src.indexOf(tag, tagStart); tagStart !== -1;
      tagStart = src.indexOf(tag, tagStart)) {
      let openingBracket = src.lastIndexOf("<", tagStart);
      if (openingBracket === tagStart - 1) {
        tagStart = openingBracket;
        break;
      }
      let inbetween = src.substring(openingBracket, tagStart);
      if (inbetween.trim().length < 1) {
        break;
      }
      tagStart++;
    }

    return tagStart;
  },

  getAttributes: function (tag) {
    return tag.split(" ").reduce((attrs, str) => {
      if (str.indexOf("=") === -1) {
        return attrs;
      }

      const key = str.substr(0, str.indexOf("=")).trim();
      let value = str.substr(str.indexOf("=") + 1).trim();
      const firstSingleQuote = value.indexOf("'");
      const firstDoubleQuote = value.indexOf('"');
      let quotationMark = '"';
      let firstQuotationMark = firstDoubleQuote;
      if (firstSingleQuote < firstDoubleQuote && firstSingleQuote !== -1) {
        quotationMark = "'";
        firstQuotationMark = firstSingleQuote;
      }
      value = value.substring(firstQuotationMark + 1,
        value.lastIndexOf(quotationMark));
      attrs[key] = value;
      return attrs;
    }, {});
  },

  getNextElementOfType: function (rawSrc, tagName, start) {
    start = start || 0;
    const src = rawSrc.substring(start).toLocaleLowerCase();
    const tag = tagName.toLocaleLowerCase();

    const tagStart = HappyMarkup.findNextOpeningTag(src, tag);
    if (tagStart === -1) {
      return null;
    }

    const closer = src.indexOf(">", tagStart) + 1;
    if (closer === 0) {
      return null;
    }
    const attributes = HappyMarkup.getAttributes(
      rawSrc.substring(tagStart + start, closer + start));

    let tagEnd = tagStart + 1;
    let lastTagEnd = src.indexOf(tag, tagStart) + 1;
    const closingTag = `</${tag}>`;
    for (tagEnd = src.indexOf(closingTag, tagEnd); tagEnd !== -1;
      tagEnd = src.indexOf(closingTag, tagEnd)) {
      const nextOpeningTag = HappyMarkup.findNextOpeningTag(src, tag,
        lastTagEnd);
      if (nextOpeningTag === -1) {
        break;
      }
      if (nextOpeningTag > tagEnd) {
        break;
      }
      lastTagEnd = tagEnd + closingTag.length;
      tagEnd++;
    }
    if (tagEnd === -1) {
      return null;
    }

    tagEnd = src.indexOf(">", tagEnd) + 1;

    const block = {
      start: tagStart + start,
      end: tagEnd + start,
      src: rawSrc.substring(tagStart + start, tagEnd + start),
      attributes,
    };

    block.getInnerMarkup = HappyMarkup._getInnerMarkup.bind(block);

    return block;
  },

  // Must be called with a block object as scope
  _getInnerMarkup: function () {
    return this.src.substring(this.src.indexOf(">") + 1,
      this.src.lastIndexOf("<"));
  },

  stripTagsWithAttrs: function (src, tag, attrs) {
    let start = 0;

    for (let block = HappyMarkup.getNextElementOfType(src, tag, start);
      block; block = HappyMarkup.getNextElementOfType(
        src, tag, start)) {
      const missingAttr = Object.keys(attrs).find((attr) => {
        return !Boolean(block.attributes[attr]);
      });

      if (missingAttr) {
        console.log("Tag is missing attribute " + missingAttr);
        start = block.end;
        continue;
      }
      src = HappyTemplate._strSplice(src, block.start,
        block.end - block.start, "");
    }

    return src;
  },
};

if (typeof module !== "undefined") {
  module.exports = HappyMarkup;
}

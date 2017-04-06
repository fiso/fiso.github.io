const HappyTemplate = {
  useDocument: function (documentObject) {
    this.documentObject = documentObject || window.document;
  },

  _strSplice: function (str, index, count, add) {
    // We cannot pass negative indices dirrectly to the 2nd slicing operation.
    if (index < 0) {
      index = str.length + index;
      if (index < 0) {
        index = 0;
      }
    }

    return str.slice(0, index) + (add || "") + str.slice(index + count);
  },

  _replaceAll: function (input, search, replacement) {
    return input.replace(new RegExp(search, "g"), replacement);
  },

  _forEachExpression: function (data, startDelimiter, endDelimiter, callback) {
    for (let searchStart = data.indexOf(startDelimiter);
        searchStart !== -1;
        searchStart = data.indexOf(startDelimiter, searchStart)) {
      let searchEnd = data.indexOf(endDelimiter, searchStart);
      if (searchEnd === -1) {
        console.error("Mismatched expression in template");
        break;
      }

      searchStart += startDelimiter.length;

      let expression = data.substring(searchStart, searchEnd);
      [data, searchStart] = callback(expression, searchStart);
    }
  },

  _compile: function (source, context, _index) {
    const contextWithIndex = Object.assign({}, context, {_index});

    let expressionStart = "{{{";
    let expressionEnd = "}}}";

    // First process any nested templates
    HappyTemplate._forEachExpression(source, expressionStart, expressionEnd,
      (expression, start) => {
        // FIXME: Do some sanity checking here - verify we have all needed
        // tokens in the correct order
        const subTemplateId = expression.substring(0,
          expression.indexOf("(")).trim();
        const subContextExpression = expression.substring(
          expression.indexOf("(") + 1,
          expression.indexOf(")")).trim();
        const subContext = function (e) {
          return eval(e);
        }.call(contextWithIndex, subContextExpression);

        const templateElement = this.documentObject.getElementById(
          subTemplateId);
        if (!templateElement) {
          console.error(`Invalid template id specified: ${subTemplateId}`);
        } else {
          const subTemplate = HappyTemplate._compile(templateElement.innerHTML,
            subContext);
          source = source.replace(
            `${expressionStart}${expression}${expressionEnd}`, subTemplate);
        }

        return [source, start + expressionStart.length + expression.length +
          expressionEnd.length];
      });

    expressionStart = "{{";
    expressionEnd = "}}";

    // Then process all other expressions
    HappyTemplate._forEachExpression(source, expressionStart, expressionEnd,
      (expression, start) => {
        const trimmedExpression = expression.trim();
        // FIXME: For start requires space after for, doesn't work with other
        // whitespace characters. We should probably be regexing.
        // Also, the ending expression is required to be exactly {{/for}}, with
        // no whitespace or other oddities. Again, we should be regexing.
        const forStatement = "for ";
        if (trimmedExpression.indexOf(forStatement) === 0) {
          const loopSourceStart = start + expression.length +
            expressionEnd.length;
          const loopEndExpression = `${expressionStart}/for${expressionEnd}`;
          const loopSourceEnd = source.indexOf(
            loopEndExpression, start);
          if (loopSourceEnd === -1) {
            console.error("Mismatched for loop start");
            return [source, loopSourceStart];
          }

          const loopSource = source.substring(loopSourceStart, loopSourceEnd);
          const inExpression = " in ";
          const inStart = trimmedExpression.indexOf(inExpression) +
            inExpression.length;
          const loopContext = trimmedExpression.substring(inStart);
          const varStart = trimmedExpression.indexOf(" ");
          const varName = trimmedExpression.substring(varStart,
            trimmedExpression.indexOf(inExpression)).trim();

          let iterable = function (e) {
            return eval(e);
          }.call(contextWithIndex, loopContext);

          if (typeof iterable.length === "undefined") {
            console.error("Invalid iterable passed to for");
            return [source, loopSourceStart];
          }

          let output = "";
          for (let i = 0; i < iterable.length; i++) {
            let iterationContext = {};
            iterationContext[varName] = iterable[i];
            output += HappyTemplate._compile(loopSource.trim(),
              iterationContext, i);
          }

          source = HappyTemplate._strSplice(source, start -
            expressionStart.length, loopSourceEnd - start +
            expressionStart.length + loopEndExpression.length, output);

          return [source, start - expressionStart.length + output.length];
        }

        const ifStatement = "if ";
        if (trimmedExpression.indexOf(ifStatement) === 0) {
          const conditionalSourceStart = start + expression.length +
            expressionEnd.length;
          const conditionalEndExpression =
            `${expressionStart}/if${expressionEnd}`;
          const conditionalSourceEnd = source.indexOf(
            conditionalEndExpression, start);
          if (conditionalSourceEnd === -1) {
            console.error("Mismatched conditional statement");
            return [source, loopSourceStart];
          }

          const conditionalSource = source.substring(
            conditionalSourceStart, conditionalSourceEnd);
          const conditional = trimmedExpression.substring(trimmedExpression.
            indexOf(ifStatement) + ifStatement.length).trim();

          let evaluation = function (e) {
            return Boolean(eval(e));
          }.call(contextWithIndex, conditional);

          if (!evaluation) {
            const startIndex = start - expressionStart.length;
            source = HappyTemplate._strSplice(source, startIndex,
              conditionalSourceEnd + conditionalEndExpression.length -
              startIndex);
            return [source, startIndex];
          }

          const output = HappyTemplate._compile(conditionalSource.trim(),
            context);
          source = HappyTemplate._strSplice(source, start -
            expressionStart.length, conditionalSourceEnd - start +
            expressionStart.length + conditionalEndExpression.length, output);

          return [source, start - expressionStart.length + output.length];
        }

        let result = function (e) {
          return eval(e);
        }.call(contextWithIndex, expression);

        if (typeof result === "undefined") {
          return [source, start + expression.length + expressionEnd.length +
            expressionStart.length];
        } else {
          result = String(result);
          source = source.replace(
            `${expressionStart}${expression}${expressionEnd}`, result);
          return [source, start - expressionStart.length + result.length];
        }
      });

    return source;
  },

  render: function (templateId, context, targetElement, index) {
    if (!this.documentObject) {
      this.documentObject = window.document;
    }
    let markup = "";

    const templateElement = this.documentObject.getElementById(templateId);
    if (!templateElement || typeof templateElement.innerHTML !== "string") {
      console.error(`Invalid template id specified: ${templateId}`);
      if (process && process.exit) {
        process.exit();
      }

      return "";
    }
    const source = templateElement.innerHTML;

    if (Array.isArray(context)) {
      const items = context.map((data, index) => {
        return this._compile(source, data, index);
      });

      markup = items.join("\n");
    } else {
      markup = this._compile(source, context, index);
    }

    if (targetElement) {
      targetElement.innerHTML = markup;
    }

    return markup;
  },
};

if (typeof module !== "undefined") {
  module.exports = HappyTemplate;
}

import {traverseContainWidgets} from "@/utils/util";
import {traverseObj} from "@/utils/data-adapter";

/**
 * 从表单中的组件取值，如果没有和绑定关系匹配的组件则获取绑定关系默认值
 * @param formData
 * @param sv
 * @returns {*}
 */
function getParamVALUE(formData, sv) {
  return formData[sv.widgetId] ? formData[sv.widgetId] : sv.paramValue;
}

function transferFormDataToPostData(formData, widgetList) {
  const postData = {}
  traverseContainWidgets(widgetList, (widget) => {
    if (widget.type === 'data-wrapper') {
      const bindMap = widget.options.valueSource.bindMap
      traverseObj(bindMap, (key, value) => {
        traverseObj(value, (sk, sv) => {
          sv?.params?.map(param => {
            postData[param.procedureId] = {
              procedureName: param.procedureName,
              //替换params值，用来生成最后exec接口的params参数。
              params: postData?.[param.procedureId]?.params ? [...postData[param.procedureId].params, {
                ...param,
                Param_TestVALUE: getParamVALUE(formData, sv)
              }] : [{
                ...param,
                Param_TestVALUE: getParamVALUE(formData, sv)
              }],
            }
          })
        })
      })
    }
  })
  return postData
}

export default transferFormDataToPostData
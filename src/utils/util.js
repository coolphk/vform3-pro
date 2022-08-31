import Clipboard from 'clipboard'
import axios from 'axios'

export function isNull(value) {
  return (value === null) || (value === undefined);
}

export function isNotNull(value) {
  return (value !== null) && (value !== undefined);
}

export function isEmptyStr(str) {
  //return (str === undefined) || (!str) || (!/[^\s]/.test(str));
  return (str === undefined) || (!str && (str !== 0) && (str !== '0')) || (!/[^\s]/.test(str));
}

export function isEmptyObj(obj) {
  return obj === undefined || Object.keys(obj).length === 0
}

export function isTable(type) {
  const tables = ['edit-table', 'data-table']
  return tables.includes(type)
}

export const generateId = function () {
  return Math.floor(Math.random() * 100000 + Math.random() * 20000 + Math.random() * 5000);
};

export const deepClone = function (origin) {
  if (origin === undefined) {
    return undefined
  }

  return JSON.parse(JSON.stringify(origin))
}

export const overwriteObj = function (obj1, obj2) {  /* 浅拷贝对象属性，obj2覆盖obj1 */
  // for (let prop in obj2) {
  //   if (obj2.hasOwnProperty(prop)) {
  //     obj1[prop] = obj2[prop]
  //   }
  // }

  Object.keys(obj2).forEach(prop => {
    obj1[prop] = obj2[prop]
  })
}

export const addWindowResizeHandler = function (handler) {
  let oldHandler = window.onresize
  if (typeof window.onresize != 'function') {
    window.onresize = handler
  } else {
    window.onresize = function () {
      oldHandler()
      handler()
    }
  }
}

const createStyleSheet = function () {
  let head = document.head || document.getElementsByTagName('head')[0];
  let style = document.createElement('style');
  style.type = 'text/css';
  head.appendChild(style);
  return style.sheet;
}

export const insertCustomCssToHead = function (cssCode, formId = '') {
  let head = document.getElementsByTagName('head')[0]
  let oldStyle = document.getElementById('vform-custom-css')
  if (!!oldStyle) {
    head.removeChild(oldStyle)  //先清除后插入！！
  }
  if (!!formId) {
    oldStyle = document.getElementById('vform-custom-css' + '-' + formId)
    !!oldStyle && head.removeChild(oldStyle)  //先清除后插入！！
  }

  let newStyle = document.createElement('style')
  newStyle.type = 'text/css'
  newStyle.rel = 'stylesheet'
  newStyle.id = !!formId ? 'vform-custom-css' + '-' + formId : 'vform-custom-css'
  try {
    newStyle.appendChild(document.createTextNode(cssCode))
  } catch (ex) {
    newStyle.styleSheet.cssText = cssCode
  }

  head.appendChild(newStyle)
}

export const insertGlobalFunctionsToHtml = function (functionsCode, formId = '') {
  let bodyEle = document.getElementsByTagName('body')[0]
  let oldScriptEle = document.getElementById('v_form_global_functions')
  !!oldScriptEle && bodyEle.removeChild(oldScriptEle)  //先清除后插入！！
  if (!!formId) {
    oldScriptEle = document.getElementById('v_form_global_functions' + '-' + formId)
    !!oldScriptEle && bodyEle.removeChild(oldScriptEle)  //先清除后插入！！
  }

  let newScriptEle = document.createElement('script')
  newScriptEle.id = !!formId ? 'v_form_global_functions' + '-' + formId : 'v_form_global_functions'
  newScriptEle.type = 'text/javascript'
  newScriptEle.innerHTML = functionsCode
  bodyEle.appendChild(newScriptEle)
}

export const optionExists = function (optionsObj, optionName) {
  if (!optionsObj) {
    return false
  }

  return Object.keys(optionsObj).indexOf(optionName) > -1
}

export const loadRemoteScript = function (srcPath, callback) {  /*加载远程js，加载成功后执行回调函数*/
  let sid = encodeURIComponent(srcPath)
  let oldScriptEle = document.getElementById(sid)

  if (!oldScriptEle) {
    let s = document.createElement('script')
    s.src = srcPath
    s.id = sid
    document.body.appendChild(s)

    s.onload = s.onreadystatechange = function (_, isAbort) { /* 借鉴自ace.js */
      if (isAbort || !s.readyState || s.readyState === "loaded" || s.readyState === "complete") {
        s = s.onload = s.onreadystatechange = null
        if (!isAbort) {
          callback()
        }
      }
    }
  }
}

export function traverseFieldWidgets(widgetList, handler) {
  widgetList.map(w => {
    if (w.formItemFlag || w.tableFlag) {
      handler(w)
    } else if (w.type === 'grid') {
      w.cols.map(col => {
        traverseFieldWidgets(col.widgetList, handler)
      })
    } else if (w.type === 'table') {
      w.rows.map(row => {
        row.cols.map(cell => {
          traverseFieldWidgets(cell.widgetList, handler)
        })
      })
    } else if (w.type === 'tab') {
      w.tabs.map(tab => {
        traverseFieldWidgets(tab.widgetList, handler)
      })
    } else if (w.type === 'sub-form') {
      traverseFieldWidgets(w.widgetList, handler)
    } else if (w.category === 'container') {  //自定义容器
      traverseFieldWidgets(w.widgetList, handler)
    }
  })
}

export function traverseContainWidgets(widgetList, handler) {
  widgetList.map(w => {
    if (w.category === 'container') {
      handler(w)
    }
    if (w.type === 'grid') {
      w.cols.map(col => {
        traverseContainWidgets(col.widgetList, handler)
      })
    } else if (w.type === 'table') {
      w.rows.map(row => {
        row.cols.map(cell => {
          traverseContainWidgets(cell.widgetList, handler)
        })
      })
    } else if (w.type === 'tab') {
      w.tabs.map(tab => {
        traverseContainWidgets(tab.widgetList, handler)
      })
    } else if (w.type === 'sub-form') {
      traverseContainWidgets(w.widgetList, handler)
    } else if (w.category === 'container' && w.widgetList.length > 0) {  //自定义容器
      traverseContainWidgets(w.widgetList, handler)
    }
  })
}

export function traverseAllWidgets(widgetList, handler) {
  widgetList.map(w => {
    handler(w)

    if (w.type === 'grid') {
      w.cols.map(col => {
        handler(col)
        traverseAllWidgets(col.widgetList, handler)
      })
    } else if (w.type === 'table') {
      w.rows.map(row => {
        row.cols.map(cell => {
          handler(cell)
          traverseAllWidgets(cell.widgetList, handler)
        })
      })
    } else if (w.type === 'tab') {
      w.tabs.map(tab => {
        traverseAllWidgets(tab.widgetList, handler)
      })
    } else if (w.type === 'sub-form') {
      traverseAllWidgets(w.widgetList, handler)
    } else if (w.category === 'container' && w?.widgetList?.length > 0) {  //自定义容器
      traverseAllWidgets(w.widgetList, handler)
    }
  })
}

function handleWidgetForTraverse(widget, handler) {
  if (!!widget.category) {
    traverseFieldWidgetsOfContainer(widget, handler)
  } else if (widget.formItemFlag) {
    handler(widget)
  }
}

/**
 * 遍历容器内的字段组件
 * @param con
 * @param handler
 */
export function traverseFieldWidgetsOfContainer(con, handler) {
  if (con.type === 'grid') {
    con.cols.forEach(col => {
      col.widgetList.forEach(cw => {
        handleWidgetForTraverse(cw, handler)
      })
    })
  } else if (con.type === 'table') {
    con.rows.forEach(row => {
      row.cols.forEach(cell => {
        cell.widgetList.forEach(cw => {
          handleWidgetForTraverse(cw, handler)
        })
      })
    })
  } else if (con.type === 'tab') {
    con.tabs.forEach(tab => {
      tab.widgetList.forEach(cw => {
        handleWidgetForTraverse(cw, handler)
      })
    })
  } else if (con.type === 'sub-form') {
    con.widgetList.forEach(cw => {
      handleWidgetForTraverse(cw, handler)
    })
  } else if (con.category === 'container') {  //自定义容器
    con.widgetList.forEach(cw => {
      handleWidgetForTraverse(cw, handler)
    })
  }
}

/**
 * 获取所有字段组件
 * @param widgetList
 * @returns {[]}
 */
export function getAllFieldWidgets(widgetList) {
  let result = []
  let handlerFn = (w) => {
    result.push({
      id: w.id,
      type: w.type,
      name: w.options.name,
      label: w.options.label,
      field: w
    })
  }

  traverseFieldWidgets(widgetList, handlerFn)

  return result
}

/**
 * 获取所有容器组件
 * @param widgetList
 * @returns {[]}
 */
export function getAllContainerWidgets(widgetList) {
  let result = []
  let handlerFn = (w) => {
    result.push({
      type: w.type,
      name: w.options.name,
      container: w
    })
  }
  traverseContainWidgets(widgetList, handlerFn)

  return result
}

export function copyToClipboard(content, clickEvent, $message, successMsg, errorMsg) {
  const clipboard = new Clipboard(clickEvent.target, {
    text: () => content
  })

  clipboard.on('success', () => {
    $message.success(successMsg)
    clipboard.destroy()
  })

  clipboard.on('error', () => {
    $message.error(errorMsg)
    clipboard.destroy()
  })

  clipboard.onClick(clickEvent)
}

export function getQueryParam(variable) {
  let query = window.location.search.substring(1);
  let vars = query.split("&")
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=")
    if (pair[0] == variable) {
      return pair[1]
    }
  }

  return undefined;
}

export function getDefaultFormConfig() {
  return {
    modelName: 'formData',
    refName: 'vForm',
    rulesName: 'rules',
    labelWidth: 80,
    labelPosition: 'left',
    size: '',
    labelAlign: 'label-left-align',
    cssCode: '',
    customClass: '',
    functions: '',  //全局函数
    layoutType: 'PC',
    jsonVersion: 3,
    dataSources: [],  //数据源集合

    onFormCreated: '',
    onFormMounted: '',
    onFormDataChange: '',
  }
}

export function buildDefaultFormJson() {
  return {
    widgetList: [],
    formConfig: deepClone(getDefaultFormConfig())
  }
}

/**
 * 转译选择项数据
 * @param rawData
 * @param widgetType
 * @param labelKey
 * @param valueKey
 * @returns {[]}
 */
export function translateOptionItems(rawData, widgetType, labelKey, valueKey) {
  if (widgetType === 'cascader') { // 级联选择不转译
    return deepClone(rawData)
  }

  let result = []
  if (!!rawData && (rawData.length > 0)) {
    rawData.forEach(ri => {
      const label = ri[labelKey]
      const value = ri[valueKey]
      if (isNotNull(label) && isNotNull(value)) {
        result.push({
          ...ri,
          label,
          value,
        })
      }
    })
  }

  return result
}

/**
 * 组装axios请求配置参数
 * @param arrayObj
 * @param DSV
 * @returns {{}}
 */
export function assembleAxiosConfig(arrayObj, DSV) {
  let result = {}
  if (!arrayObj || (arrayObj.length <= 0)) {
    return result
  }

  arrayObj.map(ai => {
    if (ai.type === 'String') {
      result[ai.name] = String(ai.value)
    } else if (ai.type === 'Number') {
      result[ai.name] = Number(ai.value)
    } else if (ai.type === 'Boolean') {
      if ((ai.value.toLowerCase() === 'false') || (ai.value === '0')) {
        result[ai.name] = false
      } else if ((ai.value.toLowerCase() === 'true') || (ai.value === '1')) {
        result[ai.name] = true
      } else {
        result[ai.name] = null
      }
    } else if (ai.type === 'Variable') {
      result[ai.name] = eval(ai.value)
    }
  })

  return result
}

function buildRequestConfig(dataSource, DSV, isSandbox) {
  let config = {}
  if (dataSource.requestURLType === 'String') {
    config.url = dataSource.requestURL
  } else {
    config.url = eval(dataSource.requestURL)
  }
  config.method = dataSource.requestMethod

  config.headers = assembleAxiosConfig(dataSource.headers, DSV)
  config.params = assembleAxiosConfig(dataSource.params, DSV)
  config.data = assembleAxiosConfig(dataSource.data, DSV)

  //let chFn = new Function('config', 'sandbox', 'form', 'widget', dataSource.configHandlerCode)
  let chFn = new Function('config', 'isSandbox', 'DSV', dataSource.configHandlerCode)
  return chFn.call(null, config, isSandbox, DSV)
}

export async function runDataSourceRequest(dataSource, DSV, isSandbox, $message) {
  try {
    let requestConfig = buildRequestConfig(dataSource, DSV, isSandbox)
    //console.log('test------', requestConfig)
    let result = await axios.request(requestConfig)

    //let dhFn = new Function('result', 'sandbox', 'form', 'widget', dataSource.dataHandlerCode)
    let dhFn = new Function('result', 'isSandbox', 'DSV', dataSource.dataHandlerCode)
    return dhFn.call(null, result, isSandbox, DSV)
  } catch (err) {
    //let ehFn = new Function('error', 'sandbox', 'form', 'widget', '$message', dataSource.dataHandlerCode)
    let ehFn = new Function('error', 'isSandbox', 'DSV', '$message', dataSource.errorHandlerCode)
    ehFn.call(null, err, isSandbox, DSV, $message)
    console.error(err)
  }
}

export function getDSByName(formConfig, dsName) {
  let resultDS = null
  if (!!dsName && !!formConfig.dataSources) {
    formConfig.dataSources.forEach(ds => {
      if (ds.uniqueName === dsName) {
        resultDS = ds
      }
    })
  }

  return resultDS
}

export function uuid2(len, radix) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
  const uuid = []

  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (let i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}

// uuid2(16, 16) // "277571702EE33E11"

/**
 * 判断一个对象中是否包含某值
 * @param obj
 * @param value
 * @param scope
 * @returns {string|boolean}
 */
export function inObject(obj, value, scope) {
  if (scope === 'key') {
    return Object.keys(obj).includes(value)
  } else if (scope === 'value') {
    return !!Object.keys(obj).find(key => obj[key] === value)
  } else {
    return Object.keys(obj).includes(value) || !!Object.keys(obj).find(key => obj[key] === value)
  }
}

export function debounce(fn, wait) {
  let timer = null;
  return function () {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, wait);
  }
}
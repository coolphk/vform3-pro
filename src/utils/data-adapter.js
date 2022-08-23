import {isEmptyObj, uuid2} from "@/utils/util";

let id = 0

function isObj(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

/***
 * 将数组转换为children树形结构
 * @param arr
 * @param idKey
 * @param attr 需要新加入的属性对象
 * @param rootParentId 根节点的parentId
 * @returns {(Map<any, any>|*)[]}
 */
export function unFlatten(arr, idKey = 'ID', attr = {}, rootParentId = '0000') {
  arr.forEach(item => {
    item['children'] = getChildren(arr, item[idKey])
    Object.keys(attr).forEach(key => {
      item[key] = attr[key]
    })
  })
  return getChildren(arr, rootParentId)
}

export function getChildren(arr, parentValue, parentKey = 'Parent_ID',) {
  return arr.filter(item => item[parentKey] === parentValue)
}


export function transferData(object) {
  return {
    ...object,
    isLeaf: object.HaveChild !== '1',
    children: object.HaveChild === '1' ? [{}] : undefined,
    editorVisible: false
  }
}

export function assembleBussinessParams({scriptId, params, pageSize = 10, currentPage = 1}) {
  const data = {
    "Scripts_ID": scriptId,
    currentPage,
    pageSize,
  }
  params.forEach(item => {
    data[item.Param_Name] = item.Param_TestVALUE
  })
  return data
}

export function buildProcedureSchema() {
  return {
    "Param_ID": uuid2(16),
    "Param_Name": "",
    "Param_ObjType": "",
    "Param_Type": "",
    "Param_MaxLen": "",
    "Param_isOUT": "",
    "Param_isXML": "",
    "Param_VALUE": "",
    "Param_TestVALUE": "",
    "Param_Des": "",
    "Param_BusiDes": "",
    "Param_LinkTableID": "",
    "Param_LinkTableName": "",
    "Param_LinkColumID": "",
    "Param_LinkColumName": "",
    "Param_LinkColumBusiDes": "",
    "Parent_ID": "",
    "ROWNR": null,
  }
}

export function filterPostParam(param) {
  return {
    "Param_ID": param.Param_ID,
    "Param_Name": param.Param_Name,
    "Param_ObjType": param.Param_ObjType,
    "Param_Type": param.Param_Type,
    "Param_MaxLen": param.Param_MaxLen,
    "Param_isOUT": param.Param_isOUT,
    "Param_isXML": param.Param_isXML,
    "Param_TestVALUE": param.Param_TestVALUE,
    "Parent_ID": param.Parent_ID,
    "HaveChild": param.HaveChild,
    "ROWNR": param.ROWNR,
  }
}

export function getKeyByValue(obj, value) {
  return Object.keys(obj).find(key => obj[key] = value)
}

export function traverseObj(obj, handle) {
  if (isEmptyObj(obj)) return
  Object.keys(obj).map(key => {
    handle(key, obj[key])
  })
}

export function traverseTreeData(treeData, handle) {
  treeData.map(item => {
    handle(item)
    if (item.children) {
      traverseTreeData(item.children, handle)
    }
  })
}

/**
 * 将绑定关系改变为以存储过程ID为主键的数据结构
 * @param bindMap
 * @returns {{}}
 */
export function changeBindMapToProcedureIdAsKey(bindMap) {
  const postData = {}
  traverseObj(bindMap, (key, value) => {
    traverseObj(value.scriptFields, (sk, sv) => {
      sv?.params?.map(param => {
        postData[param.procedureId] = {
          procedureName: param.procedureName,
          //替换params值，用来生成最后exec接口的params参数。
          params: postData?.[param.procedureId]?.params ? [...postData[param.procedureId].params, {
            ...param
          }] : [{
            ...param
          }],
        }
      })
    })
  })
  return postData
}

export const getWidgetEventByType = (type) => {
  const onChange = 'onChange'
  const eventMap = {
    'data-table': 'onTableRowClick',
    'input': onChange,
    'textarea': onChange,
    'number': onChange,
    'radio': onChange,
    'checkbox': onChange,
    'select': onChange,
    'time': onChange,
    'date': onChange,
    'switch': onChange,
    'button': 'onClick'
  }
  return eventMap[type]
}
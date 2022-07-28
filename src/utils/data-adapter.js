import {isEmptyObj, uuid2} from "@/utils/util";

let id = 0

function objectToArray(obj, level, path) {
  level++
  if (isObj(obj)) {
    const keys = Reflect.ownKeys(obj);
    const self = []
    if (keys.length > 0) {
      keys.map((key, index) => {
        const data = {
          id: id++,
          label: key,
          require: true,
          level,
          path: path === '' ? key : `${path}.${key}`,
        }
        if (isObj(obj[key]) || isArray(obj[key])) {
          data['children'] = objectToArray(obj[key], level, data.path, obj)
        } else {
          data['value'] = obj[key]
        }
        self.push(data)
      })
    }
    return self
  } else if (isArray(obj)) {
    const item = obj[0]
    const data = {
      label: 'item',
      children: objectToArray(item, level, path)
    }
    return [data]
  }
}


function isObj(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

/*export function unflatten(arr, node) {
  if (node.HaveChild === "1") {
    node['children'] = getChildren(arr, node.Param_ID)
  }
}*/

/*export function getChildren(arr, parentId) {
  return arr.filter(item => item.Parent_ID === parentId)
}*/

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
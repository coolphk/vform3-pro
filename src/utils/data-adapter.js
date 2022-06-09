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


export function transferData(object) {
  return {
    ...object,
    isLeaf: object.HaveChild !== '1',
    children: object.HaveChild === '1' ? [{}] : undefined,
    editorVisible: false
  }
}
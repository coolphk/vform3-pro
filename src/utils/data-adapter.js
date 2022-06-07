const originalData = {
  "Root": {
    "VAA": {
      "Ie": {
        "@VAA01": "55846",
        "@VAA07": "57869",
        "@ACF01": "1",
        "@VCJ10": null,
        "@VCJ11": "",
        "@VCJ12": "2022/4/24",
        "@VCJ13": "",
        "@VCJ14": ""
      }
    },
    "VBL": {
      "Ie": [
        {
          "@VBU01": "0",
          "@VBL13": "800.0000",
          "@VBL14": "现金支付",
          "@VBL15": "01",
          "@FAF01": "",
          "@VBL11": ""
        },
        {
          "@VBU01": "1",
          "@VBL13": "800.0000",
          "@VBL14": "现金支付",
          "@VBL15": "01",
          "@FAF01": "",
          "@VBL11": ""
        }
      ]
    },
    /*"VAI": {
      "Ie": {
        "@VAI00": "LZ0000162003",
        "@VAI01": "162003",
        "@BCK01B": "261",
        "@BCE02A": "3001",
        "@BCE03A": "朱秀华",
        "@VAI04": "LZ0000162003",
        "@VAI05": "",
        "@OldMoney": "800.0000",
        "@SumMoney": "800.0000",
        "@YbMoney": "0",
        "@Enabled": "0",
        "@VAI17": "1"
      }
    }*/
  }
}

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


function dataFactory(schema) {
  const data = {}
  schema.keys.map((key, index) => {
    data[key] = schema.values[index]
  })
  return data
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

    children: object.HaveChild === '1' ? [{}] : undefined
  }
}
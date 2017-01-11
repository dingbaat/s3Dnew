/*
 n = name
 q = query

 "allproperties": {
 "path": "getcurprop",
 "queries": [
 {
 "seq": "0"
 }
 ]
 },
 */

export class Model {

  generalProperties = {
    "pathWftServer": "/api/cam/",
    "protocolWftServer": "http",
    "queryPropState": "getprop?r="
  }

  currentProperties = {
    "seq": 2,
    "mode": "Ctrl",
    "rec": "off",
    "com": 6,
    "batt": 1,
    "tc": "00:00:00:00",
    "cbtn": "f0i1af0ai1",
    "camid": "Links   ",
    "Ocf": {"sel": "n", "artime": -1, "brtime": -1},
    "Owbm": {"pv": "Daylight", "en": 1},
    "Owbv": {"pv": "-1", "en": 1},
    "Oav": {"pv": "8", "en": 1},
    "Ossm": {"pv": "speed", "en": 1},
    "Ossv": {"pv": "1/60", "en": 1},
    "Ogcm": {"pv": "iso", "en": 1},
    "Ogcv": {"pv": "800", "en": 1},
    "nd": 0,
    "mcbtn": "enAct",
    "fframe": "off",
    "pushai": "stop",
    "exdisp": 0
  }

  properties = [
    {
      "desc": "whitebalance",
      "path": "setprop",
      "queries": [
        [
          {"key": "wbm", "value": "Daylight", "name": "Daylight"},
          {"key": "wbv", "value": [-3, -2, -1, 0, 1, 2, 3]}
        ],
        [
          {"key": "wbm", "value": "PresetA", "name": "A"}
        ],
        [
          {"key": "wbm", "value": "PresetB", "name": "B"}
        ],
        [
          {"key": "wbm", "value": "Kelvin", "name": "Kelvin"},
          {"key": "wbv", "value": [3100, 5600, -1]}
        ],
        [
          {"key": "wbm", "value": "Tungsten", "name": "Tungsten"},
          {"key": "wbv", "value": [-9, 0, 9]}
        ]
      ]
    },
    {
      "desc": "aperture",
      "propType" : "value-property",
      "path": "setprop",
      "queries": [
        {"key": "av", "value": [4, 5.6, 6.7, 8], "name": "Aperture"}
      ]
    },
    {
      "desc": "shutterspeed",
      "path": "setprop",
      "queries": [
        [
          {"key": "ssm", "value": "speed", "name": "Speed"},
          {"key": "ssv", "value": ["1/60", "1/25"]}
        ],
        [
          {"key": "ssm", "value": "slow", "name": "Slow"},
          {"key": "ssv", "value": ["1/12"]}
        ],
        [
          {"key": "ssm", "value": "cls", "name": "Clear Scan"},
          {"key": "ssv", "value": [50.37, 80]}
        ],
        [
          {"key": "ssm", "value": "angle", "name": "Angle"},
          {"key": "ssv", "value": [90.00, 120.00]}
        ],
        [
          {"key": "ssm", "value": "off", "name": "Off"},
        ],
      ]
    },
    {
      "desc": "iso/gain",
      "path": "setprop",
      "queries": [
        [
          {"key": "gcm", "value": "iso", "name": "ISO"},
          {"key": "gcv", "value": [100, 200, 400, 800]}
        ],
        [
          {"key": "gcm", "value": "gain", "name": "Gain"},
          {"key": "gcv", "value": [10.0, 21.0]}
        ],
      ]
    },
    {
      "desc": "nd",
      "path": "drivelens",
      "queries": [
        {"key": "nd", "value": "minus", "name": "-"},
        {"key": "nd", "value": "plus", "name": "+"}
      ]
    },
    {
      "desc": "autoiris",
      "path": "drivelens",
      "queries": [
        {"key": "ai", "value": "push", "name": "Push Auto Iris"}
      ]
    },
    {
      "desc": "iris",
      "path": "drivelens",
      "queries": [
        {"key": "iris", "value": "minus", "name": "-"},
        {"key": "iris", "value": "plus", "name": "+"}
      ]
    },
    {
      "desc": "liveview",
      "path": "lv",
      "queries": [
        {"key": "cmd", "value": "start&sz=l", "name": "Start"},
        {"key": "cmd", "value": "stop", "name": "Stop"}
      ]
    },
    {
      "desc": "liveview-img",
      "path": "lvgetimg",
      "queries": [
        {"key": "d", "value": "0", "name": "Aktuelles Live View Bild"}
      ]
    },
    {
      "desc": "record",
      "path": "rec",
      "queries": [
        {"key": "cmd", "value": "trig", "name": "Start/Stop Recording"}
      ]
    },
    {
      "desc": "slot",
      "propType" : "value-property",
      "path": "rec",
      "queries": [
        {"key": "cmd", "value": "slot", "name": "Slot Selection"}
      ]
    }
  ]

}

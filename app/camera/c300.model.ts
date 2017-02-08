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
        "Oav": {"pv": "3.5", "en": 1},
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

    adjustableProperties = [
        {
            "desc": "Iris",
            "type": "buttons",
            "path": "drivelens",
            "queries": [
                {"key": "iris", "value": "minus", "name": "-"},
                {"key": "iris", "value": "plus", "name": "+"}
            ]
        },
        {
            "desc": "Aperture",
            "type": "slider",
            "path": "setprop",
            "queries": [
                {
                    "key": "av",
                    "value": [
                        2.8,
                        3.2,
                        3.5,
                        4.0,
                        4.5,
                        5.0,
                        5.6,
                        6.3,
                        6.7,
                        7.1,
                        8.0,
                        9.0,
                        9.5,
                        10,
                        11,
                        13,
                        14,
                        16,
                        18,
                        19,
                        20,
                        22
                    ]
                }
            ]
        },
        {
            "desc": "Shutterspeed",
            "type": "dropdown+slider",
            "path": "setprop",
            "queries": [
                [
                    {"key": "ssm", "value": "speed", "name": "Speed"},
                    {
                        "key": "ssv",
                        "value": [
                            "1/50",
                            "1/60",
                            "1/75",
                            "1/80",
                            "1/90",
                            "1/100",
                            "1/120",
                            "1/125",
                            "1/150",
                            "1/160",
                            "1/180",
                            "1/200",
                            "1/210",
                            "1/250",
                            "1/300",
                            "1/320",
                            "1/350",
                            "1/400",
                            "1/500",
                            "1/600",
                            "1/640",
                            "1/700",
                            "1/800",
                            "1/1000",
                            "1/1200",
                            "1/1400",
                            "1/1600",
                            "1/2000"
                        ]
                    }
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
                    {"key": "ssv", "value": []}
                ],
            ]
        },
        {
            "desc": "ND",
            "type": "buttons",
            "path": "drivelens",
            "queries": [
                {"key": "nd", "value": "minus", "name": "-"},
                {"key": "nd", "value": "plus", "name": "+"}
            ]
        },
        {
            "desc": "ISO/Gain",
            "type": "dropdown+slider",
            "path": "setprop",
            "queries": [
                [
                    {"key": "gcm", "value": "iso", "name": "ISO"},
                    {
                        "key": "gcv",
                        "value": [
                            320,
                            400,
                            500,
                            640,
                            800,
                            850,
                            1000,
                            1250,
                            1600,
                            2000,
                            2500,
                            3200,
                            4000,
                            5000,
                            6400,
                            8000,
                            10000,
                            12800,
                            16000,
                            20000
                        ]
                    }
                ],
                [
                    {"key": "gcm", "value": "gain", "name": "Gain"},
                    {
                        "key": "gcv",
                        "value": {"min": -6, "max": 30, "step": 3}
                    }
                ],
            ]
        },
        {
            "desc": "Whitebalance",
            "type": "dropdown+slider",
            "path": "setprop",
            "queries": [
                [
                    {"key": "wbm", "value": "Daylight", "name": "Daylight"},
                    {"key": "wbv", "value": {"min": -9, "max": 9, "step": 1}}
                ],
                [
                    {"key": "wbm", "value": "PresetA", "name": "A"},
                    {"key": "wbv", "value": []}
                ],
                [
                    {"key": "wbm", "value": "PresetB", "name": "B"},
                    {"key": "wbv", "value": []}
                ],
                [
                    {"key": "wbm", "value": "Kelvin", "name": "Kelvin"},
                    {"key": "wbv", "value": {"min": 2000, "max": 15000, "step": 100}}
                ],
                [
                    {"key": "wbm", "value": "Tungsten", "name": "Tungsten"},
                    {"key": "wbv", "value": {"min": -9, "max": 9, "step": 1}}
                ]
            ]
        },
        {
            "desc": "Slot",
            "type": "buttons",
            "path": "rec",
            "queries": [
                {"key": "cmd", "value": "slot", "name": "Slot Selection"}
            ]
        },
        {
            "desc": "Autoiris",
            "type": "buttons",
            "path": "drivelens",
            "queries": [
                {"key": "ai", "value": "push", "name": "Push Auto Iris"}
            ]
        },
        {
            "desc": "Record",
            "type": "toggle",
            "path": "rec",
            "queries": [
                {"key": "cmd", "value": "trig", "name": "Start/Stop Recording"}
            ]
        },
        {
            "desc": "Liveview",
            "type": "lv-toggle",
            "path": "lv",
            "queries": [
                {"key": "cmd", "value": "start&sz=l", "name": "Start"},
                {"key": "cmd", "value": "stop", "name": "Stop"}
            ]
        },
        {
            "desc": "Liveview Image",
            "type": "lv-image",
            "path": "lvgetimg",
            "queries": [
                {"key": "d", "value": "0", "name": "Aktuelles Live View Bild"}
            ]
        }
    ]
}

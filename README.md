# Homebridge Temperature Accessory DHT

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![Discord](https://img.shields.io/discord/942035865658613790.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/CAvGGvRGB3)

![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/homebridge-temperature-sensor-dht)
![npm](https://img.shields.io/npm/dm/homebridge-temperature-sensor-dht)

I recommend to use the accessory as a Child Bridge for the best performance.

You have to add a DHT sensor to the GPIO of the RPi

| Supported | Model | Code in config |
| --------- | ----- | -------------- |
| ✅        | DHT11 | 11             |
| ✅        | DHT22 | 22             |
| ❔        | DHT12 | 11             |
| ❔        | DHT21 | 22             |
| ❌        | Other | -              |

### Config

You can add multiple dht sensors by having multiple accessories.

```json
{
  "accessories": [
    {
      "accessory": "TemperatureAccessoryDHT",
      "name": "DHT Sensor",
      "humidityAdjustment": 0, // e.g. -2 or 2
      "adjustment": 0, // e.g. -2 or 2
      "model": 22,
      "pin": 2
    }
  ]
}
```

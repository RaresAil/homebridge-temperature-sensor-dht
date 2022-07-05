import { API, Logger, Service } from 'homebridge';
import dhtSensor from 'node-dht-sensor';

import { Config } from './config';

dhtSensor.setMaxRetries(2);

export class Sensor {
  private fails = 0;

  private temperature = -270;
  private humidity = 0;

  private readonly Characteristic = this.api.hap.Characteristic;

  private readonly temperatureSensorService: Service =
    new this.api.hap.Service.TemperatureSensor('Temperature Sensor');

  private readonly humiditySensorService: Service =
    new this.api.hap.Service.HumiditySensor('Humidity Sensor');

  constructor(
    private readonly log: Logger,
    private readonly api: API,
    private readonly config: Config
  ) {
    dhtSensor.promises.initialize(this.config.model, this.config.pin);

    this.temperatureSensorService
      .getCharacteristic(this.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this));

    this.humiditySensorService
      .getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
      .onGet(this.getCurrentHumidity.bind(this));

    this.updateData();
    setInterval(this.updateData.bind(this), 30 * 1000);
  }

  getServices() {
    return [this.temperatureSensorService, this.humiditySensorService];
  }

  private getCurrentTemperature(): number {
    return this.temperature;
  }

  private getCurrentHumidity(): number {
    return this.humidity;
  }

  private async updateData(): Promise<void> {
    try {
      const { humidity, temperature } = await dhtSensor.promises.read(
        this.config.model,
        this.config.pin
      );

      this.temperature =
        temperature < -270 ? -270 : temperature > 100 ? 100 : temperature;
      this.humidity = humidity < 0 ? 0 : humidity > 100 ? 100 : humidity;
      this.fails = 0;
    } catch (error) {
      this.fails++;
      if (this.fails >= 3) {
        this.log.error(
          (error as { message: string })?.message ?? (error as string)
        );
      }
    }
  }
}

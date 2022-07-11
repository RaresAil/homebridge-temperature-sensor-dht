import { API, Logger, Service } from 'homebridge';
import dhtSensor from 'node-dht-sensor';

import { Config } from './config';

dhtSensor.setMaxRetries(10);

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
    try {
      dhtSensor.promises.initialize(this.config.model, this.config.pin);

      this.temperatureSensorService
        .getCharacteristic(this.Characteristic.CurrentTemperature)
        .onGet(this.getCurrentTemperature.bind(this));

      this.humiditySensorService
        .getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
        .onGet(this.getCurrentHumidity.bind(this));

      this.updateData();
      setInterval(this.updateData.bind(this), 10 * 1000);
    } catch (error) {
      this.log.error(
        (error as { message: string })?.message ?? (error as string)
      );
    }
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

      if (this.fails > 0) {
        this.log.info(`Failed ${this.fails} times`);
      }

      const adjustedTemperature = temperature + this.config.adjustment;

      this.temperature =
        adjustedTemperature < -270
          ? -270
          : adjustedTemperature > 100
          ? 100
          : adjustedTemperature;
      this.humidity = humidity < 0 ? 0 : humidity > 100 ? 100 : humidity;
      this.fails = 0;
    } catch (error) {
      this.fails++;

      if (this.fails === 3) {
        this.log.error(
          (error as { message: string })?.message ?? (error as string)
        );
      }
    }
  }
}

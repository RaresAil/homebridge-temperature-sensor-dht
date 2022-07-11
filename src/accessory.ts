import { API, Logger, Service } from 'homebridge';
import { Config } from './config';
import { Sensor } from './Sensor';

export class TemperatureAccessoryDHT {
  private readonly informationService: Service;
  private readonly sensor?: Sensor;

  constructor(
    private readonly log: Logger,
    private readonly config: unknown,
    private readonly api: API
  ) {
    const { model, pin, adjustment } = this.config as Partial<Config>;

    this.informationService = new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'DHT')
      .setCharacteristic(
        this.api.hap.Characteristic.SerialNumber,
        `${model ?? '00'}-${pin ?? '00'}`
      )
      .setCharacteristic(
        this.api.hap.Characteristic.Model,
        `${model ?? 'Unknown'}`
      );

    try {
      if (
        !model ||
        (model !== 11 && model !== 22) ||
        !pin ||
        typeof pin !== 'number'
      ) {
        this.log.warn(`Invalid model or pin: ${model} - ${pin}`);
        return;
      }

      let parsedAdjustment = +(adjustment || 0);
      if (
        Number.isNaN(parsedAdjustment) ||
        !Number.isFinite(parsedAdjustment)
      ) {
        this.log.warn(`Invalid adjustment: ${parsedAdjustment}`);
        parsedAdjustment = 0;
      }

      parsedAdjustment = Math.round(parsedAdjustment * 100) / 100;

      this.sensor = new Sensor(this.log, this.api, {
        ...(this.config as Config),
        adjustment: parsedAdjustment
      });
    } catch (error) {
      this.log.error(
        (error as { message: string })?.message ?? (error as string)
      );
    }
  }

  getServices() {
    return [this.informationService, ...(this.sensor?.getServices() ?? [])];
  }
}

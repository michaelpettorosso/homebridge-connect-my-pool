import { CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue, Service } from "homebridge";
import { SolarResponse, Controller, Zone  } from "../ajaxResponse";
import { ConnectMyPoolPlatform } from "../connect-my-pool-platform";
import { HeaterAccessory } from "./heaterAccessory";

export class SolarAccessory extends HeaterAccessory {
  currentStatus!: SolarResponse;
  previousStatus!: SolarResponse;
  protected temperatureSensorService!: Service;
  constructor(platform : ConnectMyPoolPlatform, controller: Controller, zone: Zone) {
    super(platform, controller, zone);
  }
  protected setStatus(newStatus: SolarResponse) {
    super.setStatus(newStatus)
    
    this.temperatureSensorService.getCharacteristic(this.Characteristic.CurrentTemperature)
      .updateValue(this.getTemperatureSensor(newStatus));

  }
  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  private getTemperatureSensor(newStatus?: SolarResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for TargetTemperature
    var value = status?.roofTemp ?? 0;
    this.debug('Get TemperatureSensor:', value);
    return value;
  }

  ////////////////////////
  // ZONE SERVICE FUNCTIONS
  ////////////////////////
  protected setupServices() {
    super.setupServices();
    this.debug('setupServices', 'solarAccessory');
    this.temperatureSensorService = this.createTemperatureSensor();
  }

  // Configure the temperature sensor on the Solar Heater.
  private createTemperatureSensor(): Service {

    const temperatureSensorService = this.accessory.getServiceById(this.Service.TemperatureSensor, 'temperaturesensor') || this.accessory.addService(this.Service.TemperatureSensor, this.zone.name + " Roof Temperature", 'temperaturesensor');

    temperatureSensorService.getCharacteristic(this.Characteristic.CurrentTemperature)
      .setValue(this.getTemperatureSensor())
      .onGet(this.getTemperatureSensor.bind(this)) 
    
    this.enabledServices.push(temperatureSensorService);
    return temperatureSensorService;   
  }
  ////////////////////////
  // UPDATE CHARACTERISTICS FROM ZONE
  ////////////////////////



}

import { val } from "cheerio/lib/api/attributes";
import { Characteristic, CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue, Service } from "homebridge";
import { HeaterResponse, Controller, Zone, SolarResponse, HeatingResponse  } from "../ajaxResponse";
import { ConnectMyPoolPlatform } from "../connect-my-pool-platform";
import { ON_OFF_AUTO, ZONES } from "../constants";
import {ZoneAccessory } from "./zoneAccessory";

export abstract class HeaterAccessory extends ZoneAccessory {
  currentStatus!: HeaterResponse;
  previousStatus!: HeaterResponse;
  protected heaterSensorService!: Service;
  
  constructor(platform : ConnectMyPoolPlatform, controller: Controller, zone: Zone) {
    super(platform, controller, zone);
    
    //accessory.updateReachability(true);
  }

  ////////////////////////
  // UPDATE CHARACTERISTICS FROM ZONE
  ////////////////////////



  /// /////////////////////
  // GET AND SET FUNCTIONS
  /// /////////////////////

  private getCurrentHeatingCoolingState(newStatus?: HeaterResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentHeatingCoolingState
    var value = this.getHeatingCoolingCharacteristic(status?.status, status?.isRunning);
    this.debug('Get CurrentHeatingCoolingState:', value);
    return value
  }

  /**
   * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
   */
  private getTargetHeatingCoolingState(newStatus?: HeaterResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for TargetHeatingCoolingState
    var value = this.getHeatingCoolingCharacteristic(status?.status, status?.isRunning);
    this.debug('Get TargetHeatingCoolingState:', value);
    return value;
  }

  /**
   * Handle requests to set the "Target Heating Cooling State" characteristic
   */
  private setTargetHeatingCoolingState(value : CharacteristicValue) {
    this.debug('Set TargetHeatingCoolingState:', value);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  private getCurrentTemperature(newStatus?: HeaterResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = status?.currentTemp ?? 0;
    this.debug('Get CurrentTemperature:', value);
    return value;
  }

  /**
   * Handle requests to get the current value of the "Is Active" characteristic
   */
  private getIsRunning(newStatus?: HeaterResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = status?.isRunning ?? false;
    this.debug('Get Is Running:', value);
    return value;
  }

  private getContactSensorState(newStatus?: HeaterResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = status?.isRunning ?? false ? this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : this.Characteristic.ContactSensorState.CONTACT_DETECTED;
    this.debug('Get Is Contact Sensor State:', value);
    return value;
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
 private getTargetTemperature(newStatus?: HeaterResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for TargetTemperature
    var value = status?.targetTemp ?? 10;
    this.debug('Get TargetTemperature:', value);
    return value;
  }


  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  private setTargetTemperature(value : CharacteristicValue) {
    this.debug('Set TargetTemperature:', value);

  }

  // /**
  //  * Handle requests to get the current value of the "Temperature Display Units" characteristic
  //  */
  private getTemperatureDisplayUnits() {
    this.debug('Get TemperatureDisplayUnits');

    return this.Characteristic.TemperatureDisplayUnits.CELSIUS;
  }

  protected setStatus(newStatus: HeaterResponse) {
    super.setStatus(newStatus);
    if (newStatus && (!(newStatus.zoneType === ZONES.HEATING || newStatus.zoneType === ZONES.SOLAR)))
      this.log?.error('setStatus Heater', newStatus.zoneType, typeof newStatus);
    if (newStatus) {
      
      if (!this.currentStatus)
        this.currentStatus = newStatus;
      else
        this.previousStatus = this.currentStatus;

      this.heaterSensorService.getCharacteristic(this.Characteristic.StatusActive)
        .updateValue(this.getIsRunning(newStatus));
      this.heaterSensorService.getCharacteristic(this.Characteristic.ContactSensorState)
        .updateValue(this.getContactSensorState(newStatus));
      this.zoneService.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
        .updateValue(this.getCurrentHeatingCoolingState(newStatus));
      this.zoneService.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
        .updateValue(this.getTargetHeatingCoolingState(newStatus));
      this.zoneService.getCharacteristic(this.Characteristic.CurrentTemperature)
        .updateValue(this.getCurrentTemperature(newStatus));
        
      this.zoneService.getCharacteristic(this.Characteristic.TargetTemperature)
        .updateValue(this.getTargetTemperature(newStatus));

      this.currentStatus = newStatus;
      
    }
  }

  ////////////////////////
  // ZONE SERVICE FUNCTIONS
  ////////////////////////

  protected setupServices() {
    this.debug('setupServices', 'heaterAccessory');
    this.zoneService = this.createZoneService();
    this.zoneService.setPrimaryService(true);
    this.heaterSensorService = this.createHeaterSensor();
    super.setupServices();
  }

  private getHeatingCoolingCharacteristic(value: string | null, isRunning?: boolean) : number
  {
     if (value === ON_OFF_AUTO.ON || (value === ON_OFF_AUTO.AUTO && (isRunning ?? false)))
       return this.Characteristic.CurrentHeatingCoolingState.HEAT
     else
       return this.Characteristic.CurrentHeatingCoolingState.OFF
  }

  private createZoneService() {
    this.debug('Creating %s service for controller', this.name);
    const zoneService = this.accessory.getServiceById(this.Service.Thermostat, this.zone.type) || this.accessory.addService(this.Service.Thermostat, this.name, this.zone.type);

    //zoneService.setCharacteristic(this.Characteristic.ConfiguredName, this.name)

    zoneService.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
      .setProps({
        maxValue: this.Characteristic.CurrentHeatingCoolingState.HEAT
      })
      .onGet(this.getCurrentHeatingCoolingState.bind(this));

    zoneService.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
      .setProps({
        maxValue: this.Characteristic.TargetHeatingCoolingState.HEAT
      })
      .onGet(this.getTargetHeatingCoolingState.bind(this))
      .onSet(this.setTargetHeatingCoolingState.bind(this));

    zoneService.getCharacteristic(this.Characteristic.CurrentTemperature)
      .setProps({
        maxValue: 50,
        minStep: 1
      })
      .onGet(this.getCurrentTemperature.bind(this))

    zoneService.getCharacteristic(this.Characteristic.TargetTemperature)
      .setProps({
        maxValue: 40,
        minStep: 1
      })
      .onGet(this.getTargetTemperature.bind(this))
      .onSet(this.setTargetTemperature.bind(this));

    zoneService.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
      .setValue(this.Characteristic.TemperatureDisplayUnits.CELSIUS);

    this.enabledServices.push(zoneService);
    return zoneService;
  }

  // Configure the contact sensor on the Heater.
  private createHeaterSensor(): Service {

    const heaterSensorService = this.accessory.getServiceById(this.Service.ContactSensor, 'heatersensor') || this.accessory.addService(this.Service.ContactSensor, this.zone.name + " Running", 'heatersensor');

    heaterSensorService.getCharacteristic(this.Characteristic.StatusActive)
      .setValue(this.getIsRunning())
      .onGet(this.getIsRunning.bind(this))
    
    heaterSensorService.getCharacteristic(this.Characteristic.ContactSensorState)
      .setValue(this.getContactSensorState())
      .onGet(this.getContactSensorState.bind(this))

    this.enabledServices.push(heaterSensorService);
    return heaterSensorService;
  }



}

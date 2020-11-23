const Gateway = require('./gateway');
const ZoneAccessory = require('./zoneAccessory');

class HeatingAccessory extends ZoneAccessory {
  status = null;
  constructor(platform, accessory, controller, zone) {
    super(platform, accessory, controller, zone);
    this.setUpServices();
    //accessory.updateReachability(true);
  }

  ////////////////////////
  // UPDATE CHARACTERISTICS FROM ZONE
  ////////////////////////



  /// /////////////////////
  // GET AND SET FUNCTIONS
  /// /////////////////////

  getCurrentHeatingCoolingState(callback) {
    this.log.debug('Triggered GET CurrentHeatingCoolingState');

    // set this to a valid value for CurrentHeatingCoolingState
    callback(null, this.status === Gateway.enums.ON_OFF.ON ? this.Characteristic.CurrentHeatingCoolingState.HEAT : this.Characteristic.CurrentHeatingCoolingState.OFF)
  }

  /**
   * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
   */
  getTargetHeatingCoolingState(callback) {
    this.log.debug('Triggered GET TargetHeatingCoolingState');


    // set this to a valid value for TargetHeatingCoolingState
    callback(null, this.status === Gateway.enums.ON_OFF.ON ? this.Characteristic.CurrentHeatingCoolingState.HEAT : this.Characteristic.CurrentHeatingCoolingState.OFF)
  }

  /**
   * Handle requests to set the "Target Heating Cooling State" characteristic
   */
  setTargetHeatingCoolingState(value, callback) {
    this.log.debug('Triggered SET TargetHeatingCoolingState:', value);

    callback(null);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  getCurrentTemperature(callback) {
    this.log.debug('Triggered GET CurrentTemperature');
    // set this to a valid value for CurrentTemperature
    callback(null, this.status.currentTemp)

  }


  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  getTargetTemperature(callback) {
    this.log.debug('Triggered GET TargetTemperature');
    // set this to a valid value for TargetTemperature
    callback(null, this.status.targetTemp)
  }


  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  setTargetTemperature(value, callback) {
    this.log.debug('Triggered SET TargetTemperature:', value);

    callback(null);
  }

  // /**
  //  * Handle requests to get the current value of the "Temperature Display Units" characteristic
  //  */
  getTemperatureDisplayUnits(callback) {
    this.log.debug('Triggered GET TemperatureDisplayUnits');

    callback(null, this.Characteristic.TemperatureDisplayUnits.CELSIUS);
  }


  getStatus(callback, key, func) {
    var value = this.gateway.heating[key];
    if (func)
      value = func(value);

    callback(null, value)
  }

  setStatus(newStatus) {
    if (!this.status)
      this.status = newStatus;
    if (newStatus) {
      if (this.status.status != newStatus.status) {
        var stateValue = newStatus.status === Gateway.enums.ON_OFF.ON ? this.Characteristic.CurrentHeatingCoolingState.HEAT : this.Characteristic.CurrentHeatingCoolingState.OFF;

        this.zoneService.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
          .updateValue(stateValue);
        this.zoneService.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
          .updateValue(stateValue);
      }
      if (this.status.currentTemp != newStatus.currentTemp)
        this.zoneService.getCharacteristic(this.Characteristic.CurrentTemperature)
          .updateValue(newStatus.currentTemp);

      if (this.status.targetTemp != newStatus.targetTemp)
        this.zoneService.getCharacteristic(this.Characteristic.TargetTemperature)
          .updateValue(newStatus.targetTemp);
      this.status = newStatus;
    }
  }

  ////////////////////////
  // ZONE SERVICE FUNCTIONS
  ////////////////////////

  setUpServices() {
    this.zoneService = this.createZoneService();
    this.zoneService.setPrimaryService(true);
  }

  createZoneService() {
    this.log.debug('Creating %s service for controller', this.name);
    const zoneService = this.accessory.getServiceById(this.Service.Thermostat, 'zoneservice') || this.accessory.addService(this.Service.Thermostat, this.name, 'zoneservice');

    zoneService.setCharacteristic(this.Characteristic.ConfiguredName, this.name)

    zoneService.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
      .setProps({
        maxValue: this.Characteristic.CurrentHeatingCoolingState.HEAT
      })
      .on('get', (callback) => { this.getStatus(callback, 'status', (value) => { return value === Gateway.enums.ON_OFF.ON ? this.Characteristic.CurrentHeatingCoolingState.HEAT : this.Characteristic.CurrentHeatingCoolingState.OFF }) });

    zoneService.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
      .setProps({
        maxValue: this.Characteristic.TargetHeatingCoolingState.HEAT
      })
      .on('get', (callback) => { this.getStatus(callback, 'status', (value) => { return value === Gateway.enums.ON_OFF.ON ? this.Characteristic.CurrentHeatingCoolingState.HEAT : this.Characteristic.CurrentHeatingCoolingState.OFF }) })
      .on('set', this.setTargetHeatingCoolingState.bind(this));

    zoneService.getCharacteristic(this.Characteristic.CurrentTemperature)
      .setProps({
        maxValue: 50,
        minStep: 1
      })
      .on('get', (callback) => { this.getStatus(callback, 'currentTemp') })

    zoneService.getCharacteristic(this.Characteristic.TargetTemperature)
      .setProps({
        maxValue: 40,
        minStep: 1
      })
      .on('get', (callback) => { this.getStatus(callback, 'targetTemp') })
      .on('set', this.setTargetTemperature.bind(this));

    zoneService.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
      .setValue(this.Characteristic.TemperatureDisplayUnits.CELSIUS);

    this._enabledServices.push(zoneService);
    return zoneService;
  }



}
module.exports = HeatingAccessory
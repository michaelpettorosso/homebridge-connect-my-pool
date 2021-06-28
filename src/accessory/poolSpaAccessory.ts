
import { ConnectMyPoolPlatform } from "../connect-my-pool-platform";
import { ZoneAccessory } from "./zoneAccessory";
import { PoolSpaResponse, Controller, Zone } from '../ajaxResponse';
import { Categories, Service } from "homebridge";
import { ON_OFF_AUTO, POOL_SPA, ZONES } from "../constants";
export class PoolSpaAccessory extends ZoneAccessory {
  currentStatus!: PoolSpaResponse;
  previousStatus!: PoolSpaResponse;
  protected poolFilterSensorService!: Service;
  protected spaJetsSensorService!: Service;
  protected spaBlowerSensorService!: Service;
  protected spaJetsSwitchService!: Service;
  protected spaBlowerSwitchService!: Service;
  protected poolFilterPoolModeService!: Service;
  protected poolFilterSpaModeService!: Service;

  constructor(platform : ConnectMyPoolPlatform, controller: Controller, zone: Zone) {
         super(platform, controller, zone, Categories.SENSOR);
    
    //this.setUpServices();
    //accessory.updateReachability(true);
  }
  protected setStatus(newStatus: PoolSpaResponse) {
    super.setStatus(newStatus)
    if (newStatus && !(newStatus.zoneType === ZONES.POOL_AND_SPA))
      this.log?.error('setStatus Pool Spa', newStatus.zoneType, typeof newStatus);
    if (newStatus) {
      
      if (!this.currentStatus)
        this.currentStatus = newStatus;
      else
        this.previousStatus = this.currentStatus;

      this.poolFilterSensorService.getCharacteristic(this.Characteristic.StatusActive)
        .updateValue(this.getIsPoolFilterRunning(newStatus));
      
        this.poolFilterSensorService.getCharacteristic(this.Characteristic.ContactSensorState)
        .updateValue(this.getPoolFilterContactSensorState(newStatus));
      
      this.spaJetsSensorService.getCharacteristic(this.Characteristic.StatusActive)
        .updateValue(this.getIsSpaJetsRunning(newStatus));
      
        this.spaJetsSensorService.getCharacteristic(this.Characteristic.ContactSensorState)
        .updateValue(this.getSpaJetsContactSensorState(newStatus));

      this.spaBlowerSensorService.getCharacteristic(this.Characteristic.StatusActive)
        .updateValue(this.getIsSpaBlowerRunning(newStatus));
      
        this.spaBlowerSensorService.getCharacteristic(this.Characteristic.ContactSensorState)
        .updateValue(this.getSpaBlowerContactSensorState(newStatus));  

      this.spaJetsSwitchService.getCharacteristic(this.Characteristic.On)
        .updateValue(this.getSpaJetsModeState(newStatus)); 
        
      this.spaBlowerSwitchService.getCharacteristic(this.Characteristic.On)
        .updateValue(this.getSpaBlowerModeState(newStatus));

      this.poolFilterPoolModeService.getCharacteristic(this.Characteristic.On)
        .updateValue(this.getPoolFilterPoolModeState(newStatus));  
      
        this.poolFilterSpaModeService.getCharacteristic(this.Characteristic.On)
        .updateValue(this.getPoolFilterSpaModeState(newStatus));       
      this.currentStatus = newStatus;
    }
  }
  /// /////////////////////
  // UPDATE CHARACTERISTICS FROM ZONE
  /// /////////////////////

  /// /////////////////////
  // GET AND SET FUNCTIONS
  /// /////////////////////
  /**
   * Handle requests to get the current value of the "Is Active" characteristic
   */
  private getIsPoolFilterRunning(newStatus?: PoolSpaResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = status?.isPoolFilterRunning ?? false;
    this.debug('Get Is Pool Filter Running:', value);
    return value;
  }
  
  private getPoolFilterContactSensorState(newStatus?: PoolSpaResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = status?.isPoolFilterRunning ?? false ? this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : this.Characteristic.ContactSensorState.CONTACT_DETECTED;
    this.debug('Get Pool Filter Contact Sensor State:', value);
    return value;
  }

  private getPoolFilterPoolModeState(newStatus?: PoolSpaResponse): boolean {
    var value = this.getPoolModeState(newStatus) === POOL_SPA.POOL;
    this.debug('Get Pool Filter Pool Mode State:', value);
    return value
  }

  private getPoolFilterSpaModeState(newStatus?: PoolSpaResponse): boolean {
    var value = this.getPoolModeState(newStatus) === POOL_SPA.SPA;

    this.debug('Get Pool Filter Spa Mode State:', value);
    return value
  }

  private getPoolModeState(newStatus?: PoolSpaResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    return status?.poolSpaMode ?? POOL_SPA.POOL;
  }

     
  private getSpaJetsModeState(newStatus?: PoolSpaResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = (status?.spaJetsMode ?? ON_OFF_AUTO.OFF) === ON_OFF_AUTO.ON  ? true : false;
    this.debug('Get Spa Jets Mode State:', value);
    return value;
  }

  private getIsSpaJetsRunning(newStatus?: PoolSpaResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = status?.isSpaJetsRunning ?? false;
    this.debug('Get Is Spa Jets Running:', value);
    return value;
  }
     
  private getSpaJetsContactSensorState(newStatus?: PoolSpaResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = status?.isSpaJetsRunning ?? false ? this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : this.Characteristic.ContactSensorState.CONTACT_DETECTED;
    this.debug('Get Spa Jets Contact Sensor State:', value);
    return value;
  }

  private getSpaBlowerModeState(newStatus?: PoolSpaResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = (status?.spaBlowerMode ?? ON_OFF_AUTO.OFF) === ON_OFF_AUTO.ON  ? true : false;
    this.debug('Get Spa Blower Mode State:', value);
    return value;
  }

  private getIsSpaBlowerRunning(newStatus?: PoolSpaResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = status?.isSpaBlowerRunning ?? false;
    this.debug('Get Is Spa Blower Running:', value);
    return value;
  }
     
  private getSpaBlowerContactSensorState(newStatus?: PoolSpaResponse) {
    var status = newStatus ?? this.previousStatus;
    // set this to a valid value for CurrentTemperature
    var value = status?.isSpaBlowerRunning ?? false ? this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : this.Characteristic.ContactSensorState.CONTACT_DETECTED;
    this.debug('Get Spa Blower Contact Sensor State:', value);
    return value;
  }

  ////////////////////////
  // ZONE SERVICE FUNCTIONS
  ////////////////////////
      

  protected setupServices() {
  this.debug('setupServices', 'poolSpaAccessory');
  
  this.poolFilterSensorService = this.createPoolFilterSensorService();
  this.spaJetsSensorService = this.createSpaJetsSensorService();
  this.spaBlowerSensorService = this.createSpaBlowerSensorService();
  this.spaJetsSwitchService = this.createSpaJetsSwitchService();
  this.spaBlowerSwitchService = this.createSpaBlowerSwitchService();
  this.createPoolSpaFilterModeSwitchService();
  super.setupServices();
  }

// Configure the contact sensor on the Heater.
private createPoolSpaFilterModeSwitchService() {

  // Clear out any previous contact sensor service.
  const poolFilterPoolModeService = this.accessory.getServiceById(this.Service.Switch, 'poolmode') || this.accessory.addService(this.Service.Switch, this.zone.name + " Pool Mode", 'poolmode');

  poolFilterPoolModeService.getCharacteristic(this.Characteristic.On)
    .setValue(this.getPoolFilterPoolModeState())
    .onGet(this.getPoolFilterPoolModeState.bind(this))
  
  this.enabledServices.push(poolFilterPoolModeService);
  this.poolFilterPoolModeService = poolFilterPoolModeService;
  const poolFilterSpaModeService = this.accessory.getServiceById(this.Service.Switch, 'spamode') || this.accessory.addService(this.Service.Switch, this.zone.name + " Spa Mode", 'spamode');
  poolFilterSpaModeService.getCharacteristic(this.Characteristic.On)
    .setValue(this.getPoolFilterSpaModeState())
    .onGet(this.getPoolFilterSpaModeState.bind(this))
  
  this.enabledServices.push(poolFilterSpaModeService);
  this.poolFilterSpaModeService = poolFilterSpaModeService;
}

// Configure the contact sensor on the Heater.
private createSpaJetsSwitchService(): Service {

  // Clear out any previous contact sensor service.
  const spaJetsSwitchService = this.accessory.getServiceById(this.Service.Switch, 'spajets') || this.accessory.addService(this.Service.Switch, this.zone.name + " Spa Jets", 'spajets');

  spaJetsSwitchService.getCharacteristic(this.Characteristic.On)
    .setValue(this.getSpaJetsModeState())
    .onGet(this.getSpaJetsModeState.bind(this))
  
  this.enabledServices.push(spaJetsSwitchService);
  return spaJetsSwitchService;
}

// Configure the contact sensor on the Heater.
private createSpaBlowerSwitchService(): Service {

  // Clear out any previous contact sensor service.
  const spaBlowerSwitchService = this.accessory.getServiceById(this.Service.Switch, 'spablower') || this.accessory.addService(this.Service.Switch, this.zone.name + " Spa Blower", 'spablower');

  spaBlowerSwitchService.getCharacteristic(this.Characteristic.On)
    .setValue(this.getSpaBlowerModeState())
    .onGet(this.getSpaBlowerModeState.bind(this))
  
  this.enabledServices.push(spaBlowerSwitchService);
  return spaBlowerSwitchService;
}

  // Configure the contact sensor on the Heater.
  private createPoolFilterSensorService(): Service {

    // Clear out any previous contact sensor service.
    const poolFilterSensorService = this.accessory.getServiceById(this.Service.ContactSensor, 'poolfilter') || this.accessory.addService(this.Service.ContactSensor, this.zone.name + " Running", 'poolfilter');

    poolFilterSensorService.getCharacteristic(this.Characteristic.StatusActive)
      .setValue(this.getIsPoolFilterRunning())
      .onGet(this.getIsPoolFilterRunning.bind(this))
    
    poolFilterSensorService.getCharacteristic(this.Characteristic.ContactSensorState)
      .setValue(this.getPoolFilterContactSensorState())
      .onGet(this.getPoolFilterContactSensorState.bind(this))

    this.enabledServices.push(poolFilterSensorService);
    return poolFilterSensorService;
  }

  // Configure the contact sensor on the Heater.
  private createSpaJetsSensorService(): Service {

    // Clear out any previous contact sensor service.
    const spaJetsSensorService = this.accessory.getServiceById(this.Service.ContactSensor, 'spajets') || this.accessory.addService(this.Service.ContactSensor, this.zone.name + " Spa Jets Running", 'spajets');

    spaJetsSensorService.getCharacteristic(this.Characteristic.StatusActive)
      .setValue(this.getIsSpaJetsRunning())
      .onGet(this.getIsSpaJetsRunning.bind(this))
    
    spaJetsSensorService.getCharacteristic(this.Characteristic.ContactSensorState)
      .setValue(this.getSpaJetsContactSensorState())
      .onGet(this.getSpaJetsContactSensorState.bind(this))

    this.enabledServices.push(spaJetsSensorService);
    return spaJetsSensorService;
  }

  // Configure the contact sensor on the Heater.
  private createSpaBlowerSensorService(): Service {

    // Clear out any previous contact sensor service.
    const spaBlowerSensorService = this.accessory.getServiceById(this.Service.ContactSensor, 'spablower') || this.accessory.addService(this.Service.ContactSensor, this.zone.name + " Blower Running", 'spablower');

    spaBlowerSensorService.getCharacteristic(this.Characteristic.StatusActive)
      .setValue(this.getIsSpaBlowerRunning())
      .onGet(this.getIsSpaBlowerRunning.bind(this))
    
    spaBlowerSensorService.getCharacteristic(this.Characteristic.ContactSensorState)
      .setValue(this.getSpaBlowerContactSensorState())
      .onGet(this.getSpaBlowerContactSensorState.bind(this))

    this.enabledServices.push(spaBlowerSensorService);
    return spaBlowerSensorService;
  }
}

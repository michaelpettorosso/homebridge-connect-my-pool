
import { ConnectMyPoolPlatform } from "../connect-my-pool-platform";
import { ZoneAccessory } from "./zoneAccessory";
import { PoolSpaResponse, Controller, Zone } from '../ajaxResponse';
import { Service } from "homebridge";
import { ZONES } from "../constants";
export class PoolSpaAccessory extends ZoneAccessory {
  currentStatus!: PoolSpaResponse;
  previousStatus!: PoolSpaResponse;
  protected poolFilterSensorService!: Service;
  protected spaJetsSensorService!: Service;
  protected spaBlowerSensorService!: Service;
  constructor(platform : ConnectMyPoolPlatform, controller: Controller, zone: Zone) {
         super(platform, controller, zone);
    
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
  this.zoneService.setPrimaryService(true);
  this.spaJetsSensorService = this.createSpaJetsSensorService();
  this.spaBlowerSensorService = this.createSpaBlowerSensorService();
  super.setupServices();
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
    const spaBlowerSensorService = this.accessory.getServiceById(this.Service.ContactSensor, 'spablower') || this.accessory.addService(this.Service.ContactSensor, this.zone.name + " Spa Jets Running", 'spablower');

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

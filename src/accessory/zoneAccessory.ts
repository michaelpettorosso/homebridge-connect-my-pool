import { AstralGatewayAPI } from '../astralGatewayAPI';
import { ConnectMyPoolPlatform } from '../connect-my-pool-platform';
import { API, HAP, Logging, PlatformAccessory, Service, Categories} from "homebridge";
import { Controller, HeaterResponse, HeatingResponse, SolarResponse, Zone, ZoneResponse } from '../ajaxResponse';
import {  EMIT, MANUFACTURER, PLUGIN_NAME, PLUGIN_VERSION, ZONES } from '../constants';

export abstract class ZoneAccessory {
    readonly gateway : AstralGatewayAPI;
    accessory!: PlatformAccessory;
    protected api: API;
    protected platform: ConnectMyPoolPlatform;
    protected debug: (message: string, ...parameters: any[]) => void;
    protected hap: HAP;

    readonly zone: Zone;
    protected log: Logging;
    readonly controller: Controller;
    readonly name:string;
    readonly serial: string;
    readonly model:string;
    protected enabledServices: Service[] = [];
    protected Service;
    protected Characteristic;
    
    #buttons = {};
    constructor(platform : ConnectMyPoolPlatform, controller: Controller, zone: Zone, categories: Categories) {
        this.api = platform.api;
        this.debug = platform.debug.bind(platform);
        this.hap = this.api.hap;    
        this.Service = platform.api.hap.Service;
        this.Characteristic = platform.api.hap.Characteristic;
        this.log = platform.log;        
        this.platform = platform;
        this.gateway = platform.gateway;
        const uuid = this.api.hap.uuid.generate(controller.name + zone.type);

        // create a new accessory
        this.log?.info('Adding new accessory: %s, %s', `${zone.name}`, zone.type);
        this.accessory = new this.api.platformAccessory(`${zone.name}`, uuid, categories);
        this.controller = controller;
        this.zone = zone;

        
        var zoneName = zone.name;

        this.accessory.on('identify', this.identifyAccessory.bind(this));

        this.name = zoneName;
        this.serial = `0000-0000-0001`;
        this.model = `${controller.name}-${this.name}`;

        this.debug('Name %s', this.name);

        this.#buttons = {
        };
        this.gateway.on(EMIT.ZONE, this.eventZone.bind(this));

        this.setAccessoryInformationService();

        this.setupServices()
        

    }
    private identifyAccessory = () => {
        this.log?.info(this.accessory.displayName, "Identify!");
    }

    protected  eventZone = (zoneStatus: ZoneResponse | HeatingResponse | SolarResponse) => {
  
      if (this.zone.type === zoneStatus.zoneType) {
          //this.debug('System Zone Event %s', zoneStatus.zoneType)
          this.debug('Calling SetStatus Zone %s', zoneStatus.zoneType)
          this.setStatus(zoneStatus);
      }
    };
    ////////////////////////
    // UPDATE CHARACTERISTICS FROM ZONE
    ////////////////////////

    ////////////////////////
    // GET AND SET FUNCTIONS
    ////////////////////////

    
    ////////////////////////
    // ZONE SERVICE FUNCTIONS
    ////////////////////////

    setAccessoryInformationService() {

           // if((this.accessory = this.platform.accessories.find((x: PlatformAccessory) => x.UUID === uuid)!) === undefined) {

        var infoService = this.accessory.getService(this.Service.AccessoryInformation);
        if (infoService)
        {
        infoService
            .updateCharacteristic(this.Characteristic.Name, this.name)
            .updateCharacteristic(this.Characteristic.Manufacturer, MANUFACTURER)
            .updateCharacteristic(this.Characteristic.Model, this.model)
            .updateCharacteristic(this.Characteristic.SerialNumber, this.serial)
            .updateCharacteristic(this.Characteristic.FirmwareRevision, PLUGIN_VERSION)
            ;
        var configuredName = infoService.getCharacteristic(this.Characteristic.ConfiguredName) || infoService.addCharacteristic(this.Characteristic.ConfiguredName);
        if (configuredName.value === '')
            configuredName.setValue(this.name)
        var hardwareRevision = infoService.getCharacteristic(this.Characteristic.HardwareRevision) || infoService.addCharacteristic(this.Characteristic.HardwareRevision);
        hardwareRevision.setValue(this.controller.macAddress ?? PLUGIN_VERSION)
        var softwareRevision = infoService.getCharacteristic(this.Characteristic.SoftwareRevision) || infoService.addCharacteristic(this.Characteristic.SoftwareRevision);
        softwareRevision.setValue(this.controller.systemVersion ?? PLUGIN_VERSION);

        this.enabledServices.push(infoService)
        }
    }

    protected setStatus(newStatus: ZoneResponse): void {
       
    }

    protected setupServices(): void {
      // link the accessory to your platform
      this.api.publishExternalAccessories(PLUGIN_NAME, [this.accessory]);

      // Refresh the accessory cache with these values.
      this.api.updatePlatformAccessories([this.accessory]);
    }

}

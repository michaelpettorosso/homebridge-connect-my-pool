const Gateway = require('./gateway');
const PLUGIN_VERSION = '0.0.1';
const MANUFACTURER = 'Astral';

class ZoneAccessory {
    log = null;
    gateway = null;
    accessory = null;
    zone = null;
    name = null;
    _enabledServices = [];
    Service = null;
    Characteristic = null;

    #buttons = {};
    constructor(platform, accessory, controller, zone) {
        this.Service = platform.api.hap.Service;
        this.Characteristic = platform.api.hap.Characteristic;
        this.log = platform.log;
        this.gateway = platform.gateway;
        this.accessory = accessory;
        this.controller = controller;
        this.zone = zone;

        
        var zoneName = zone.name;

        accessory.on('identify', this.identifyAccessory);

        this.name = zoneName;
        this.serial = `0000-0000-0001`;
        this.model = `${controller.name}-${this.name}`;

        this.log.debug('Name %s', this.name);

        this.#buttons = {
        };
        this.gateway.on(Gateway.enums.EMIT.ZONE, this.eventZone.bind(this));

        this.setAccessoryInformationService();
        //accessory.updateReachability(true);
    }
    identifyAccessory = (paired, callback) => {
        this.log.info(this.accessory.displayName, "Identify!");
        callback();
    }

    eventZone = (controllerId, zoneId, variable, value) => {
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
        this.infoService = this.accessory.getServiceById(this.Service.AccessoryInformation);
        this.infoService
            .updateCharacteristic(this.Characteristic.Name, this.name)
            .updateCharacteristic(this.Characteristic.Manufacturer, MANUFACTURER)
            .updateCharacteristic(this.Characteristic.Model, this.model)
            .updateCharacteristic(this.Characteristic.SerialNumber, this.serial)
            .updateCharacteristic(this.Characteristic.FirmwareRevision, PLUGIN_VERSION);
        var configuredName = this.infoService.getCharacteristic(this.Characteristic.ConfiguredName) || this.infoService.addCharacteristic(this.Characteristic.ConfiguredName);
        if (configuredName.value === '')
            configuredName.setValue(this.name)
        var hardwareRevision = this.infoService.getCharacteristic(this.Characteristic.HardwareRevision) || this.infoService.addCharacteristic(this.Characteristic.HardwareRevision);
        hardwareRevision.setValue(this.controller.macAddress)
        var softwareRevision = this.infoService.getCharacteristic(this.Characteristic.SoftwareRevision) || this.infoService.addCharacteristic(this.Characteristic.SoftwareRevision);
        softwareRevision.setValue(this.controller.systemVersion);

        this._enabledServices.push(this.infoService)
    }

    setStatus(newStatus) {
    }

}
module.exports = ZoneAccessory;
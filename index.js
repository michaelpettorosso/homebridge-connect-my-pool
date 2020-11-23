'use strict';
const moment = require('moment');
const Gateway = require('./gateway');
const PoolSpaAccessory = require('./poolSpaAccessory');
const LightingAccessory = require('./lightingAccessory');
const HeatingAccessory = require('./heatingAccessory');
const PLUGIN_NAME = 'homebridge-connect-my-pool';
const PLATFORM_NAME = 'Connect My Pool';


module.exports = api => {
  const Categories = api.hap.Accessory.Categories;
  const PlatformAccessory = api.platformAccessory;
  const UUIDGen = api.hap.uuid;

  class AstralPlatform {
    _lastUpdate = moment();
    constructor(log, config) {
      this.log = log;
      this.config = config;
      if (config && !this.config.refreshTime)
        this.config.refreshTime = 5;

      this.api = api;

      this.log.debugEnabled = (this.config.debug === true)

      this.controller = {
        name: 'Astral Gateway'
      };
      this.zones = null;
      this.accessories = [];
      this.zoneAccessories = [];
      // if (this.config.controller === undefined) {
      //   this.log.error('ERROR: your configuration is incorrect.');
      //   this.controller = null;
      // }
      this.gateway = null;
      api.on('didFinishLaunching', () => {
        this.setupController();
      })
    }

    pollStatus() {
      var self = this
      var refreshTime = self.config.refreshTime; //Add time to process requests
      var now = moment()
      var lastUpdate = self._lastUpdate
      var delta = now.diff(lastUpdate, 'seconds')
      if (delta < refreshTime) {
        clearTimeout(self.pollTimer)
        self.pollTimer = setTimeout(function () {
          self.pollStatus(self)
        }, 1000 * (refreshTime - delta))
      } else {

        self.log('Polling status for ' + self.controller.name + '...')
        this.gateway.getSystemStatus().then(() => {
          self._lastUpdate = now;
          setTimeout(() => {
            self.pollStatus(self)
          }, (1000 * refreshTime));
        });
      }
    }



    ///////////////////
    // EVENT FUNCTIONS
    ///////////////////
    eventDebug = (response) => {
      this.log.debug('eventDebug: %s', response);
    };

    eventError = (response) => {
      this.log.error('eventError: %s', response);
    };

    eventConnect = (status) => {
      this.log.info('eventConnect');
    };

    eventClose = () => {
      this.log.info('eventClose');
    };

    eventZone = (type, status) => {
      this.log.debug('System Zone Event %s', type)
      var zone = this.gateway.configuredZones.find(z => z.type === type);
      var zoneIndex = this.gateway.configuredZones.findIndex(z => z.type === type);
      if (status) {
        var zoneStatus = status[zone.type];
        if (this.zoneAccessories.length > 0)
          this.zoneAccessories[zoneIndex].setStatus(zoneStatus);
      }
    };

    //When Configured Zones have been determined 
    eventSystemStatus = (status) => {
      this.log.debug('System Status Event')
      // var self = this;
      // if (this.zoneAccessories.length === 0)
      //   self.createAccessories(status);
    };

    ///////////////////
    // SETUP CONTROLLERS
    ///////////////////

    setupController = () => {
      this.gateway = new Gateway(this.config, this.log);

      this.gateway.on(Gateway.enums.EMIT.DEBUG, this.eventDebug.bind(this));
      this.gateway.on(Gateway.enums.EMIT.ERROR, this.eventError.bind(this));
      this.gateway.on(Gateway.enums.EMIT.CONNECT, this.eventConnect.bind(this));
      this.gateway.on(Gateway.enums.EMIT.CLOSE, this.eventClose.bind(this));

      this.gateway.on(Gateway.enums.EMIT.ZONE, this.eventZone.bind(this));
      this.gateway.on(Gateway.enums.EMIT.SYSTEM_STATUS, this.eventSystemStatus.bind(this));

      if (this.gateway) {

        this.log.info("Connecting to Controller");

        this.gateway.connect().then(() => {
          this.log.info("Connected to Controller");
        }).catch((error) => {
          this.log.error("Error in connecting to Controller: %s", error);
        });
      }
      else {
        this.log.info('No Controllers configured.');
      }
      this.createAccessories();
    }

    ///////////////////
    // CREATE ACCESSORIES
    ///////////////////


    createAccessories = () => {
      if (this.zoneAccessories.length > 0) {
        // this.gateway.configuredZones.forEach((zone, index) => {
        //   var zoneStatus = status[zone.type];
        //   this.zoneAccessories[index].setStatus(zoneStatus);
        // });
        return;
      }
      else {
        if (this.gateway) {
          this.log.info('Creating %s Accessories', this.gateway.configuredZones.length);

          // Initialize our state for this controller. We need to maintain state separately for each controller.
          if (this.gateway.configuredZones) {
            this.gateway.configuredZones.forEach(zone => {
              const uuid = UUIDGen.generate(this.controller.name + zone.type);

              // create a new accessory
              this.log.info('Adding new accessory: %s, %s', `${zone.name}`, zone.type);
              var categories = Categories.THERMOSTAT;
              if (zone.type === Gateway.enums.ZONES.POOL_AND_SPA)
                categories = Categories.PROGRAMMABLE_SWITCH;
              else if (zone.type === Gateway.enums.ZONES.LIGHTING)
                categories = Categories.OUTLET;


              const accessory = new PlatformAccessory(`${zone.name}`, uuid, categories);
              var zoneAccessory = null;
              if (zone.type === Gateway.enums.ZONES.POOL_AND_SPA)
                zoneAccessory = new PoolSpaAccessory(this, accessory, this.controller, zone);
              else if (zone.type === Gateway.enums.ZONES.LIGHTING)
                zoneAccessory = new LightingAccessory(this, accessory, this.controller, zone);
              else
                zoneAccessory = new HeatingAccessory(this, accessory, this.controller, zone);
              // link the accessory to your platform
              api.publishExternalAccessories(PLUGIN_NAME, [accessory]);
              this.zoneAccessories.push(zoneAccessory);
              this.accessories.push(accessory);
            });
            this.log.debug('Added %s new accessories', this.accessories ? this.accessories.length : 0);
            this.pollStatus.call(this);
          }
          else
            this.log.debug('No Configured Zones for controller');
        }
      }
    }

    configureAccessory = (accessory) => {
      this.log.info('Loading accessory from cache:', accessory.displayName);

      // add the restored accessory to the accessories cache so we can track if it has already been registered
      this.accessories.push(accessory);
    }
  }
  api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, AstralPlatform, true);
}
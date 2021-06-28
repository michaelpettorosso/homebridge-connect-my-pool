import { API, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig } from "homebridge";
import { AstralGatewayAPI } from "./astralGatewayAPI";
import { APIStatus, HeatingResponse, ZoneResponse, Controller, Zone } from "./ajaxResponse";
import { ConnectMyPoolConfig } from "./connect-my-pool-types";

import { EMIT, ZONES, GATEWAY_NAME } from "./constants";
import util from "util";

import { ZoneAccessory } from "./accessory/zoneAccessory";

import { PoolSpaAccessory } from "./accessory/poolSpaAccessory";
import { LightingAccessory } from "./accessory/lightingAccessory";
import { HeatingAccessory } from "./accessory/heatingAccessory";
import { SolarAccessory } from "./accessory/solarAccessory";


export class ConnectMyPoolPlatform implements DynamicPlatformPlugin {
  accessories: PlatformAccessory[];
  config: ConnectMyPoolConfig;
  debugMode = false;
  gateway!: AstralGatewayAPI;
  controller: Controller
  status!: APIStatus;
  zones!: Zone[];
  readonly log: Logging;
  readonly api: API;
  
  private zoneAccessories: ZoneAccessory[];

  constructor(log: Logging, config: PlatformConfig, api: API) {
      this.api = api;
      this.log = log;
      this.config = config as any;
      // Capture configuration parameters.
      if(config.debug) {
        this.debugMode = config.debug === true;
        this.debug("Debug logging on. Expect a lot of data.");
      }

      this.controller = new Controller(GATEWAY_NAME);
     
      this.accessories = [];
      this.zoneAccessories = [];
      
      // if (this.config.controller === undefined) {
      //   this.log.error('ERROR: your configuration is incorrect.');
      //   this.controller = null;
      // }
      //this.gateway = null;
      this.api.on('didFinishLaunching', this.setupController.bind(this));
    }
    async poll<T>( fn : () => Promise<T>, interval: number, validate?: (v: T) => boolean, maxAttempts?: number ) :Promise<T>  {
      let attempts = 0;

      const executePoll = async (resolve: (v: T) => void, reject: (reason?:any) => void) =>  {
        const result = await fn();
        attempts++;

        if (validate && validate(result)) {
          return resolve(result);
        } else if (maxAttempts && attempts === maxAttempts) {
          return reject(new Error('Exceeded max attempts'));
        } else {
          setTimeout(executePoll, interval, resolve, reject);
        }
      };

      return new Promise(executePoll);
    };
 
   getRefreshTime(configRefresh: number) : number
   {
     if (!configRefresh)
        return 5;
      else
        return configRefresh
   }

    ///////////////////
    // EVENT FUNCTIONS
    ///////////////////
    private eventDebug = (response: string) => {
      this.debug('eventDebug: %s', response);
    };

    private eventError = (response: string) => {
      this.log?.error('eventError: %s', response);
    };

    private eventConnect = (status: APIStatus) => {
      this.log?.info('eventConnect');
    };

    private eventClose = () => {
      this.log?.info('eventClose');
    };

    //When Configured Zones have been determined 
    private eventSystemStatus = (status: APIStatus) => {

       this.debug('System Status Event')
      // var self = this;
      // if (this.zoneAccessories.length === 0)
      //   self.createAccessories(status);
    };

    // This gets called when homebridge restores cached accessories at startup. We
    // intentionally avoid doing anything significant here, and save all that logic
    // for device discovery.
    configureAccessory(accessory: PlatformAccessory): void {

      // Add this to the accessory array so we can track it.
      this.accessories.push(accessory);
    }

    ///////////////////
    // SETUP CONTROLLERS
    ///////////////////

    private setupController():void {
      this.gateway = new AstralGatewayAPI(this.config, this.log);

      this.gateway.on(EMIT.DEBUG, this.eventDebug.bind(this));
      this.gateway.on(EMIT.ERROR, this.eventError.bind(this));
      this.gateway.on(EMIT.CONNECT, this.eventConnect.bind(this));
      this.gateway.on(EMIT.CLOSE, this.eventClose.bind(this));
      this.gateway.on(EMIT.SYSTEM_STATUS, this.eventSystemStatus.bind(this));

      if (this.gateway) {

        this.log?.info("Connecting to Controller");

        this.gateway.connect().then((status) => {
          this.log?.info("Connected to Controller");
          this.status = status
          this.createAccessories(status);
        }).catch((error) => {
          this.log?.error("Error in connecting to Controller: %s", error);
        });
      }
      else {
        this.log?.info('No Controllers configured.');
      }
      
    }

private async pollStatus() : Promise<APIStatus> {
  var status = await this.gateway.getSystemStatus(this.status);
  this.status = status;
  return status;
}

    ///////////////////
    // CREATE ACCESSORIES
    ///////////////////


    private createAccessories(status: APIStatus): void {
      this.log?.info('Creating Accessories')
      if (this.zoneAccessories.length > 0) {
       
        return;
      }
      else {
        if (this.gateway) {
          this.log?.info('Creating %s Accessories', this.gateway.ConfiguredZones.length);

          // Initialize our state for this controller. We need to maintain state separately for each controller.
          if (this.gateway.ConfiguredZones) {
            this.gateway.ConfiguredZones.forEach(zone => {
             
              var zoneAccessory : ZoneAccessory | undefined;
              // if (zone.type === ZONES.POOL_AND_SPA)
              //   zoneAccessory = new PoolSpaAccessory(this, this.controller, zone);
              // else if (zone.type === ZONES.LIGHTING)
              //   zoneAccessory = new LightingAccessory(this, this.controller, zone);
              // else 
              if (zone.type === ZONES.SOLAR)  
                zoneAccessory = new SolarAccessory(this, this.controller, zone);
              else if (zone.type === ZONES.HEATING)  
                zoneAccessory = new HeatingAccessory(this, this.controller, zone);
              else if (zone.type === ZONES.POOL_AND_SPA)
                zoneAccessory = new PoolSpaAccessory(this, this.controller, zone);
                
              if (zoneAccessory)
              {
                this.zoneAccessories.push(zoneAccessory);
                this.accessories.push(zoneAccessory.accessory);
              }
              else
                this.log?.error('createAccessories - unrecognised zone type', zone.type);
            });
            this.debug('Added %s new accessories', this.accessories ? this.accessories.length : 0);

            
            this.poll(
              this.pollStatus.bind(this),
              this.getRefreshTime(this.config.refreshTime) * 1000,
            )
              .then((status) => { this.status = status; console.log(status)})
              .catch((err: Error) => console.error(err));

          }
          else
            this.debug('No Configured Zones for controller');
        }
      }
    }

    // Utility for debug logging.
  debug(message: string, ...parameters: any[]) {
    if(this.debugMode) {
      this.log(util.format(message, ...parameters));
    }
  }

}
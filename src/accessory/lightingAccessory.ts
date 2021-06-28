import { ConnectMyPoolPlatform } from "../connect-my-pool-platform";
import {ZoneAccessory } from "./zoneAccessory";
import { Controller, Zone } from '../ajaxResponse';
export class LightingAccessory extends ZoneAccessory {
    constructor(platform : ConnectMyPoolPlatform, controller: Controller, zone: Zone) {
        super(platform, controller, zone);
        //this.setUpServices();
        //accessory.updateReachability(true);
    }

    ////////////////////////
    // UPDATE CHARACTERISTICS FROM ZONE
    ////////////////////////

    ////////////////////////
    // GET AND SET FUNCTIONS
    ////////////////////////

    
    ////////////////////////
    // ZONE SERVICE FUNCTIONS
    ////////////////////////

}

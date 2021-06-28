import { ConnectMyPoolPlatform } from "../connect-my-pool-platform";
import {ZoneAccessory } from "./zoneAccessory";
import { Controller, Zone } from '../ajaxResponse';
import { Categories } from "homebridge";
export class LightingAccessory extends ZoneAccessory {
    constructor(platform : ConnectMyPoolPlatform, controller: Controller, zone: Zone) {
        super(platform, controller, zone, Categories.LIGHTBULB);
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

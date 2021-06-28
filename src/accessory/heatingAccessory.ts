import { HeatingResponse, Controller, Zone  } from "../ajaxResponse";
import { ConnectMyPoolPlatform } from "../connect-my-pool-platform";
import { HeaterAccessory } from "./heaterAccessory";

export class HeatingAccessory extends HeaterAccessory {
  currentStatus!: HeatingResponse;
  previousStatus!: HeatingResponse;
  constructor(platform : ConnectMyPoolPlatform, controller: Controller, zone: Zone) {
    super(platform, controller, zone);
  }

  protected setStatus(newStatus: HeatingResponse) {
    super.setStatus(newStatus)
  }
  ////////////////////////
  // UPDATE CHARACTERISTICS FROM ZONE
  ////////////////////////



  /// /////////////////////
  // GET AND SET FUNCTIONS
  /// /////////////////////

  

}

const Gateway = require('./gateway');
const ZoneAccessory = require('./zoneAccessory');

class PoolSpaAccessory extends ZoneAccessory {
    constructor(platform, accessory, controller, zone) {
        super(platform, accessory, controller, zone);
        //this.setUpServices();
        //accessory.updateReachability(true);
    }

    /// /////////////////////
    // UPDATE CHARACTERISTICS FROM ZONE
    /// /////////////////////



    /// /////////////////////
    // GET AND SET FUNCTIONS
    /// /////////////////////


    /*
      ////////////////////////
      // ZONE SERVICE FUNCTIONS
      ////////////////////////
    */



}
module.exports = PoolSpaAccessory
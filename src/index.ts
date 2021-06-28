/* Copyright(C) 2017-2020, MP (https://github.com/michaelpettorosso). All rights reserved.
 *
 * index.ts: homebridge-connect-my-pool plugin registration.
 */
import { API } from "homebridge";

import { ConnectMyPoolPlatform } from "./connect-my-pool-platform";
import { PLATFORM_NAME, PLUGIN_NAME } from "./constants";

// Register our platform with homebridge.
export = (api: API) => {
  api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, ConnectMyPoolPlatform);
}

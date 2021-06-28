import { PlatformConfig } from "homebridge";

/* Copyright(C) 2020, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * connect-my-pool-types.ts: Type definitions for Connect My Pool.
 */

// An complete description of the Doorbird device information JSON.
export interface ConnectMyPoolDeviceInfoInterface {
  BUILD_NUMBER: string,
  "DEVICE-TYPE": string,
  FIRMWARE: string,
  PRIMARY_MAC_ADDR: string,
  
}


// Connect My Pool configuration options.
export interface ConnectMyPoolConfigInterface {
  username: string,
  password: string,
  refreshTime: number
}

// We use types instead of interfaces here because we can more easily set the entire thing as readonly.
// Unfortunately, interfaces can't be quickly set as readonly in Typescript without marking each and
// every property as readonly along the way.
export type ConnectMyPoolDeviceInfo = Readonly<ConnectMyPoolDeviceInfoInterface>;
export type ConnectMyPoolConfig = Readonly<ConnectMyPoolConfigInterface | PlatformConfig>;

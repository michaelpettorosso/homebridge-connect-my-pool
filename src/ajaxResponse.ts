
import {CookieJar} from "request";

export class APIStatus {
    favourites!: ZoneResponse;
    poolSpa!: ZoneResponse;
    lighting! :ZoneResponse;
    heating!: HeatingResponse;
    solar!:ZoneResponse;
    chemistry!:ZoneResponse;
}

export class InputField {
   
    name:string;
    value: string;
    id: string;

    constructor(name: string, value: string, id: string){
        this.name = name;
        this.value = value;
        this.id = id;
    }
    
}

export class FormData { [key: string]: any };

export class Controller {
    name:string; 
    macAddress!:string; 
    systemVersion!:string
    constructor(name: string){
        this.name = name;
 
    }
}
export class Zone {
    name:string; 
    type: string; 
    constructor(name: string, type: string){
        this.name = name;
        this.type = type
    }
}

export class InputResponse{
    inputs: InputField[];
    
    constructor(inputs?: InputField[]){
        this.inputs = inputs ? inputs : [];
    }
}

export class ZoneResponse extends InputResponse { 
    zoneType : string;
    constructor(zoneType: string, inputs?: InputField[]){
        super(inputs)
        this.zoneType = zoneType;
    }
}

export class PoolSpaResponse extends ZoneResponse { 
    poolSpaMode: string | null;
    poolFilterMode: string | null;
    isPoolFilterRunning: boolean = false;
    spaJetsMode: string | null;
    isSpaJetsRunning: boolean = false;
    spaBlowerMode: string | null;
    isSpaBlowerRunning: boolean = false;
    constructor(zoneType: string, poolSpaMode: string | null, poolFilterMode: string | null, isPoolFilterRunning: boolean, spaJetsMode: string | null, isSpaJetsRunning: boolean, spaBlowerMode: string | null, isSpaBlowerRunning: boolean, inputs?: InputField[]){
        super(zoneType, inputs)
        this.poolSpaMode = poolSpaMode;
        this.poolFilterMode = poolFilterMode;
        this.isPoolFilterRunning = isPoolFilterRunning;
        this.spaJetsMode = spaJetsMode;
        this.isSpaJetsRunning = isSpaJetsRunning;
        this.spaBlowerMode = spaBlowerMode;
        this.isSpaBlowerRunning = isSpaBlowerRunning;
    }
}

export abstract class HeaterResponse extends ZoneResponse {
    status: string | null;
    isRunning: boolean = false;
    currentTemp: number | null;
    targetTemp: number | null;
    constructor(zoneType: string, 
                status: string | null,
                isRunning: boolean,
                currentTemp: number | null,
                targetTemp: number | null,
                inputs: InputField[])
        {
            super(zoneType, inputs)
            this.status = status;
            this.isRunning = isRunning;
            this.currentTemp = currentTemp;
            this.targetTemp = targetTemp;
        }
}
export class SolarResponse extends HeaterResponse {
    roofTemp: number | null;
    
    constructor(zoneType: string, 
                status: string | null,
                isRunning: boolean,
                currentTemp: number | null,
                targetTemp: number | null,
                roofTemp: number | null,
                inputs: InputField[])
        {
            super(zoneType, status, isRunning, currentTemp, targetTemp, inputs);
            this.roofTemp = roofTemp;
        }
}
              

export class HeatingResponse extends HeaterResponse {
    heatingMode: string | null;
    
    constructor(zoneType: string, 
                status: string | null,
                isRunning: boolean,            
                currentTemp: number | null,
                targetTemp: number | null,
                heatingMode: string | null,
                inputs: InputField[])
        {
            super(zoneType, status, isRunning, currentTemp, targetTemp, inputs);
            this.heatingMode = heatingMode;
        }
}
                    

export class AjaxResponse extends InputResponse {
    statusCode: number;
    body: string;
    headers: Headers | null;                 
    cookies!: CookieJar;
    constructor(statusCode: number,
                body: string,
                headers: Headers 
                )
                
        {
            super()
            this.statusCode = statusCode;
            this.body = body;
            this.headers = headers;
        }
}
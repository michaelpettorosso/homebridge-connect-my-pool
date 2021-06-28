import { Logging } from "homebridge";
import EventEmitter from "events";
import requestPromise from "request-promise";
import cheerio from "cheerio";
import { CookieJar } from "request";
import { Cookie } from "tough-cookie";

import { EMIT, URLS, ZONES, COMMANDS, POOL_SPA, ON_OFF_AUTO } from "./constants"; 
import { HeatingResponse, InputField, ZoneResponse, AjaxResponse, Zone, APIStatus, FormData, SolarResponse, PoolSpaResponse} from "./ajaxResponse";


import { ConnectMyPoolConfig } from "./connect-my-pool-types";

const BASE_URL: string = 'https://connectmypool.com.au';
export class AstralGatewayAPI extends EventEmitter {
    readonly username : string;
    readonly password : string;
    private poolId! : number;
    readonly log : Logging;
    private cookieJar! : CookieJar;

    constructor(config: ConnectMyPoolConfig, logger : Logging) {
        super();
        this.log = logger;
        this.username = config.username || 'email';
        this.password = config.password || 'password';
        this.cookieJar = requestPromise.jar();
    }

    get ConfiguredZones() : Zone[] {
        return [
            {
                name: 'Pool Pumps',
                type: ZONES.POOL_AND_SPA
            },
            {
                name: 'Pool Lighting',
                type: ZONES.LIGHTING
            },
            {
                name: 'Pool Heater',
                type: ZONES.HEATING
            },
            {
                name: 'Pool Solar Heater',
                type: ZONES.SOLAR
            }
        ]
    }
    private request(url: string, method : string = 'GET', formData?: FormData, headers?: { key: string; value: string; }[]) : Promise<AjaxResponse> {
        return new Promise((success, fail) => {
            var baseUrl = BASE_URL;

            var options : requestPromise.Options = {
                method: method,
                resolveWithFullResponse: true,
                simple: false,
                uri: baseUrl + url
            };
            if (headers)
                options.headers = headers; 

            if (!(method === 'GET' && url === URLS.login_url))
                options.jar = this.cookieJar;

            if (formData)
                options.form = formData;
            
            requestPromise(options)
                .then(async (response) => {
                    var body = response.body;
                    var resp = new AjaxResponse(
                        response.statusCode,
                        body,
                        response.headers
                    );
                    if (response.statusCode === 200) {
                        //success!
                        const $ = cheerio.load(body)

                        if ($('#ucLogin1$txtUserName').length > 0 )
                        {
                           await this.login();
                           return this.request(url, method, formData, headers);
                        }
                        else
                        {   
                            var p = $("input");
                            //var inputs : InputField[] = [];
                            p.each((index, e ) => {
                                var i = e as cheerio.TagElement;
                            resp.inputs.push(new InputField(i.attribs.name,i.attribs.value,i.attribs.id))
                            })
                        }
                    }
                    else {
                        // if ('location' in response.headers) {
                        //     resp.url = response.headers.location;
                        // }
                    }
                        
                    if (response.headers['set-cookie'])
                    {
                        var cookies : (Cookie | undefined)[] | undefined;
                        if (response.headers['set-cookie'] instanceof Array)
                            cookies = response.headers['set-cookie'].map(c => Cookie.parse(c));
                        else
                        {
                            var cookie = Cookie.parse(response.headers['set-cookie'])
                            if (cookie)
                                cookies = [cookie];
                        }
                        if (cookies) {
                            cookies.forEach(c => {
                                if (c)
                                  this.cookieJar.setCookie(c, baseUrl)
                            })
                        }
                    }


                    resp.cookies =  this.cookieJar;
                    success(resp);
                })

                .catch(function (err) {
                    fail(err)
                    //handle error
                });
        });
    }

    private async getFavourites(inputs?: InputField[]): Promise<ZoneResponse> {
        var response = await this.request(URLS.favourites_url);
        var favourites = new ZoneResponse(ZONES.FAVOURITES, response.inputs);
        
        this.emit(EMIT.ZONE, favourites);
        return favourites;
    }
    private async getPoolSpa(inputs?: InputField[]): Promise<PoolSpaResponse>  {
        var response = await this.request(URLS.pool_spa_url);
        
        const $ = cheerio.load(response.body)
        var poolSpaMode = $(COMMANDS.POOL_SPA.id_pump_mode_pool);
        var modePoolSpa : string | null = null;
        if (poolSpaMode.length > 0)
        {
            modePoolSpa = (poolSpaMode[0] as cheerio.TagElement).attribs.class === 'btn_blue' ? POOL_SPA.POOL : POOL_SPA.SPA;
        }   


        var poolPumpMode = $(COMMANDS.POOL_SPA.id_pool_filter);
        var poolPumpModeState : string | null = null;
        if (poolPumpMode.length > 0)
        {
            poolPumpModeState = $(poolPumpMode[0]).text();
        }

        var spaJetMode = $(COMMANDS.POOL_SPA.id_spa_jets);
        var spaJetsModeState : string | null = null;
        if (spaJetMode.length > 0)
        {
            spaJetsModeState = $(spaJetMode[0]).text();
        }

        var spaBlowerMode = $(COMMANDS.POOL_SPA.id_spa_blower);
        var spaBlowerModeState : string | null = null;
        if (spaBlowerMode.length > 0)
        {
            spaBlowerModeState = $(spaBlowerMode[0]).text();
        }
        
        var isPoolPumpRunning = $(COMMANDS.POOL_SPA.id_pool_filter_is_running).length > 0;
        var isSpaJetsRunning = $(COMMANDS.POOL_SPA.id_spa_jets_is_running).length > 0;
        var isSpaBlowerRunning = $(COMMANDS.POOL_SPA.id_spa_blower_is_running).length > 0;

        var poolSpa = new PoolSpaResponse(
            ZONES.POOL_AND_SPA, 
            modePoolSpa,
            poolPumpModeState,
            isPoolPumpRunning,
            spaJetsModeState,
            isSpaJetsRunning,
            spaBlowerModeState,
            isSpaBlowerRunning,
            response.inputs
        )

        if(inputs && !modePoolSpa)
        {
           this.log?.info('PoolSpaResponse No Status', response.body);
        }
        else
           this.log?.info('PoolSpaResponse', inputs ? 'With Inputs': 'No Inputs', poolSpa.poolSpaMode, poolSpa.poolFilterMode, poolSpa.isPoolFilterRunning, poolSpa.spaJetsMode, poolSpa.isSpaJetsRunning, poolSpa.spaBlowerMode, poolSpa.isSpaBlowerRunning);
 

        this.emit(EMIT.ZONE, poolSpa);
        return poolSpa;
    }

    private async getLighting(inputs?: InputField[]): Promise<ZoneResponse>  {
        var response = await this.request(URLS.lighting_url);
        var lighting = new ZoneResponse(ZONES.LIGHTING, response.inputs);
        
        this.emit(EMIT.ZONE, lighting);
        return lighting;
    }

    private async getHeating(inputs?: InputField[]) : Promise<HeatingResponse> {
        var response: AjaxResponse;

        // if (inputs) {
        //     var formData: FormData = {};
        //     formData['ctl00$ScriptManager2'] = 'ctl00$ScriptManager2|ctl00$cpPageContent$tmrAutoPost';
        //     inputs.forEach(i => {
        //         if (i.name.includes('$hdn') || i.name.startsWith('__'))
        //             formData[i.name] = i.value ? i.value : '';
        //     })
        //     formData['__EVENTTARGET'] = 'ctl00$cpPageContent$tmrAutoPost';
        //     formData['__EVENTARGUMENT'] = null;
        //     formData['__LASTFOCUS'] = null;

        //     formData['ctl00$ddlPool'] = this.poolId
        //     formData['__ASYNCPOST'] = true;

        //     var headers: {key: string, value: string}[] = [];
        //     headers.push({key: "content-type", value: "application/x-www-form-urlencoded; charset=UTF-8"});
        //     headers.push({key: 'user-agent', value:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36'});
        //     headers.push({key: 'x-microsoftajax', value:'Delta=true'});
        //     headers.push({ key: 'x-requested-with', value: 'XMLHttpRequest' });
        //     headers.push({ key: 'origin', value: BASE_URL});
        //     headers.push({ key: 'referer', value: BASE_URL + URLS.heating_url});
        //     headers.push({ key: 'accept', value: '*.*'});
        //     response = await this.request(URLS.heating_url, 'POST', formData, headers)
            
        //     if (response.body.includes('ScriptManager.SupportsPartialRendering'))
        //       {
        //           this.log?.error('getHeating', 'Partial Rendering error', headers)
        //           response = await this.request(URLS.heating_url);
        //       }
        // }
        // else
            response = await this.request(URLS.heating_url);
        const $ = cheerio.load(response.body)

        var currentTemp = $(COMMANDS.HEATING.id_current_temp);
        var status = response.inputs.find(i => i.id === COMMANDS.HEATING.status);
        var heatingMode = response.inputs.find(i => i.id === COMMANDS.HEATING.mode_pool_spa);
        var modePoolSpa = heatingMode ? heatingMode.value === '1' ? POOL_SPA.POOL : POOL_SPA.SPA : null;
        var statusOnOff = status ? status.value === '1' ? ON_OFF_AUTO.ON : ON_OFF_AUTO.OFF : null;
        var isRunning = $(COMMANDS.HEATING.id_is_running).length > 0;

        var currentId = COMMANDS.HEATING.pool_temp;
        if (modePoolSpa === POOL_SPA.SPA)
            currentId = COMMANDS.HEATING.spa_temp;
        var currentValue = response.inputs.find(i => i.id === currentId);

        var heating = new HeatingResponse(
            ZONES.HEATING, 
            statusOnOff,
            isRunning,
            currentTemp ? Number(currentTemp.text()) : null,
            currentValue ? Number(currentValue.value) : null,
            modePoolSpa,
            response.inputs
        )

        if(inputs && !status)
        {
           this.log?.info('HeatingResponse No Status', response.body);
        }
        else
           this.log?.info('HeatingResponse', inputs ? 'With Inputs': 'No Inputs', heating.status, heating.isRunning, heating.heatingMode, heating.currentTemp, heating.targetTemp);
        this.emit(EMIT.ZONE, heating);
        return heating;
    }

    private async getSolar(inputs?: InputField[]) : Promise<SolarResponse>{
        var response = await this.request(URLS.solar_url);
        const $ = cheerio.load(response.body)

        var currentTemp = $(COMMANDS.SOLAR.id_current_temp);
        var status = response.inputs.find(i => i.id === COMMANDS.SOLAR.status);
        var rooftemp = $(COMMANDS.SOLAR.id_roof_temp);
        var statusOnOffAuto = status ? status.value === '2' ? ON_OFF_AUTO.ON : status.value === '1' ? ON_OFF_AUTO.AUTO : ON_OFF_AUTO.OFF : null;
        var running = $(COMMANDS.SOLAR.id_is_running);
        var isRunning = running.length > 0;

        var currentId = COMMANDS.SOLAR.pool_temp;
        var currentValue = response.inputs.find(i => i.id === currentId);

        var solar = new SolarResponse(
            ZONES.SOLAR, 
            statusOnOffAuto,
            isRunning,
            currentTemp ? Number(currentTemp.text()) : null,
            currentValue ? Number(currentValue.value) : null,
            rooftemp ? Number(rooftemp.text()) : null,
            response.inputs
        )

        if(inputs && !status)
        {
           this.log?.info('SolarResponse No Status', response.body);
        }
        else
           this.log?.info('SolarResponse', inputs ? 'With Inputs': 'No Inputs', solar.status, solar.isRunning, solar.currentTemp, solar.roofTemp, solar.targetTemp);
        
        this.emit(EMIT.ZONE, solar);
        return solar;
    }

    private async getChemistry(inputs?: InputField[]): Promise<ZoneResponse> {
        var response = await this.request(URLS.chemistry_url);
        var chemistry = new ZoneResponse(ZONES.CHEMISTRY, response.inputs);
        
        this.emit(EMIT.ZONE, chemistry);
        return chemistry;
    }

    private getFormData(inputs : InputField[], target?: string, targetArgument?: string): FormData {

        var viewstate: string | null = null;
        var viewstategenerator: string | null = null;
        var eventvalidation: string | null = null;
        if (inputs)
        {
           viewstate = inputs.find(s => s.name === '__VIEWSTATE')?.value ?? null;
           viewstategenerator = inputs.find(s => s.name === '__VIEWSTATEGENERATOR')?.value ?? null;
           eventvalidation = inputs.find(s => s.name === '__EVENTVALIDATION')?.value ?? null;
        }

        return {
            ['__LASTFOCUS']: null,
            ['__EVENTTARGET']: target ?? null,
            ['__EVENTARGUMENT']: targetArgument ?? null,
            ['__VIEWSTATE']: viewstate,
            ['__VIEWSTATEGENERATOR']: viewstategenerator,
            ['__EVENTVALIDATION']: eventvalidation,
        }
    }

    private getPoolId(html: string): number {
        const $ = cheerio.load(html)
        return parseInt($('#ddlPool option:selected').val(), 10);
    }

    private async login() : Promise<AjaxResponse> {
        var response = await this.request(URLS.login_url);
        var formData = this.getFormData(response.inputs)
        formData['ucLogin1$txtUserName'] = this.username
        formData['ucLogin1$txtPassword'] = this.password
        formData['ucLogin1$btnLogin'] = 'Login'
        response = await this.request(URLS.login_url, 'POST', formData)
        if (response.statusCode === 302) {
            response = await this.request(URLS.home_url);
            this.poolId = this.getPoolId(response.body)

            formData = this.getFormData(response.inputs, 'ctl00$ddlPool')
            formData['ctl00$ddlPool'] = this.poolId

            response = await this.request(URLS.home_url, 'POST', formData)

            return response
        }       
        else throw new Error("Unable to Login");
    }

    public getSystemStatus(status?: APIStatus) : Promise<APIStatus> {
        var self = this
        return new Promise((success, fail) => {
            var Promises: Promise<ZoneResponse | HeatingResponse>[] = [];
            Promises.push(self.getFavourites(status?.favourites?.inputs));
            Promises.push(self.getPoolSpa(status?.poolSpa?.inputs));
            Promises.push(self.getLighting(status?.lighting?.inputs));
            Promises.push(self.getHeating(status?.heating?.inputs));
            Promises.push(self.getSolar(status?.solar?.inputs));
            Promises.push(self.getChemistry(status?.chemistry?.inputs));

            this.log?.debug("Getting System Status");
            Promise.all(Promises).then((responses) => {
                
                //this.log?.debug('Responses', responses);
                var status : APIStatus = {
                    favourites: responses[0],
                    poolSpa: responses[1],
                    lighting: responses[2],
                    heating: responses[3] as HeatingResponse,
                    solar: responses[4],
                    chemistry: responses[5],
                };
                self.emit(EMIT.SYSTEM_STATUS, status)
                success(status);
            }).catch((error) => {
                fail("Error in Getting System Status " + error);
            });
        });
    }

    public async connect(): Promise<APIStatus> {
        return new Promise<APIStatus>((success, fail) => {
            this.login().then(() => {
                success(this.getSystemStatus())
            }).catch((error) => {
                fail('Unable to login ' + error);
            });
        });

    }

    private async close() {
        this.emit(EMIT.CLOSE);
    }
}

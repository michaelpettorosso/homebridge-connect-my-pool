
const EventEmitter = require('events');
const Constants = require('./constants');
const rp = require('request-promise');
const cookieJar = rp.jar()
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const Cookie = tough.Cookie;
const enums = {
    EMIT: Constants.EMIT,
    URLS: Constants.URLS,
    ZONES: Constants.ZONES,
    COMMANDS: Constants.COMMANDS,
    POOL_SPA: Constants.POOL_SPA,
    ON_OFF: Constants.ON_OFF,

}
module.exports = class Gateway extends EventEmitter {
    _favourites = null;
    _poolSpa = null;
    _lighting = null;
    _heating = null;
    _solar = null;
    _chemistry = null;
    _intervalID = null;
    constructor(config, logger) {
        super();
        this.user = config.user || 'michael@pettorosso.com';
        this.pass = config.pass || 'C00per40'
        this.poolId = null;
        this.log = logger;
    }

    static enums = {
        EMIT: enums.EMIT,
        URLS: enums.URLS,
        ZONES: enums.ZONES,
        COMMANDS: enums.COMMANDS,
        POOL_SPA: enums.POOL_SPA,
        ON_OFF: enums.ON_OFF
    }

    get favourites() {
        return this._favourites;
    }
    get poolSpa() {
        return this._poolSpa;
    }
    get lighting() {
        return this._lighting;
    }
    get heating() {
        return this._heating;
    }
    get solar() {
        return this._solar;
    }
    get chemistry() {
        return this._chemistry;
    }

    get configuredZones() {
        return [
            {
                name: 'Pool and Spa',
                type: enums.ZONES.POOL_AND_SPA
            },
            {
                name: 'Lighting',
                type: enums.ZONES.LIGHTING
            },
            {
                name: 'Heating',
                type: enums.ZONES.HEATING
            },
            {
                name: 'Solar',
                type: enums.ZONES.SOLAR
            }
        ]
    }
    request = (url, method = 'GET', formData, headers) => {
        return new Promise((success, fail) => {
            var baseUrl = 'https://connectmypool.com.au';
            var options = {
                method: method,
                uri: baseUrl + url,
                resolveWithFullResponse: true,
                simple: false
            };
            if (headers) {
                options.headers = {};
                headers.forEach(h => {
                    options.headers[h.key] = h.value;
                })
            }

            if (formData)
                options.form = formData;
            if (!(method === 'GET' && url === enums.URLS.login_url))
                options.jar = cookieJar;

            rp(options)
                .then(function (response) {
                    var resp = {
                        statusCode: response.statusCode,
                        body: response.body,
                        headers: response.headers,
                    }
                    if (response.statusCode === 200) {
                        //success!
                        const $ = cheerio.load(response.body)

                        var p = $("input");
                        var inputs = []

                        for (let index = 0; index < p.length; index++) {
                            const i = p[index];
                            inputs.push({
                                name: i.attribs.name,
                                value: i.attribs.value,
                                id: i.attribs.id
                            })
                        }
                        if (inputs.length > 0)
                            resp.inputs = inputs;

                        var cookies;
                        if (response.headers['set-cookie'])
                            if (response.headers['set-cookie'] instanceof Array)
                                cookies = response.headers['set-cookie'].map(Cookie.parse);
                            else
                                cookies = [Cookie.parse(response.headers['set-cookie'])];
                        if (cookies) {
                            cookies.forEach(c => {
                                cookieJar.setCookie(c)
                            })
                        }
                    }
                    else {
                        // if ('location' in response.headers) {
                        //     resp.url = response.headers.location;
                        // }
                    }
                    resp.cookies = cookieJar
                    success(resp);
                })

                .catch(function (err) {
                    fail(err)
                    //handle error
                });
        });
    }

    async getFavourites() {
        var response = await this.request(enums.URLS.favourites_url);
        var favourites = {
            inputs: response.inputs
        }
        if (this.configuredZones.find(z => z.type === enums.ZONES.FAVOURITES))
            this.emit(enums.EMIT.ZONE, enums.ZONES.FAVOURITES, favourites);
        return favourites;
    }
    async getPoolSpa() {
        var response = await this.request(enums.URLS.pool_spa_url);
        var poolSpa = {
            inputs: response.inputs
        }
        if (this.configuredZones.find(z => z.type === enums.ZONES.POOL_AND_SPA))
            this.emit(enums.EMIT.ZONE, enums.ZONES.POOL_AND_SPA, poolSpa);
        return poolSpa;
    }

    async getLighting() {
        var response = await this.request(enums.URLS.lighting_url);
        var lighting = {
            inputs: response.inputs
        }
        if (this.configuredZones.find(z => z.type === enums.ZONES.LIGHTING))
            this.emit(enums.EMIT.ZONE, enums.ZONES.LIGHTING, lighting);
        return lighting;
    }

    async getHeating() {
        var response = null;

        if (this._heating && this._heating.inputs) {
            var formData = {};
            formData['ctl00$ScriptManager2'] = 'ctl00$ScriptManager2|ctl00$cpPageContent$tmrAutoPost';
            this._heating.inputs.forEach(i => {
                if (i.name.includes('$hdn') || i.name.startsWith('__'))
                    formData[i.name] = i.value ? i.value : '';
            })
            formData['__EVENTTARGET'] = 'ctl00$cpPageContent$tmrAutoPost';
            formData['__EVENTARGUMENT'] = null;
            formData['__LASTFOCUS'] = null;

            formData['ctl00$ddlPool'] = this.poolId
            formData['__ASYNCPOST'] = true;
            console.log(formData);
            response = await this.request(enums.URLS.heating_url, 'POST', formData, [{ key: 'X-MicrosoftAjax', value: 'Delta=true' }, { key: 'X-Requested-With', value: 'XMLHttpRequest' }])
            console.log(response);
        }
        else

            response = await this.request(enums.URLS.heating_url);

        const $ = cheerio.load(response.body)

        var currentTemp = $('#lblWaterTemp');
        var status = response.inputs.find(i => i.id === enums.COMMANDS.HEATING.status);
        var heatingMode = response.inputs.find(i => i.id === enums.COMMANDS.HEATING.mode_pool_spa);
        var modePoolSpa = heatingMode ? heatingMode.value === '1' ? enums.POOL_SPA.POOL : enums.POOL_SPA.POOL : null;
        var statusOnOff = status ? status.value === '1' ? enums.ON_OFF.ON : enums.ON_OFF.OFF : null;
        var running = $(`#imgOn`);
        var isRunning = running.length > 0;

        var currentId = enums.COMMANDS.HEATING.pool_temp;
        if (modePoolSpa === enums.POOL_SPA.SPA)
            currentId = enums.COMMANDS.HEATING.spa_temp;
        var currentValue = response.inputs.find(i => i.id === currentId);

        var heating = {
            status: statusOnOff,
            isRunning,
            heatingMode: modePoolSpa,
            currentTemp: currentTemp ? Number(currentTemp.text()) : null,
            targetTemp: currentValue ? Number(currentValue.value) : null,
            inputs: response.inputs
        }
        if (this.configuredZones.find(z => z.type === enums.ZONES.HEATING))
            this.emit(enums.EMIT.ZONE, enums.ZONES.HEATING, heating);
        return heating;
    }

    async getSolar() {
        var response = await this.request(enums.URLS.solar_url);
        var solar = {
            inputs: response.inputs
        }
        if (this.configuredZones.find(z => z.type === enums.ZONES.SOLAR))
            this.emit(enums.EMIT.ZONE, enums.ZONES.SOLAR, solar);
        return solar;
    }

    async getChemistry() {
        var response = await this.request(enums.URLS.chemistry_url);
        var chemistry = {
            inputs: response.inputs
        }
        if (this.configuredZones.find(z => z.type === enums.ZONES.CHEMISTRY))
            this.emit(enums.EMIT.ZONE, enums.ZONES.CHEMISTRY, chemistry);
        return chemistry;
    }

    getFormData(inputs, target, targetArgument) {
        return {
            ['__LASTFOCUS']: null,
            ['__EVENTTARGET']: target,
            ['__EVENTARGUMENT']: targetArgument,
            ['__VIEWSTATE']: inputs.find(s => s.name === '__VIEWSTATE').value,
            ['__VIEWSTATEGENERATOR']: inputs.find(s => s.name === '__VIEWSTATEGENERATOR').value,
            ['__EVENTVALIDATION']: inputs.find(s => s.name === '__EVENTVALIDATION').value,
        }
    }

    getPoolId(html) {
        const $ = cheerio.load(html)
        return $('#ddlPool option:selected').val();
    }

    async login() {
        var response = await this.request(enums.URLS.login_url);

        var formData = this.getFormData(response.inputs)
        formData['ucLogin1$txtUserName'] = this.user
        formData['ucLogin1$txtPassword'] = this.pass
        formData['ucLogin1$btnLogin'] = 'Login'
        response = await this.request(enums.URLS.login_url, 'POST', formData)

        response = await this.request(enums.URLS.home_url);
        this.poolId = this.getPoolId(response.body)

        formData = this.getFormData(response.inputs, 'ctl00$ddlPool')
        formData['ctl00$ddlPool'] = this.poolId

        response = await this.request(enums.URLS.home_url, 'POST', formData)

        return response
    }

    async getSystemStatus() {
        return new Promise((success, fail) => {
            var Promises = [];
            Promises.push(this.getFavourites());
            Promises.push(this.getPoolSpa());
            Promises.push(this.getLighting());
            Promises.push(this.getHeating());
            Promises.push(this.getSolar());
            Promises.push(this.getChemistry());

            this.log.debug("Getting System Status");
            Promise.all(Promises).then((responses) => {
                this._favourites = responses[0];
                this._poolSpa = responses[1];
                this._lighting = responses[2];
                this._heating = responses[3];
                this._solar = responses[4];
                this._chemistry = responses[5];

                var status = {
                    [enums.ZONES.FAVOURITES]: this._favourites,
                    [enums.ZONES.POOL_AND_SPA]: this._poolSpa,
                    [enums.ZONES.LIGHTING]: this._lighting,
                    [enums.ZONES.HEATING]: this._heating,
                    [enums.ZONES.SOLAR]: this._solar,
                    [enums.ZONES.CHEMISTRY]: this._chemistry,
                };
                this.emit(enums.EMIT.SYSTEM_STATUS, status)
                success(status);
            }).catch((error) => {
                fail("Error in getting Controller settings " + error);
            });
        });
    }

    async connect() {
        return new Promise((success, fail) => {
            this.login().then(() => {
                this.getSystemStatus().then((status) => {
                    success()
                    this.emit(enums.EMIT.CONNECT, status);
                }).catch((error) => {
                    this.log.error(error);
                    fail('Unable to get status ' + error);
                });
            }).catch((error) => {
                this.log.error("Error in connecting to this Controller: %s", error);
                fail('Unable to login ' + error);
            });
        });

    }

    async close() {
        this.emit(enums.EMIT.CLOSE);
    }
}

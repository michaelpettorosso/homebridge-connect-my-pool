const URLS = {

    login_url: '/Front/Login.aspx',
    home_url: '/Account/Home.aspx',
    favourites_url: '/Account/Favourites.aspx',
    pool_spa_url: '/Account/ChannelsValves.aspx',
    lighting_url: '/Account/Lighting.aspx',
    heating_url: '/Account/Heating.aspx',
    solar_url: '/Account/Solar.aspx',
    chemistry_url: '/Account/Chemistry.aspx'
};
const ZONES = {
    FAVOURITES: 'favourites',
    POOL_AND_SPA: 'pool_and_spa',
    LIGHTING: 'lighting',
    HEATING: 'heating',
    SOLAR: 'solar',
    CHEMISTRY: 'chemistry',
}

const POOL_SPA = {
    POOL: 'POOL',
    SPA: 'SPA'
}

const ON_OFF = {
    ON: 'ON',
    OFF: 'OFF'
}


const COMMANDS = {

    FAVOURITES: {
        all_auto: 'cpPageContent_btnAllAuto',
        allow_all: 'hdnAllowAll',
        set_favourite: 'hdnSetFavourite',
        favourite_id_1: 'cpPageContent_lvFavourites_hdnFavId_0',
        favourite_id_2: 'cpPageContent_lvFavourites_hdnFavId_1',
        favourite_id_3: 'cpPageContent_lvFavourites_hdnFavId_2',
        favourite_id_4: 'cpPageContent_lvFavourites_hdnFavId_3'
    },
    POOL_SPA: {
        all_auto: 'cpPageContent_btnAllAuto',
        set_pool_spa: 'hdnSetPoolSpa',
        set_channel_mode: 'hdnSetChannelMode',
        set_valve_mode: 'hdnSetvalveMode',
        is_auto_available: 'IsAllAutoAvailable',
        channel_id: 'cpPageContent_RpChannel_hidden_',
        channel_value: 'cpPageContent_RpChannel_hdnChannelValue_',
        button_save: 'cpPageContent_btnSave'
    },
    LIGHTING: {
        sync_button: 'cpPageContent_btnSyncButton',
        all_auto: 'cpPageContent_btnAllAuto',
        set_zone_mode: 'hdnSetZoneMode',
        set_color: 'hdnSetColor',
        zone_id: 'cpPageContent_hdnZoneId',
        lighting_zone_id: 'cpPageContent_rptLighting_hdnLightingZoneId_',
        lighting_zone_value: 'cpPageContent_rptLighting_hdnZoneValue_',
        lighting_has_multicolor: 'cpPageContent_rptLighting_hdnIsMultiColor_',
        lighting_system_id: 'cpPageContent_rptLighting_hdnLightingSystemId_',
        lighting_zone_mode_id: 'cpPageContent_rptLighting_hdnLightingZoneModeId_',
        lighting_zone_mode_name: 'cpPageContent_rptLighting_hdnZoneModeName_'
    },
    HEATING: {
        is_operating_as_cooler: 'hdnIsOperateAsCooler_PID',
        water_temp_pid: 'hdnWaterTemp_PID',
        status_pid: 'hdnStatus_PID',
        pool_set_point_temp_pid: 'hdnPoolSetPointTemp_PID',
        spa_set_point_temp_pid: 'hdnSpaSetPointTemp_PID',
        mode_pid: 'hdnMode_PID',
        set_temp: 'hdnSetTemp',
        set_mode: 'hdnSetMode',
        temp: 'hdnTemp',
        heat_cool_mode_pid: 'hdnHeatCoolMode_PID',
        all_auto: 'btnAllAuto',
        heat_cool_mode: 'hdnHeatCoolMode',
        status: 'hdnStatus',
        heater_status: 'chkHeaterStatus',
        mode_pool_spa: 'hdnModePoolSPA',
        pool_temp: 'hdnPoolTemp',
        spa_temp: 'hdnSpaTemp',
        button_save: 'btnSubmit'
    },
    SOLAR: {
        set_temp: 'hdnSetTemp',
        set_mode: 'hdnSetMode',
        temp: 'hdnTemp',
        status: 'hdnStatus',
        pool_temp: 'hdnPoolTemp',
        button_save: 'btnSubmit'
    }
};

const EMIT = {
    SYSTEM: 'SYSTEM',
    SYSTEM_STATUS: 'SYSTEM_STATUS',
    ZONE: 'ZONE',
    DEBUG: 'debug',
    ERROR: 'error',
    CONNECT: 'connect',
    CLOSE: 'close'
}


module.exports = {
    URLS,
    COMMANDS,
    EMIT,
    ZONES,
    POOL_SPA,
    ON_OFF
}
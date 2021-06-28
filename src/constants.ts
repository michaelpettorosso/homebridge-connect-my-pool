export const PLUGIN_NAME : string = 'homebridge-connect-my-pool';
export const PLATFORM_NAME : string = 'Connect My Pool';
export const PLUGIN_VERSION  : string= '0.0.2';
export const MANUFACTURER : string = 'Astral';
export const GATEWAY_NAME : string = 'Astral Gateway';

export const URLS = {

    login_url: '/Front/Login.aspx',
    home_url: '/Account/Home.aspx',
    favourites_url: '/Account/Favourites.aspx',
    pool_spa_url: '/Account/ChannelsValves.aspx',
    lighting_url: '/Account/Lighting.aspx',
    heating_url: '/Account/Heating.aspx',
    solar_url: '/Account/Solar.aspx',
    chemistry_url: '/Account/Chemistry.aspx'
};
export declare const enum ZONES {
    FAVOURITES = 'favourites',
    POOL_AND_SPA = 'pool_and_spa',
    LIGHTING = 'lighting',
    HEATING ='heating',
    SOLAR ='solar',
    CHEMISTRY ='chemistry',
}

export declare const enum POOL_SPA {
    POOL = 'POOL',
    SPA = 'SPA'
}

export declare const enum ON_OFF_AUTO {
    ON = 'ON',
    OFF = 'OFF',
    AUTO = 'AUTO'
}


export const COMMANDS = {

    FAVOURITES : {
        all_auto : 'cpPageContent_btnAllAuto',
        allow_all : 'hdnAllowAll',
        set_favourite:'hdnSetFavourite',
        favourite_id_1:'cpPageContent_lvFavourites_hdnFavId_0',
        favourite_id_2:'cpPageContent_lvFavourites_hdnFavId_1',
        favourite_id_3:'cpPageContent_lvFavourites_hdnFavId_2',
        favourite_id_4:'cpPageContent_lvFavourites_hdnFavId_3'
    },
    POOL_SPA:{
        
        all_auto:'cpPageContent_btnAllAuto',
        set_pool_spa: 'hdnSetPoolSpa',
        set_channel_mode: 'hdnSetChannelMode',
        set_valve_mode: 'hdnSetvalveMode',
        is_auto_available: 'IsAllAutoAvailable',
        channel_id: 'cpPageContent_RpChannel_hidden_',
        channel_value: 'cpPageContent_RpChannel_hdnChannelValue_',
        button_save: 'cpPageContent_btnSave',
        id_pump_mode_pool: '#cpPageContent_lnkPoolMode',
        id_pump_mode_spa: '#cpPageContent_lnkSpaMode',
        
        id_rpchannel : '#cpPageContent_RpChannel',

        
        id_pool: '#cpPageContent_RpChannel_hidden_0',
        id_pool_filter : '#cpPageContent_RpChannel_aCurrentStatus_0',
        //cpPageContent_RpChannel_imgOn_0
        id_pool_filter_is_running: '#cpPageContent_RpChannel_imgOn_0',
        id_spa_jets : '#cpPageContent_RpChannel_aCurrentStatus_1',
        id_spa_jets_is_running: '#cpPageContent_RpChannel_imgOn_1',
        id_spa_blower : '#cpPageContent_RpChannel_aCurrentStatus_2',
        id_spa_blower_is_running: '#cpPageContent_RpChannel_imgOn_2'
    },
    LIGHTING : {
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
    HEATING : {
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
        button_save: 'btnSubmit',
        id_current_temp: '#lblWaterTemp',
        id_is_running: '#imgOn'
    },
    SOLAR : {
        set_temp: 'hdnSetTemp',
        set_mode: 'hdnSetMode',
        temp: 'hdnTemp',
        status: 'hdnStatus',
        pool_temp: 'hdnPoolTemp',
        button_save: 'btnSubmit',
        id_current_temp: '#lblWaterTemp',
        id_roof_temp: '#lblRoofTemp',
        id_is_running: '#imgOn'
    }
};

export declare const enum EMIT {
    SYSTEM='SYSTEM',
    SYSTEM_STATUS='SYSTEM_STATUS',
    ZONE='ZONE',
    DEBUG='debug',
    ERROR='error',
    CONNECT='connect',
    CLOSE='close'
}
import { CommandInfo } from '@bellatrix/appium/types';
import { CommandRepository } from '@bellatrix/appium/core/contracts';

export class MobileCommands {
    static readonly CREATE_SESSION = 'createSession';
    static readonly DELETE_SESSION = 'deleteSession';
    static readonly GET_CONTEXTS = 'getContexts';
    static readonly GET_CURRENT_CONTEXT = 'getCurrentContext';
    static readonly SET_CONTEXT = 'setContext';
    static readonly EXECUTE_SCRIPT = 'executeScript';
    static readonly IMPLICIT_WAIT = 'implicitWait';
    static readonly AVAILABLE_IME_ENGINES = 'availableIMEEngines';
    static readonly ACTIVE_IME_ENGINE = 'getActiveIMEEngine';
    static readonly IS_IME_ACTIVATED = 'isIMEActivated';
    static readonly DEACTIVATE_IME_ENGINE = 'deactivateIMEEngine';
    static readonly ACTIVATE_IME_ENGINE = 'activateIMEEngine';
    static readonly GET_WINDOW_SIZE = 'getWindowSize';
    static readonly KEYS = 'keys';
    static readonly GET_LOCATION = 'getLocation';
    static readonly GET_LOCATION_IN_VIEW = 'getLocationInView';
    static readonly GET_SIZE = 'getSize';
    static readonly TOUCH_CLICK = 'click';
    static readonly TOUCH_DOWN = 'touchDown';
    static readonly TOUCH_UP = 'touchUp';
    static readonly TOUCH_MOVE = 'touchMove';
    static readonly TOUCH_LONG_CLICK = 'touchLongClick';
    static readonly TOUCH_FLICK = 'flick';
    static readonly TOUCH_PERFORM = 'performTouch';
    static readonly TOUCH_MULTI_PERFORM = 'performMultiAction';
    static readonly DEVICE_LOCK = 'lock';
    static readonly DEVICE_UNLOCK = 'unlock';
    static readonly IS_DEVICE_LOCKED = 'isLocked';
    static readonly START_RECORDING_SCREEN = 'startRecordingScreen';
    static readonly STOP_RECORDING_SCREEN = 'stopRecordingScreen';
    static readonly GET_PERFORMANCE_DATA_TYPES = 'getPerformanceDataTypes';
    static readonly GET_PERFORMANCE_DATA = 'getPerformanceData';
    static readonly PRESS_KEYCODE = 'pressKeyCode';
    static readonly LONG_PRESS_KEYCODE = 'longPressKeyCode';
    static readonly FINGERPRINT = 'fingerprint';
    static readonly SEND_SMS = 'sendSMS';
    static readonly GSM_CALL = 'gsmCall';
    static readonly GSM_SIGNAL = 'gsmSignal';
    static readonly GSM_VOICE = 'gsmVoice';
    static readonly POWER_CAPACITY = 'powerCapacity';
    static readonly POWER_AC = 'powerAC';
    static readonly NETWORK_SPEED = 'networkSpeed';
    static readonly KEYEVENT = 'keyevent';
    static readonly GET_CURRENT_ACTIVITY = 'getCurrentActivity';
    static readonly GET_CURRENT_PACKAGE = 'getCurrentPackage';
    static readonly QUERY_APP_STATE = 'queryAppState';
    static readonly TOGGLE_AIRPLANE_MODE = 'toggleFlightMode';
    static readonly TOGGLE_DATA = 'toggleData';
    static readonly TOGGLE_WIFI = 'toggleWiFi';
    static readonly TOGGLE_LOCATION_SERVICES = 'toggleLocationServices';
    static readonly OPEN_NOTIFICATIONS = 'openNotifications';
    static readonly START_ACTIVITY = 'startActivity';
    static readonly GET_SYSTEM_BARS = 'getSystemBars';
    static readonly GET_DISPLAY_DENSITY = 'getDisplayDensity';
    static readonly LAUNCH_APP = 'launchApp';
    static readonly CLOSE_APP = 'closeApp';
    static readonly RESET_APP = 'reset';
    static readonly BACKGROUND_APP = 'background';
    static readonly GET_STRINGS = 'getStrings';
    static readonly SET_VALUE_IMMEDIATE = 'setValueImmediate';
    static readonly REPLACE_VALUE = 'replaceValue';
    static readonly SCREENSHOT = 'screenshot';
    static readonly ELEMENT_SCREENSHOT = 'elementScreenshot'
    static readonly GET_ACTIVE_ELEMENT = 'getActiveElement'

    public static commandRepository: CommandRepository = new Map([
        [this.CREATE_SESSION, this.postCommand('/session')],
        [this.DELETE_SESSION, this.deleteCommand('/session/:sessionId')],
        [this.GET_CONTEXTS, this.getCommand('/session/:sessionId/contexts')],
        [this.GET_CURRENT_CONTEXT, this.getCommand('/session/:sessionId/context')],
        [this.SET_CONTEXT, this.postCommand('/session/:sessionId/context')],
        [this.EXECUTE_SCRIPT, this.postCommand('/session/:sessionId/execute')],
        [this.IMPLICIT_WAIT, this.postCommand('/session/:sessionId/timeouts/implicit_wait')],
        [this.AVAILABLE_IME_ENGINES, this.getCommand('/session/:sessionId/ime/available_engines')],
        [this.ACTIVE_IME_ENGINE, this.getCommand('/session/:sessionId/ime/active_engine')],
        [this.IS_IME_ACTIVATED, this.getCommand('/session/:sessionId/ime/activated')],
        [this.DEACTIVATE_IME_ENGINE, this.postCommand('/session/:sessionId/ime/deactivate')],
        [this.ACTIVATE_IME_ENGINE, this.postCommand('/session/:sessionId/ime/activate')],
        [this.GET_WINDOW_SIZE, this.getCommand('/session/:sessionId/window/:windowhandle/size')],
        [this.KEYS, this.postCommand('/session/:sessionId/keys')],
        [this.GET_LOCATION, this.getCommand('/session/:sessionId/element/:elementId/location')],
        [this.GET_LOCATION_IN_VIEW, this.getCommand('/session/:sessionId/element/:elementId/location_in_view')],
        [this.GET_SIZE, this.getCommand('/session/:sessionId/element/:elementId/size')],
        [this.TOUCH_CLICK, this.postCommand('/session/:sessionId/touch/click')],
        [this.TOUCH_DOWN, this.postCommand('/session/:sessionId/touch/down')],
        [this.TOUCH_UP, this.postCommand('/session/:sessionId/touch/up')],
        [this.TOUCH_MOVE, this.postCommand('/session/:sessionId/touch/move')],
        [this.TOUCH_LONG_CLICK, this.postCommand('/session/:sessionId/touch/longclick')],
        [this.TOUCH_FLICK, this.postCommand('/session/:sessionId/touch/flick')],
        [this.TOUCH_PERFORM, this.postCommand('/session/:sessionId/touch/perform')],
        [this.TOUCH_MULTI_PERFORM, this.postCommand('/session/:sessionId/touch/multi/perform')],
        [this.DEVICE_LOCK, this.postCommand('/session/:sessionId/appium/device/lock')],
        [this.DEVICE_UNLOCK, this.postCommand('/session/:sessionId/appium/device/unlock')],
        [this.IS_DEVICE_LOCKED, this.postCommand('/session/:sessionId/appium/device/is_locked')],
        [this.START_RECORDING_SCREEN, this.postCommand('/session/:sessionId/appium/start_recording_screen')],
        [this.STOP_RECORDING_SCREEN, this.postCommand('/session/:sessionId/appium/stop_recording_screen')],
        [this.GET_PERFORMANCE_DATA_TYPES, this.postCommand('/session/:sessionId/appium/performanceData/types')],
        [this.GET_PERFORMANCE_DATA, this.postCommand('/session/:sessionId/appium/getPerformanceData')],
        [this.PRESS_KEYCODE, this.postCommand('/session/:sessionId/appium/device/press_keycode')],
        [this.LONG_PRESS_KEYCODE, this.postCommand('/session/:sessionId/appium/device/long_press_keycode')],
        [this.FINGERPRINT, this.postCommand('/session/:sessionId/appium/device/finger_print')],
        [this.SEND_SMS, this.postCommand('/session/:sessionId/appium/device/send_sms')],
        [this.GSM_CALL, this.postCommand('/session/:sessionId/appium/device/gsm_call')],
        [this.GSM_SIGNAL, this.postCommand('/session/:sessionId/appium/device/gsm_signal')],
        [this.GSM_VOICE, this.postCommand('/session/:sessionId/appium/device/gsm_voice')],
        [this.POWER_CAPACITY, this.postCommand('/session/:sessionId/appium/device/power_capacity')],
        [this.POWER_AC, this.postCommand('/session/:sessionId/appium/device/power_ac')],
        [this.NETWORK_SPEED, this.postCommand('/session/:sessionId/appium/device/network_speed')],
        [this.KEYEVENT, this.postCommand('/session/:sessionId/appium/device/keyevent')],
        [this.GET_CURRENT_ACTIVITY, this.getCommand('/session/:sessionId/appium/device/current_activity')],
        [this.GET_CURRENT_PACKAGE, this.getCommand('/session/:sessionId/appium/device/current_package')],
        [this.QUERY_APP_STATE, this.postCommand('/session/:sessionId/appium/device/app_state')],
        [this.TOGGLE_AIRPLANE_MODE, this.postCommand('/session/:sessionId/appium/device/toggle_airplane_mode')],
        [this.TOGGLE_DATA, this.postCommand('/session/:sessionId/appium/device/toggle_data')],
        [this.TOGGLE_WIFI, this.postCommand('/session/:sessionId/appium/device/toggle_wifi')],
        [this.TOGGLE_LOCATION_SERVICES, this.postCommand('/session/:sessionId/appium/device/toggle_location_services')],
        [this.OPEN_NOTIFICATIONS, this.postCommand('/session/:sessionId/appium/device/open_notifications')],
        [this.START_ACTIVITY, this.postCommand('/session/:sessionId/appium/device/start_activity')],
        [this.GET_SYSTEM_BARS, this.getCommand('/session/:sessionId/appium/device/system_bars')],
        [this.GET_DISPLAY_DENSITY, this.getCommand('/session/:sessionId/appium/device/display_density')],
        [this.LAUNCH_APP, this.postCommand('/session/:sessionId/appium/app/launch')],
        [this.CLOSE_APP, this.postCommand('/session/:sessionId/appium/app/close')],
        [this.RESET_APP, this.postCommand('/session/:sessionId/appium/app/reset')],
        [this.BACKGROUND_APP, this.postCommand('/session/:sessionId/appium/app/background')],
        [this.GET_STRINGS, this.postCommand('/session/:sessionId/appium/app/strings')],
        [this.SET_VALUE_IMMEDIATE, this.postCommand('/session/:sessionId/appium/element/:elementId/value')],
        [this.REPLACE_VALUE, this.postCommand('/session/:sessionId/appium/element/:elementId/replace_value')],
        [this.SCREENSHOT, this.getCommand('/session/:sessionId/screenshot')],
        [this.ELEMENT_SCREENSHOT, this.getCommand('/session/:sessionId/element/:elementId/screenshot')],
        [this.GET_ACTIVE_ELEMENT, this.getCommand('/session/:sessionId/element/active')],
    ]);

    private static postCommand(path: string): CommandInfo {
        return { method: 'POST', path };
    }

    private static getCommand(path: string): CommandInfo {
        return { method: 'GET', path };
    }

    private static deleteCommand(path: string): CommandInfo {
        return { method: 'DELETE', path };
    }
}
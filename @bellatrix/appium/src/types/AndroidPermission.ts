export type AndroidPermission = 'ACCEPT_HANDOVER'  // Allows a calling app to continue a call which was started in another app.
    | 'ACCESS_BACKGROUND_LOCATION'  // Allows an app to access location in the background.
    | 'ACCESS_BLOBS_ACROSS_USERS'  // Allows an application to access data blobs across users.
    | 'ACCESS_CHECKIN_PROPERTIES'  // Allows read/write access to the "properties" table in the checkin database, to change values that get uploaded.
    | 'ACCESS_COARSE_LOCATION'  // Allows an app to access approximate location.
    | 'ACCESS_FINE_LOCATION'  // Allows an app to access precise location.
    | 'ACCESS_LOCATION_EXTRA_COMMANDS'  // Allows an application to access extra location provider commands.
    | 'ACCESS_MEDIA_LOCATION'  // Allows an application to access any geographic locations persisted in the user's shared collection.
    | 'ACCESS_NETWORK_STATE'  // Allows applications to access information about networks.
    | 'ACCESS_NOTIFICATION_POLICY'  // Marker permission for applications that wish to access notification policy.
    | 'ACCESS_WIFI_STATE'  // Allows applications to access information about Wi-Fi networks.
    | 'ACCOUNT_MANAGER'  // Allows applications to call into AccountAuthenticators.
    | 'ACTIVITY_RECOGNITION'  // Allows an application to recognize physical activity.
    | 'ADD_VOICEMAIL'  // Allows an application to add voicemails into the system.
    | 'ANSWER_PHONE_CALLS'  // Allows the app to answer an incoming phone call.
    | 'BATTERY_STATS'  // Allows an application to collect battery statistics; Protection level: signature|privileged|development
    | 'BIND_ACCESSIBILITY_SERVICE'  // Must be required by an AccessibilityService, to ensure that only the system can bind to it.
    | 'BIND_APPWIDGET'  // Allows an application to tell the AppWidget service which application can access AppWidget's data.
    | 'BIND_AUTOFILL_SERVICE'  // Must be required by a AutofillService, to ensure that only the system can bind to it.
    | 'BIND_CALL_REDIRECTION_SERVICE'  // Must be required by a CallRedirectionService, to ensure that only the system can bind to it.
    | 'BIND_CARRIER_MESSAGING_CLIENT_SERVICE'  // A subclass of CarrierMessagingClientService must be protected with this permission.
    | 'BIND_CARRIER_MESSAGING_SERVICE'  // This constant was deprecated in API level 23. Use BIND_CARRIER_SERVICES instead
    | 'BIND_CARRIER_SERVICES'  // The system process that is allowed to bind to services in carrier apps will have this permission.
    | 'BIND_CHOOSER_TARGET_SERVICE'  // This constant was deprecated in API level 30. For publishing direct share targets, please follow the instructions in https://developer.android.com/training/sharing/receive.html#providing-direct-share-targets instead.
    | 'BIND_COMPANION_DEVICE_SERVICE'  // Must be required by any CompanionDeviceServices to ensure that only the system can bind to it.
    | 'BIND_CONDITION_PROVIDER_SERVICE'  // Must be required by a ConditionProviderService, to ensure that only the system can bind to it.
    | 'BIND_CONTROLS'  // Allows SystemUI to request third party controls.
    | 'BIND_CREDENTIAL_PROVIDER_SERVICE'  // Must be required by a CredentialProviderService to ensure that only the system can bind to it.
    | 'BIND_DEVICE_ADMIN'  // Must be required by device administration receiver, to ensure that only the system can interact with it.
    | 'BIND_DREAM_SERVICE'  // Must be required by an DreamService, to ensure that only the system can bind to it.
    | 'BIND_INCALL_SERVICE'  // Must be required by a InCallService, to ensure that only the system can bind to it.
    | 'BIND_INPUT_METHOD'  // Must be required by an InputMethodService, to ensure that only the system can bind to it.
    | 'BIND_MIDI_DEVICE_SERVICE'  // Must be required by an MidiDeviceService, to ensure that only the system can bind to it.
    | 'BIND_NFC_SERVICE'  // Must be required by a HostApduService or OffHostApduService to ensure that only the system can bind to it.
    | 'BIND_NOTIFICATION_LISTENER_SERVICE'  // Must be required by an NotificationListenerService, to ensure that only the system can bind to it.
    | 'BIND_PRINT_SERVICE'  // Must be required by a PrintService, to ensure that only the system can bind to it.
    | 'BIND_QUICK_ACCESS_WALLET_SERVICE'  // Must be required by a QuickAccessWalletService to ensure that only the system can bind to it.
    | 'BIND_QUICK_SETTINGS_TILE'  // Allows an application to bind to third party quick settings tiles.
    | 'BIND_REMOTEVIEWS'  // Must be required by a RemoteViewsService, to ensure that only the system can bind to it.
    | 'BIND_SCREENING_SERVICE'  // Must be required by a CallScreeningService, to ensure that only the system can bind to it.
    | 'BIND_TELECOM_CONNECTION_SERVICE'  // Must be required by a ConnectionService, to ensure that only the system can bind to it.
    | 'BIND_TEXT_SERVICE'  // Must be required by a TextService (e.g. SpellCheckerService) to ensure that only the system can bind to it.
    | 'BIND_TV_INPUT'  // Must be required by a TvInputService to ensure that only the system can bind to it.
    | 'BIND_TV_INTERACTIVE_APP'  // Must be required by a TvInteractiveAppService to ensure that only the system can bind to it.
    | 'BIND_VISUAL_VOICEMAIL_SERVICE'  // Must be required by a link VisualVoicemailService to ensure that only the system can bind to it.
    | 'BIND_VOICE_INTERACTION'  // Must be required by a VoiceInteractionService, to ensure that only the system can bind to it.
    | 'BIND_VPN_SERVICE'  // Must be required by a VpnService, to ensure that only the system can bind to it.
    | 'BIND_VR_LISTENER_SERVICE'  // Must be required by an VrListenerService, to ensure that only the system can bind to it.
    | 'BIND_WALLPAPER'  // Must be required by a WallpaperService, to ensure that only the system can bind to it.
    | 'BLUETOOTH'  // Allows applications to connect to paired bluetooth devices.
    | 'BLUETOOTH_ADMIN'  // Allows applications to discover and pair bluetooth devices.
    | 'BLUETOOTH_ADVERTISE'  // Required to be able to advertise to nearby Bluetooth devices.
    | 'BLUETOOTH_CONNECT'  // Required to be able to connect to paired Bluetooth devices.
    | 'BLUETOOTH_PRIVILEGED'  // Allows applications to pair bluetooth devices without user interaction, and to allow or disallow phonebook access or message access.
    | 'BLUETOOTH_SCAN'  // Required to be able to discover and pair nearby Bluetooth devices.
    | 'BODY_SENSORS'  // Allows an application to access data from sensors that the user uses to measure what is happening inside their body, such as heart rate.
    | 'BODY_SENSORS_BACKGROUND'  // Allows an application to access data from sensors that the user uses to measure what is happening inside their body, such as heart rate.
    | 'BROADCAST_PACKAGE_REMOVED'  // Allows an application to broadcast a notification that an application package has been removed.
    | 'BROADCAST_SMS'  // Allows an application to broadcast an SMS receipt notification.
    | 'BROADCAST_STICKY'  // Allows an application to broadcast sticky intents.
    | 'BROADCAST_WAP_PUSH'  // Allows an application to broadcast a WAP PUSH receipt notification.
    | 'CALL_COMPANION_APP'  // Allows an app which implements the InCallService API to be eligible to be enabled as a calling companion app.
    | 'CALL_PHONE'  // Allows an application to initiate a phone call without going through the Dialer user interface for the user to confirm the call.
    | 'CALL_PRIVILEGED'  // Allows an application to call any phone number, including emergency numbers, without going through the Dialer user interface for the user to confirm the call being placed.
    | 'CAMERA'  // Required to be able to access the camera device.
    | 'CAPTURE_AUDIO_OUTPUT'  // Allows an application to capture audio output.
    | 'CHANGE_COMPONENT_ENABLED_STATE'  // Allows an application to change whether an application component (other than its own) is enabled or not.
    | 'CHANGE_CONFIGURATION'  // Allows an application to modify the current configuration, such as locale.
    | 'CHANGE_NETWORK_STATE'  // Allows applications to change network connectivity state.
    | 'CHANGE_WIFI_MULTICAST_STATE'  // Allows applications to enter Wi-Fi Multicast mode.
    | 'CHANGE_WIFI_STATE'  // Allows applications to change Wi-Fi connectivity state.
    | 'CLEAR_APP_CACHE'  // Allows an application to clear the caches of all installed applications on the device.
    | 'CONFIGURE_WIFI_DISPLAY'  // Allows an application to configure and connect to Wifi displays
    | 'CONTROL_LOCATION_UPDATES'  // Allows enabling/disabling location update notifications from the radio.
    | 'CREDENTIAL_MANAGER_QUERY_CANDIDATE_CREDENTIALS'  // Allows a browser to invoke the set of query apis to get metadata about credential candidates prepared during the CredentialManager.prepareGetCredential API.
    | 'CREDENTIAL_MANAGER_SET_ALLOWED_PROVIDERS'  // Allows specifying candidate credential providers to be queried in Credential Manager get flows, or to be preferred as a default in the Credential Manager create flows.
    | 'CREDENTIAL_MANAGER_SET_ORIGIN'  // Allows a browser to invoke credential manager APIs on behalf of another RP.
    | 'DELETE_CACHE_FILES'  // Old permission for deleting an app's cache files, no longer used, but signals for us to quietly ignore calls instead of throwing an exception.
    | 'DELETE_PACKAGES'  // Allows an application to delete packages.
    | 'DELIVER_COMPANION_MESSAGES'  // Allows an application to deliver companion messages to system
    | 'DETECT_SCREEN_CAPTURE'  // Allows an application to get notified when a screen capture of its windows is attempted.
    | 'DIAGNOSTIC'  // Allows applications to RW to diagnostic resources.
    | 'DISABLE_KEYGUARD'  // Allows applications to disable the keyguard if it is not secure.
    | 'DUMP'  // Allows an application to retrieve state dump information from system services.
    | 'ENFORCE_UPDATE_OWNERSHIP'  // Allows an application to indicate via PackageInstaller.SessionParams.setRequestUpdateOwnership(boolean) that it has the intention of becoming the update owner.
    | 'EXECUTE_APP_ACTION'  // Allows an assistive application to perform actions on behalf of users inside of applications.
    | 'EXPAND_STATUS_BAR'  // Allows an application to expand or collapse the status bar.
    | 'FACTORY_TEST'  // Run as a manufacturer test application, running as the root user.
    | 'FOREGROUND_SERVICE'  // Allows a regular application to use Service.startForeground.
    | 'FOREGROUND_SERVICE_CAMERA'  // Allows a regular application to use Service.startForeground with the type "camera".
    | 'FOREGROUND_SERVICE_CONNECTED_DEVICE'  // Allows a regular application to use Service.startForeground with the type "connectedDevice".
    | 'FOREGROUND_SERVICE_DATA_SYNC'  // Allows a regular application to use Service.startForeground with the type "dataSync".
    | 'FOREGROUND_SERVICE_HEALTH'  // Allows a regular application to use Service.startForeground with the type "health".
    | 'FOREGROUND_SERVICE_LOCATION'  // Allows a regular application to use Service.startForeground with the type "location".
    | 'FOREGROUND_SERVICE_MEDIA_PLAYBACK'  // Allows a regular application to use Service.startForeground with the type "mediaPlayback".
    | 'FOREGROUND_SERVICE_MEDIA_PROJECTION'  // Allows a regular application to use Service.startForeground with the type "mediaProjection".
    | 'FOREGROUND_SERVICE_MICROPHONE'  // Allows a regular application to use Service.startForeground with the type "microphone".
    | 'FOREGROUND_SERVICE_PHONE_CALL'  // Allows a regular application to use Service.startForeground with the type "phoneCall".
    | 'FOREGROUND_SERVICE_REMOTE_MESSAGING'  // Allows a regular application to use Service.startForeground with the type "remoteMessaging".
    | 'FOREGROUND_SERVICE_SPECIAL_USE'  // Allows a regular application to use Service.startForeground with the type "specialUse".
    | 'FOREGROUND_SERVICE_SYSTEM_EXEMPTED'  // Allows a regular application to use Service.startForeground with the type "systemExempted".
    | 'GET_ACCOUNTS'  // Allows access to the list of accounts in the Accounts Service.
    | 'GET_ACCOUNTS_PRIVILEGED'  // Allows access to the list of accounts in the Accounts Service.
    | 'GET_PACKAGE_SIZE'  // Allows an application to find out the space used by any package.
    | 'GET_TASKS'  // This constant was deprecated in API level 21. No longer enforced.
    | 'GLOBAL_SEARCH'  // This permission can be used on content providers to allow the global search system to access their data.
    | 'HIDE_OVERLAY_WINDOWS'  // Allows an app to prevent non-system-overlay windows from being drawn on top of it
    | 'HIGH_SAMPLING_RATE_SENSORS'  // Allows an app to access sensor data with a sampling rate greater than 200 Hz.
    | 'INSTALL_LOCATION_PROVIDER'  // Allows an application to install a location provider into the Location Manager.
    | 'INSTALL_PACKAGES'  // Allows an application to install packages.
    | 'INSTALL_SHORTCUT'  // Allows an application to install a shortcut in Launcher.
    | 'INSTANT_APP_FOREGROUND_SERVICE'  // Allows an instant app to create foreground services.
    | 'INTERACT_ACROSS_PROFILES'  // Allows interaction across profiles in the same profile group.
    | 'INTERNET'  // Allows applications to open network sockets.
    | 'KILL_BACKGROUND_PROCESSES'  // Allows an application to call ActivityManager.killBackgroundProcesses(String).
    | 'LAUNCH_CAPTURE_CONTENT_ACTIVITY_FOR_NOTE'  // Allows an application to capture screen content to perform a screenshot using the intent action Intent.ACTION_LAUNCH_CAPTURE_CONTENT_ACTIVITY_FOR_NOTE.
    | 'LAUNCH_MULTI_PANE_SETTINGS_DEEP_LINK'  // An application needs this permission for Settings.ACTION_SETTINGS_EMBED_DEEP_LINK_ACTIVITY to show its Activity embedded in Settings app.
    | 'LOADER_USAGE_STATS'  // Allows a data loader to read a package's access logs.
    | 'LOCATION_HARDWARE'  // Allows an application to use location features in hardware, such as the geofencing api.
    | 'MANAGE_DEVICE_LOCK_STATE'  // Allows financed device kiosk apps to perform actions on the Device Lock service; Protection level: internal|role; Intended for use by the FINANCED_DEVICE_KIOSK role only.
    | 'MANAGE_DEVICE_POLICY_ACCESSIBILITY'  // Allows an application to manage policy related to accessibility.
    | 'MANAGE_DEVICE_POLICY_ACCOUNT_MANAGEMENT'  // Allows an application to set policy related to account management.
    | 'MANAGE_DEVICE_POLICY_ACROSS_USERS'  // Allows an application to set device policies outside the current user that are required for securing device ownership without accessing user data.
    | 'MANAGE_DEVICE_POLICY_ACROSS_USERS_FULL'  // Allows an application to set device policies outside the current user.
    | 'MANAGE_DEVICE_POLICY_ACROSS_USERS_SECURITY_CRITICAL'  // Allows an application to set device policies outside the current user that are critical for securing data within the current user.
    | 'MANAGE_DEVICE_POLICY_AIRPLANE_MODE'  // Allows an application to set policy related to airplane mode.
    | 'MANAGE_DEVICE_POLICY_APPS_CONTROL'  // Allows an application to manage policy regarding modifying applications.
    | 'MANAGE_DEVICE_POLICY_APP_RESTRICTIONS'  // Allows an application to manage application restrictions.
    | 'MANAGE_DEVICE_POLICY_APP_USER_DATA'  // Allows an application to manage policy related to application user data.
    | 'MANAGE_DEVICE_POLICY_AUDIO_OUTPUT'  // Allows an application to set policy related to audio output.
    | 'MANAGE_DEVICE_POLICY_AUTOFILL'  // Allows an application to set policy related to autofill.
    | 'MANAGE_DEVICE_POLICY_BACKUP_SERVICE'  // Allows an application to manage backup service policy.
    | 'MANAGE_DEVICE_POLICY_BLUETOOTH'  // Allows an application to set policy related to bluetooth.
    | 'MANAGE_DEVICE_POLICY_BUGREPORT'  // Allows an application to request bugreports with user consent.
    | 'MANAGE_DEVICE_POLICY_CALLS'  // Allows an application to manage calling policy.
    | 'MANAGE_DEVICE_POLICY_CAMERA'  // Allows an application to set policy related to restricting a user's ability to use or enable and disable the camera.
    | 'MANAGE_DEVICE_POLICY_CERTIFICATES'  // Allows an application to set policy related to certificates.
    | 'MANAGE_DEVICE_POLICY_COMMON_CRITERIA_MODE'  // Allows an application to manage policy related to common criteria mode.
    | 'MANAGE_DEVICE_POLICY_DEBUGGING_FEATURES'  // Allows an application to manage debugging features policy.
    | 'MANAGE_DEVICE_POLICY_DEFAULT_SMS'  // Allows an application to set policy related to the default sms application.
    | 'MANAGE_DEVICE_POLICY_DEVICE_IDENTIFIERS'  // Allows an application to manage policy related to device identifiers.
    | 'MANAGE_DEVICE_POLICY_DISPLAY'  // Allows an application to set policy related to the display.
    | 'MANAGE_DEVICE_POLICY_FACTORY_RESET'  // Allows an application to set policy related to factory reset.
    | 'MANAGE_DEVICE_POLICY_FUN'  // Allows an application to set policy related to fun.
    | 'MANAGE_DEVICE_POLICY_INPUT_METHODS'  // Allows an application to set policy related to input methods.
    | 'MANAGE_DEVICE_POLICY_INSTALL_UNKNOWN_SOURCES'  // Allows an application to manage installing from unknown sources policy.
    | 'MANAGE_DEVICE_POLICY_KEEP_UNINSTALLED_PACKAGES'  // Allows an application to set policy related to keeping uninstalled packages.
    | 'MANAGE_DEVICE_POLICY_KEYGUARD'  // Allows an application to manage policy related to keyguard.
    | 'MANAGE_DEVICE_POLICY_LOCALE'  // Allows an application to set policy related to locale.
    | 'MANAGE_DEVICE_POLICY_LOCATION'  // Allows an application to set policy related to location.
    | 'MANAGE_DEVICE_POLICY_LOCK'  // Allows an application to lock a profile or the device with the appropriate cross-user permission.
    | 'MANAGE_DEVICE_POLICY_LOCK_CREDENTIALS'  // Allows an application to set policy related to lock credentials.
    | 'MANAGE_DEVICE_POLICY_LOCK_TASK'  // Allows an application to manage lock task policy.
    | 'MANAGE_DEVICE_POLICY_METERED_DATA'  // Allows an application to manage policy related to metered data.
    | 'MANAGE_DEVICE_POLICY_MICROPHONE'  // Allows an application to set policy related to restricting a user's ability to use or enable and disable the microphone.
    | 'MANAGE_DEVICE_POLICY_MOBILE_NETWORK'  // Allows an application to set policy related to mobile networks.
    | 'MANAGE_DEVICE_POLICY_MODIFY_USERS'  // Allows an application to manage policy preventing users from modifying users.
    | 'MANAGE_DEVICE_POLICY_MTE'  // Allows an application to manage policy related to the Memory Tagging Extension (MTE).
    | 'MANAGE_DEVICE_POLICY_NEARBY_COMMUNICATION'  // Allows an application to set policy related to nearby communications (e.g. Beam and nearby streaming).
    | 'MANAGE_DEVICE_POLICY_NETWORK_LOGGING'  // Allows an application to set policy related to network logging.
    | 'MANAGE_DEVICE_POLICY_ORGANIZATION_IDENTITY'  // Allows an application to manage the identity of the managing organization.
    | 'MANAGE_DEVICE_POLICY_OVERRIDE_APN'  // Allows an application to set policy related to override APNs.
    | 'MANAGE_DEVICE_POLICY_PACKAGE_STATE'  // Allows an application to set policy related to hiding and suspending packages.
    | 'MANAGE_DEVICE_POLICY_PHYSICAL_MEDIA'  // Allows an application to set policy related to physical media.
    | 'MANAGE_DEVICE_POLICY_PRINTING'  // Allows an application to set policy related to printing.
    | 'MANAGE_DEVICE_POLICY_PRIVATE_DNS'  // Allows an application to set policy related to private DNS.
    | 'MANAGE_DEVICE_POLICY_PROFILES'  // Allows an application to set policy related to profiles.
    | 'MANAGE_DEVICE_POLICY_PROFILE_INTERACTION'  // Allows an application to set policy related to interacting with profiles (e.g. Disallowing cross-profile copy and paste).
    | 'MANAGE_DEVICE_POLICY_PROXY'  // Allows an application to set a network-independent global HTTP proxy.
    | 'MANAGE_DEVICE_POLICY_QUERY_SYSTEM_UPDATES'  // Allows an application query system updates.
    | 'MANAGE_DEVICE_POLICY_RESET_PASSWORD'  // Allows an application to force set a new device unlock password or a managed profile challenge on current user.
    | 'MANAGE_DEVICE_POLICY_RESTRICT_PRIVATE_DNS'  // Allows an application to set policy related to restricting the user from configuring private DNS.
    | 'MANAGE_DEVICE_POLICY_RUNTIME_PERMISSIONS'  // Allows an application to set the grant state of runtime permissions on packages.
    | 'MANAGE_DEVICE_POLICY_RUN_IN_BACKGROUND'  // Allows an application to set policy related to users running in the background.
    | 'MANAGE_DEVICE_POLICY_SAFE_BOOT'  // Allows an application to manage safe boot policy.
    | 'MANAGE_DEVICE_POLICY_SCREEN_CAPTURE'  // Allows an application to set policy related to screen capture.
    | 'MANAGE_DEVICE_POLICY_SCREEN_CONTENT'  // Allows an application to set policy related to the usage of the contents of the screen.
    | 'MANAGE_DEVICE_POLICY_SECURITY_LOGGING'  // Allows an application to set policy related to security logging.
    | 'MANAGE_DEVICE_POLICY_SETTINGS'  // Allows an application to set policy related to settings.
    | 'MANAGE_DEVICE_POLICY_SMS'  // Allows an application to set policy related to sms.
    | 'MANAGE_DEVICE_POLICY_STATUS_BAR'  // Allows an application to set policy related to the status bar.
    | 'MANAGE_DEVICE_POLICY_SUPPORT_MESSAGE'  // Allows an application to set support messages for when a user action is affected by an active policy.
    | 'MANAGE_DEVICE_POLICY_SUSPEND_PERSONAL_APPS'  // Allows an application to set policy related to suspending personal apps.
    | 'MANAGE_DEVICE_POLICY_SYSTEM_APPS'  // Allows an application to manage policy related to system apps.
    | 'MANAGE_DEVICE_POLICY_SYSTEM_DIALOGS'  // Allows an application to set policy related to system dialogs.
    | 'MANAGE_DEVICE_POLICY_SYSTEM_UPDATES'  // Allows an application to set policy related to system updates.
    | 'MANAGE_DEVICE_POLICY_TIME'  // Allows an application to manage device policy relating to time.
    | 'MANAGE_DEVICE_POLICY_USB_DATA_SIGNALLING'  // Allows an application to set policy related to usb data signalling.
    | 'MANAGE_DEVICE_POLICY_USB_FILE_TRANSFER'  // Allows an application to set policy related to usb file transfers.
    | 'MANAGE_DEVICE_POLICY_USERS'  // Allows an application to set policy related to users.
    | 'MANAGE_DEVICE_POLICY_VPN'  // Allows an application to set policy related to VPNs.
    | 'MANAGE_DEVICE_POLICY_WALLPAPER'  // Allows an application to set policy related to the wallpaper.
    | 'MANAGE_DEVICE_POLICY_WIFI'  // Allows an application to set policy related to Wifi.
    | 'MANAGE_DEVICE_POLICY_WINDOWS'  // Allows an application to set policy related to windows.
    | 'MANAGE_DEVICE_POLICY_WIPE_DATA'  // Allows an application to manage policy related to wiping data.
    | 'MANAGE_DOCUMENTS'  // Allows an application to manage access to documents, usually as part of a document picker.
    | 'MANAGE_EXTERNAL_STORAGE'  // Allows an application a broad access to external storage in scoped storage.
    | 'MANAGE_MEDIA'  // Allows an application to modify and delete media files on this device or any connected storage device without user confirmation.
    | 'MANAGE_ONGOING_CALLS'  // Allows to query ongoing call details and manage ongoing calls; Protection level: signature|appop
    | 'MANAGE_OWN_CALLS'  // Allows a calling application which manages its own calls through the self-managed ConnectionService APIs.
    | 'MANAGE_WIFI_INTERFACES'  // Allows applications to get notified when a Wi-Fi interface request cannot be satisfied without tearing down one or more other interfaces, and provide a decision whether to approve the request or reject it.
    | 'MANAGE_WIFI_NETWORK_SELECTION'  // This permission is used to let OEMs grant their trusted app access to a subset of privileged wifi APIs to improve wifi performance.
    | 'MASTER_CLEAR'  // Not for use by third-party applications.
    | 'MEDIA_CONTENT_CONTROL'  // Allows an application to know what content is playing and control its playback.
    | 'MODIFY_AUDIO_SETTINGS'  // Allows an application to modify global audio settings.
    | 'MODIFY_PHONE_STATE'  // Allows modification of the telephony state - power on, mmi, etc.
    | 'MOUNT_FORMAT_FILESYSTEMS'  // Allows formatting file systems for removable storage.
    | 'MOUNT_UNMOUNT_FILESYSTEMS'  // Allows mounting and unmounting file systems for removable storage.
    | 'NEARBY_WIFI_DEVICES'  // Required to be able to advertise and connect to nearby devices via Wi-Fi.
    | 'NFC'  // Allows applications to perform I/O operations over NFC.
    | 'NFC_PREFERRED_PAYMENT_INFO'  // Allows applications to receive NFC preferred payment service information.
    | 'NFC_TRANSACTION_EVENT'  // Allows applications to receive NFC transaction events.
    | 'OVERRIDE_WIFI_CONFIG'  // Allows an application to modify any wifi configuration, even if created by another application.
    | 'PACKAGE_USAGE_STATS'  // Allows an application to collect component usage statistics; Declaring the permission implies intention to use the API and the user of the device can grant permission through the Settings application.
    | 'PERSISTENT_ACTIVITY'  // This constant was deprecated in API level 15. This functionality will be removed in the future; please do not use. Allow an application to make its activities persistent.
    | 'POST_NOTIFICATIONS'  // Allows an app to post notifications; Protection level: dangerous
    | 'PROCESS_OUTGOING_CALLS'  // This constant was deprecated in API level 29. Applications should use CallRedirectionService instead of the Intent.ACTION_NEW_OUTGOING_CALL broadcast.
    | 'PROVIDE_OWN_AUTOFILL_SUGGESTIONS'  // Allows an application to display its suggestions using the autofill framework.
    | 'PROVIDE_REMOTE_CREDENTIALS'  // Allows an application to be able to store and retrieve credentials from a remote device.
    | 'QUERY_ALL_PACKAGES'  // Allows query of any normal app on the device, regardless of manifest declarations.
    | 'READ_ASSISTANT_APP_SEARCH_DATA'  // Allows an application to query over global data in AppSearch that's visible to the ASSISTANT role.
    | 'READ_BASIC_PHONE_STATE'  // Allows read only access to phone state with a non dangerous permission, including the information like cellular network type, software version.
    | 'READ_CALENDAR'  // Allows an application to read the user's calendar data.
    | 'READ_CALL_LOG'  // Allows an application to read the user's call log.
    | 'READ_CONTACTS'  // Allows an application to read the user's contacts data.
    | 'READ_EXTERNAL_STORAGE'  // Allows an application to read from external storage.
    | 'READ_HOME_APP_SEARCH_DATA'  // Allows an application to query over global data in AppSearch that's visible to the HOME role.
    | 'READ_INPUT_STATE'  // This constant was deprecated in API level 16. The API that used this permission has been removed.
    | 'READ_LOGS'  // Allows an application to read the low-level system log files.
    | 'READ_MEDIA_AUDIO'  // Allows an application to read audio files from external storage.
    | 'READ_MEDIA_IMAGES'  // Allows an application to read image files from external storage.
    | 'READ_MEDIA_VIDEO'  // Allows an application to read video files from external storage.
    | 'READ_MEDIA_VISUAL_USER_SELECTED'  // Allows an application to read image or video files from external storage that a user has selected via the permission prompt photo picker.
    | 'READ_NEARBY_STREAMING_POLICY'  // Allows an application to read nearby streaming policy.
    | 'READ_PHONE_NUMBERS'  // Allows read access to the device's phone number(s).
    | 'READ_PHONE_STATE'  // Allows read only access to phone state, including the current cellular network information, the status of any ongoing calls, and a list of any PhoneAccounts registered on the device.
    | 'READ_PRECISE_PHONE_STATE'  // Allows read only access to precise phone state.
    | 'READ_SMS'  // Allows an application to read SMS messages.
    | 'READ_SYNC_SETTINGS'  // Allows applications to read the sync settings.
    | 'READ_SYNC_STATS'  // Allows applications to read the sync stats.
    | 'READ_VOICEMAIL'  // Allows an application to read voicemails in the system.
    | 'REBOOT'  // Required to be able to reboot the device.
    | 'RECEIVE_BOOT_COMPLETED'  // Allows an application to receive the Intent.ACTION_BOOT_COMPLETED that is broadcast after the system finishes booting.
    | 'RECEIVE_MMS'  // Allows an application to monitor incoming MMS messages.
    | 'RECEIVE_SMS'  // Allows an application to receive SMS messages.
    | 'RECEIVE_WAP_PUSH'  // Allows an application to receive WAP push messages.
    | 'RECORD_AUDIO'  // Allows an application to record audio.
    | 'REORDER_TASKS'  // Allows an application to change the Z-order of tasks.
    | 'REQUEST_COMPANION_PROFILE_APP_STREAMING'  // Allows application to request to be associated with a virtual display capable of streaming Android applications (AssociationRequest.DEVICE_PROFILE_APP_STREAMING) by CompanionDeviceManager.
    | 'REQUEST_COMPANION_PROFILE_AUTOMOTIVE_PROJECTION'  // Allows application to request to be associated with a vehicle head unit capable of automotive projection (AssociationRequest.DEVICE_PROFILE_AUTOMOTIVE_PROJECTION) by CompanionDeviceManager.
    | 'REQUEST_COMPANION_PROFILE_COMPUTER'  // Allows application to request to be associated with a computer to share functionality and/or data with other devices, such as notifications, photos and media (AssociationRequest.DEVICE_PROFILE_COMPUTER) by CompanionDeviceManager.
    | 'REQUEST_COMPANION_PROFILE_GLASSES'  // Allows app to request to be associated with a device via CompanionDeviceManager as "glasses"; Protection level: normal
    | 'REQUEST_COMPANION_PROFILE_NEARBY_DEVICE_STREAMING'  // Allows application to request to stream content from an Android host to a nearby device (AssociationRequest.DEVICE_PROFILE_NEARBY_DEVICE_STREAMING) by CompanionDeviceManager.
    | 'REQUEST_COMPANION_PROFILE_WATCH'  // Allows app to request to be associated with a device via CompanionDeviceManager as a "watch"; Protection level: normal
    | 'REQUEST_COMPANION_RUN_IN_BACKGROUND'  // Allows a companion app to run in the background.
    | 'REQUEST_COMPANION_SELF_MANAGED'  // Allows an application to create a "self-managed" association.
    | 'REQUEST_COMPANION_START_FOREGROUND_SERVICES_FROM_BACKGROUND'  // Allows a companion app to start a foreground service from the background.
    | 'REQUEST_COMPANION_USE_DATA_IN_BACKGROUND'  // Allows a companion app to use data in the background.
    | 'REQUEST_DELETE_PACKAGES'  // Allows an application to request deleting packages.
    | 'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS'  // Permission an application must hold in order to use Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS.
    | 'REQUEST_INSTALL_PACKAGES'  // Allows an application to request installing packages.
    | 'REQUEST_OBSERVE_COMPANION_DEVICE_PRESENCE'  // Allows an application to subscribe to notifications about the presence status change of their associated companion device
    | 'REQUEST_PASSWORD_COMPLEXITY'  // Allows an application to request the screen lock complexity and prompt users to update the screen lock to a certain complexity level.
    | 'RESTART_PACKAGES'  // This constant was deprecated in API level 15. The ActivityManager.restartPackage(String) API is no longer supported.
    | 'RUN_USER_INITIATED_JOBS'  // Allows applications to use the user-initiated jobs API.
    | 'SCHEDULE_EXACT_ALARM'  // Allows applications to use exact alarm APIs.
    | 'SEND_RESPOND_VIA_MESSAGE'  // Allows an application (Phone) to send a request to other applications to handle the respond-via-message action during incoming calls.
    | 'SEND_SMS'  // Allows an application to send SMS messages.
    | 'SET_ALARM'  // Allows an application to broadcast an Intent to set an alarm for the user.
    | 'SET_ALWAYS_FINISH'  // Allows an application to control whether activities are immediately finished when put in the background.
    | 'SET_ANIMATION_SCALE'  // Modify the global animation scaling factor.
    | 'SET_DEBUG_APP'  // Configure an application for debugging.
    | 'SET_PREFERRED_APPLICATIONS'  // This constant was deprecated in API level 15. No longer useful, see PackageManager.addPackageToPreferred(String) for details.
    | 'SET_PROCESS_LIMIT'  // Allows an application to set the maximum number of (not needed) application processes that can be running.
    | 'SET_TIME'  // Allows applications to set the system time directly.
    | 'SET_TIME_ZONE'  // Allows applications to set the system time zone directly.
    | 'SET_WALLPAPER'  // Allows applications to set the wallpaper.
    | 'SET_WALLPAPER_HINTS'  // Allows applications to set the wallpaper hints.
    | 'SIGNAL_PERSISTENT_PROCESSES'  // Allow an application to request that a signal be sent to all persistent processes.
    | 'SMS_FINANCIAL_TRANSACTIONS'  // This constant was deprecated in API level 31. The API that used this permission is no longer functional.
    | 'START_FOREGROUND_SERVICES_FROM_BACKGROUND'  // Allows an application to start foreground services from the background at any time.
    | 'START_VIEW_APP_FEATURES'  // Allows the holder to start the screen with a list of app features.
    | 'START_VIEW_PERMISSION_USAGE'  // Allows the holder to start the permission usage screen for an app.
    | 'STATUS_BAR'  // Allows an application to open, close, or disable the status bar and its icons.
    | 'SUBSCRIBE_TO_KEYGUARD_LOCKED_STATE'  // Allows an application to subscribe to keyguard locked (i.e., showing) state.
    | 'SYSTEM_ALERT_WINDOW'  // Allows an app to create windows using the type WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY, shown on top of all other apps.
    | 'TRANSMIT_IR'  // Allows using the device's IR transmitter, if available.
    | 'TURN_SCREEN_ON'  // Allows an app to turn on the screen on, e.g. with PowerManager.ACQUIRE_CAUSES_WAKEUP.
    | 'UNINSTALL_SHORTCUT'  // Don't use this permission in your app.
    | 'UPDATE_DEVICE_STATS'  // Allows an application to update device statistics.
    | 'UPDATE_PACKAGES_WITHOUT_USER_ACTION'  // Allows an application to indicate via PackageInstaller.SessionParams.setRequireUserAction(int) that user action should not be required for an app update.
    | 'USE_BIOMETRIC'  // Allows an app to use device supported biometric modalities.
    | 'USE_EXACT_ALARM'  // Allows apps to use exact alarms just like with SCHEDULE_EXACT_ALARM but without needing to request this permission from the user.
    | 'USE_FINGERPRINT'  // This constant was deprecated in API level 28. Applications should request USE_BIOMETRIC instead
    | 'USE_FULL_SCREEN_INTENT'  // Required for apps targeting Build.VERSION_CODES.Q that want to use notification full screen intents.
    | 'USE_ICC_AUTH_WITH_DEVICE_IDENTIFIER'  // Allows to read device identifiers and use ICC based authentication like EAP-AKA.
    | 'USE_SIP'  // Allows an application to use SIP service.
    | 'UWB_RANGING'  // Required to be able to range to devices using ultra-wideband.
    | 'VIBRATE'  // Allows access to the vibrator.
    | 'WAKE_LOCK'  // Allows using PowerManager WakeLocks to keep processor from sleeping or screen from dimming.
    | 'WRITE_APN_SETTINGS'  // Allows applications to write the apn settings and read sensitive fields of an existing apn settings like user and password.
    | 'WRITE_CALENDAR'  // Allows an application to write the user's calendar data.
    | 'WRITE_CALL_LOG'  // Allows an application to write and read the user's call log data.
    | 'WRITE_CONTACTS'  // Allows an application to write the user's contacts data.
    | 'WRITE_EXTERNAL_STORAGE'  // Allows an application to write to external storage.
    | 'WRITE_GSERVICES'  // Allows an application to modify the Google service map.
    | 'WRITE_SECURE_SETTINGS'  // Allows an application to read or write the secure system settings.
    | 'WRITE_SETTINGS'  // Allows an application to read or write the system settings.
    | 'WRITE_SYNC_SETTINGS'  // Allows applications to write the sync settings.
    | 'WRITE_VOICEMAIL'  // Allows an application to modify and remove existing voicemails in the system.

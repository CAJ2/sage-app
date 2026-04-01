const COMMANDS: &[&str] = &[
    "open_camera",
    "close_camera",
    "start_scan",
    "stop_scan",
    "check_permissions",
    "request_permissions",
    "open_app_settings",
];

fn main() {
    let result = tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .try_build();

    // when building documentation for Android the plugin build result is always Err()
    if !(cfg!(docsrs) && std::env::var("TARGET").unwrap().contains("android")) {
        result.unwrap();
    }
}

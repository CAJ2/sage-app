// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

#![cfg(mobile)]

use tauri::{
    plugin::{Builder, PluginHandle, TauriPlugin},
    Manager, Runtime,
};

mod error;
mod models;

pub use error::{Error, Result};

#[cfg(target_os = "android")]
const PLUGIN_IDENTIFIER: &str = "app.sageleaf.scanleaf";

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_sageleaf_scanleaf);

/// Access to the scanleaf APIs.
pub struct Scanleaf<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> Scanleaf<R> {}

/// Extensions to [`tauri::App`], [`tauri::AppHandle`], [`tauri::WebviewWindow`] to access the scanleaf APIs.
pub trait ScanleafExt<R: Runtime> {
    fn scanleaf(&self) -> &Scanleaf<R>;
}

impl<R: Runtime, T: Manager<R>> crate::ScanleafExt<R> for T {
    fn scanleaf(&self) -> &Scanleaf<R> {
        self.state::<Scanleaf<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("sageleaf-scanleaf")
        .setup(|app, api| {
            #[cfg(target_os = "android")]
            let handle = api.register_android_plugin(PLUGIN_IDENTIFIER, "SageleafScanleafPlugin")?;
            #[cfg(target_os = "ios")]
            let handle = api.register_ios_plugin(init_plugin_sageleaf_scanleaf)?;
            app.manage(Scanleaf(handle));
            Ok(())
        })
        .build()
}

pub fn init() {
    let _ = tracing_subscriber::fmt().try_init();
    tracing::debug!("telemetry initialized");
}

use intelluxiq_domain::FeatureDescriptor;

pub fn features() -> [FeatureDescriptor; 9] {
    [
        intelluxiq_feature_inbox::FEATURE,
        intelluxiq_feature_whatsapp::FEATURE,
        intelluxiq_feature_email::FEATURE,
        intelluxiq_feature_catalog::FEATURE,
        intelluxiq_feature_quotes::FEATURE,
        intelluxiq_feature_pipeline::FEATURE,
        intelluxiq_feature_intelligence::FEATURE,
        intelluxiq_feature_settings::FEATURE,
        intelluxiq_feature_security::FEATURE,
    ]
}

/// Desktop composition root.
///
/// The gpui-kit window, feature registration, and bootstrap live here once
/// the UI shell is added. See crates/ui and the spec's §14.4.
pub fn run() {
    let _ = tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .try_init();

    let _store = intelluxiq_store::Store;
    let _cursor = intelluxiq_sync::SyncCursor::default();
    intelluxiq_ui::init();

    tracing::info!(
        features = ?features().iter().map(|f| f.id).collect::<Vec<_>>(),
        "IntelluxIQ desktop scaffold"
    );
}

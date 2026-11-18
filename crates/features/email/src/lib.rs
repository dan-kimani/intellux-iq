use intelluxiq_domain::FeatureDescriptor;

pub const FEATURE: FeatureDescriptor = FeatureDescriptor {
    id: "email",
    title: "Email",
};

/// Desktop email is UI/composition only. SMTP/IMAP, MIME parsing, Sent APPEND,
/// and credentials live in cloud workers; this crate must never depend on
/// `lettre`, `async-imap`, or `mail-parser`.
pub fn register() {}

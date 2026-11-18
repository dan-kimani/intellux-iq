//! Desktop sync client: commands, events, cursor resume, conflict handling.

#[derive(Debug, Clone, Copy, Default)]
pub struct SyncCursor(pub u64);

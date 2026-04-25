CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    creator_name TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS list_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id TEXT NOT NULL,
    external_id TEXT NOT NULL,
    source TEXT NOT NULL,
    rank INTEGER NOT NULL,
    title TEXT NOT NULL,
    alt_title TEXT,
    image_url TEXT,
    metadata TEXT,
    FOREIGN KEY (list_id) REFERENCES lists(id)
);

CREATE INDEX IF NOT EXISTS idx_lists_category ON lists(category);
CREATE INDEX IF NOT EXISTS idx_lists_public ON lists(is_public, created_at);
CREATE INDEX IF NOT EXISTS idx_list_items_list ON list_items(list_id);

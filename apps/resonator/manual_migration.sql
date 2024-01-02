---> Manual Migration
CREATE VIRTUAL TABLE character_fts USING fts5(name);

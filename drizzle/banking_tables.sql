-- Create banking enums if they don't exist
DO $$ BEGIN
    CREATE TYPE bank_connection_status AS ENUM('pending', 'active', 'expired', 'revoked', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bank_transaction_type AS ENUM('credit', 'debit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_match_status AS ENUM('unmatched', 'matched', 'ignored');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create bank_connections table
CREATE TABLE IF NOT EXISTS bank_connections (
    id SERIAL PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES building(id) UNIQUE,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    provider_name TEXT,
    status bank_connection_status DEFAULT 'pending',
    last_sync_at TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT REFERENCES "user"(id)
);

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    connection_id INTEGER NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
    building_id TEXT NOT NULL REFERENCES building(id),
    tink_account_id TEXT UNIQUE,
    name TEXT,
    iban TEXT,
    balance INTEGER,
    available_balance INTEGER,
    currency TEXT DEFAULT 'EUR',
    account_type TEXT,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create bank_transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    building_id TEXT NOT NULL REFERENCES building(id),
    tink_transaction_id TEXT UNIQUE,
    amount INTEGER NOT NULL,
    type bank_transaction_type NOT NULL,
    description TEXT,
    original_description TEXT,
    transaction_date DATE NOT NULL,
    booking_date DATE,
    counterparty_name TEXT,
    counterparty_iban TEXT,
    matched_apartment_id INTEGER REFERENCES apartments(id),
    matched_payment_id INTEGER REFERENCES payments(id),
    match_status transaction_match_status DEFAULT 'unmatched',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create resident_ibans table
CREATE TABLE IF NOT EXISTS resident_ibans (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    iban TEXT NOT NULL,
    label TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(apartment_id, iban)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bank_connection_building ON bank_connections(building_id);
CREATE INDEX IF NOT EXISTS idx_bank_connection_status ON bank_connections(status);
CREATE INDEX IF NOT EXISTS idx_bank_account_connection ON bank_accounts(connection_id);
CREATE INDEX IF NOT EXISTS idx_bank_account_building ON bank_accounts(building_id);
CREATE INDEX IF NOT EXISTS idx_bank_account_iban ON bank_accounts(iban);
CREATE INDEX IF NOT EXISTS idx_bank_tx_account ON bank_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_bank_tx_building ON bank_transactions(building_id);
CREATE INDEX IF NOT EXISTS idx_bank_tx_counterparty_iban ON bank_transactions(counterparty_iban);
CREATE INDEX IF NOT EXISTS idx_bank_tx_match_status ON bank_transactions(match_status);
CREATE INDEX IF NOT EXISTS idx_bank_tx_transaction_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_resident_ibans_apartment ON resident_ibans(apartment_id);
CREATE INDEX IF NOT EXISTS idx_resident_ibans_iban ON resident_ibans(iban);

-- CPQ: catálogo e items de costos

-- CreateTable: cpq.catalog_items
CREATE TABLE cpq.catalog_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  base_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  default_visibility TEXT NOT NULL DEFAULT 'visible',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT cpq_catalog_items_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_cpq_catalog_type ON cpq.catalog_items(type);
CREATE INDEX idx_cpq_catalog_active ON cpq.catalog_items(active);

-- CreateTable: cpq.quote_parameters
CREATE TABLE cpq.quote_parameters (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL,
  monthly_hours_standard INTEGER NOT NULL DEFAULT 180,
  avg_stay_months INTEGER NOT NULL DEFAULT 4,
  uniform_changes_per_year INTEGER NOT NULL DEFAULT 3,
  financial_rate_pct NUMERIC(6, 4) NOT NULL DEFAULT 0,
  sale_price_monthly NUMERIC(12, 2) NOT NULL DEFAULT 0,
  policy_rate_pct NUMERIC(6, 4) NOT NULL DEFAULT 0,
  policy_admin_rate_pct NUMERIC(6, 4) NOT NULL DEFAULT 0,
  contract_months INTEGER NOT NULL DEFAULT 12,
  contract_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT cpq_quote_parameters_pkey PRIMARY KEY (id),
  CONSTRAINT cpq_quote_parameters_quote_unique UNIQUE (quote_id)
);

ALTER TABLE cpq.quote_parameters
  ADD CONSTRAINT cpq_quote_parameters_quote_fkey
  FOREIGN KEY (quote_id) REFERENCES cpq.quotes(id) ON DELETE CASCADE;

-- CreateTable: cpq.quote_uniform_items
CREATE TABLE cpq.quote_uniform_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL,
  catalog_item_id UUID NOT NULL,
  unit_price_override NUMERIC(12, 2),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT cpq_quote_uniform_items_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_cpq_uniform_quote ON cpq.quote_uniform_items(quote_id);
CREATE INDEX idx_cpq_uniform_catalog ON cpq.quote_uniform_items(catalog_item_id);

ALTER TABLE cpq.quote_uniform_items
  ADD CONSTRAINT cpq_quote_uniform_items_quote_fkey
  FOREIGN KEY (quote_id) REFERENCES cpq.quotes(id) ON DELETE CASCADE;

ALTER TABLE cpq.quote_uniform_items
  ADD CONSTRAINT cpq_quote_uniform_items_catalog_fkey
  FOREIGN KEY (catalog_item_id) REFERENCES cpq.catalog_items(id);

-- CreateTable: cpq.quote_exam_items
CREATE TABLE cpq.quote_exam_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL,
  catalog_item_id UUID NOT NULL,
  unit_price_override NUMERIC(12, 2),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT cpq_quote_exam_items_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_cpq_exam_quote ON cpq.quote_exam_items(quote_id);
CREATE INDEX idx_cpq_exam_catalog ON cpq.quote_exam_items(catalog_item_id);

ALTER TABLE cpq.quote_exam_items
  ADD CONSTRAINT cpq_quote_exam_items_quote_fkey
  FOREIGN KEY (quote_id) REFERENCES cpq.quotes(id) ON DELETE CASCADE;

ALTER TABLE cpq.quote_exam_items
  ADD CONSTRAINT cpq_quote_exam_items_catalog_fkey
  FOREIGN KEY (catalog_item_id) REFERENCES cpq.catalog_items(id);

-- CreateTable: cpq.quote_cost_items
CREATE TABLE cpq.quote_cost_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL,
  catalog_item_id UUID NOT NULL,
  calc_mode TEXT NOT NULL DEFAULT 'per_month',
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
  unit_price_override NUMERIC(12, 2),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  visibility TEXT NOT NULL DEFAULT 'visible',
  notes TEXT,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT cpq_quote_cost_items_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_cpq_cost_quote ON cpq.quote_cost_items(quote_id);
CREATE INDEX idx_cpq_cost_catalog ON cpq.quote_cost_items(catalog_item_id);
CREATE INDEX idx_cpq_cost_enabled ON cpq.quote_cost_items(is_enabled);

ALTER TABLE cpq.quote_cost_items
  ADD CONSTRAINT cpq_quote_cost_items_quote_fkey
  FOREIGN KEY (quote_id) REFERENCES cpq.quotes(id) ON DELETE CASCADE;

ALTER TABLE cpq.quote_cost_items
  ADD CONSTRAINT cpq_quote_cost_items_catalog_fkey
  FOREIGN KEY (catalog_item_id) REFERENCES cpq.catalog_items(id);

-- CreateTable: cpq.quote_meals
CREATE TABLE cpq.quote_meals (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL,
  meal_type TEXT NOT NULL,
  meals_per_day INTEGER NOT NULL DEFAULT 0,
  days_of_service INTEGER NOT NULL DEFAULT 0,
  price_override NUMERIC(12, 2),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  visibility TEXT NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT cpq_quote_meals_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_cpq_meals_quote ON cpq.quote_meals(quote_id);

ALTER TABLE cpq.quote_meals
  ADD CONSTRAINT cpq_quote_meals_quote_fkey
  FOREIGN KEY (quote_id) REFERENCES cpq.quotes(id) ON DELETE CASCADE;

-- CreateTable: cpq.quote_vehicles
CREATE TABLE cpq.quote_vehicles (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL,
  vehicles_count INTEGER NOT NULL DEFAULT 1,
  rent_monthly NUMERIC(12, 2) NOT NULL DEFAULT 0,
  km_per_day NUMERIC(10, 2) NOT NULL DEFAULT 0,
  days_per_month INTEGER NOT NULL DEFAULT 0,
  km_per_liter NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fuel_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  maintenance_monthly NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  visibility TEXT NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT cpq_quote_vehicles_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_cpq_vehicles_quote ON cpq.quote_vehicles(quote_id);

ALTER TABLE cpq.quote_vehicles
  ADD CONSTRAINT cpq_quote_vehicles_quote_fkey
  FOREIGN KEY (quote_id) REFERENCES cpq.quotes(id) ON DELETE CASCADE;

-- CreateTable: cpq.quote_infrastructure
CREATE TABLE cpq.quote_infrastructure (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  rent_monthly NUMERIC(12, 2) NOT NULL DEFAULT 0,
  has_fuel BOOLEAN NOT NULL DEFAULT false,
  fuel_liters_per_hour NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fuel_hours_per_day NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fuel_days_per_month INTEGER NOT NULL DEFAULT 0,
  fuel_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  visibility TEXT NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT cpq_quote_infrastructure_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_cpq_infra_quote ON cpq.quote_infrastructure(quote_id);

ALTER TABLE cpq.quote_infrastructure
  ADD CONSTRAINT cpq_quote_infrastructure_quote_fkey
  FOREIGN KEY (quote_id) REFERENCES cpq.quotes(id) ON DELETE CASCADE;

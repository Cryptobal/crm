-- CPQ: agregar campos para costos financieros y margen
ALTER TABLE cpq.quote_parameters
  ADD COLUMN policy_contract_months INT DEFAULT 12,
  ADD COLUMN policy_contract_pct DECIMAL(6,2) DEFAULT 100,
  ADD COLUMN margin_pct DECIMAL(6,2) DEFAULT 20;

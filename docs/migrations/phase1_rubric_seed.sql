-- Lighthouse Ledger Phase 1: seed MBA-style generic rubric
-- Run after phase1_rubrics.sql. Maps to four layers: Explanation, Application, Trade-offs, Reflection.

INSERT INTO rubrics (id, name, domain, description, version)
VALUES (
  'rubric_mba_generic_v1',
  'MBA-style Generic Rubric',
  'Generic',
  'Five-criterion analytic rubric for prior learning assessment. Maps to four assessment layers.',
  '1.0'
) ON CONFLICT (id) DO NOTHING;

-- UNDERSTANDING: conceptual accuracy (maps to Explanation layer)
INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_mba_generic_v1', 'UNDERSTANDING', 'Conceptual accuracy',
  'Demonstrates accurate understanding of core concepts, terminology, and relationships.',
  '{"excellent":"Clear, precise explanation with correct use of domain terms; identifies key relationships and nuances.","proficient":"Accurate explanation with minor gaps; generally correct terminology.","needs_improvement":"Vague or inaccurate explanation; confused terminology or missing key concepts."}'::jsonb,
  '{video,text,code,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_mba_generic_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

-- APPLICATION: use in scenario (maps to Application layer)
INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_mba_generic_v1', 'APPLICATION', 'Application in context',
  'Applies concepts appropriately to real or hypothetical scenarios.',
  '{"excellent":"Concrete, relevant application with specific examples; shows transfer to new context.","proficient":"Reasonable application with some specificity; transfer evident.","needs_improvement":"Generic or abstract application; little or no concrete transfer."}'::jsonb,
  '{video,text,code,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_mba_generic_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

-- REASONING: logic and assumptions (maps to Trade-offs/limits)
INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_mba_generic_v1', 'REASONING', 'Logic and assumptions',
  'Identifies assumptions, trade-offs, and limitations; shows logical reasoning.',
  '{"excellent":"Explicitly addresses assumptions and trade-offs; shows critical thinking about limitations.","proficient":"Some awareness of trade-offs and assumptions; reasonable logic.","needs_improvement":"Little awareness of assumptions or limitations; weak or unclear reasoning."}'::jsonb,
  '{video,text,code,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_mba_generic_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

-- EVIDENCE: use of specifics (maps to Application + Reflection)
INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_mba_generic_v1', 'EVIDENCE', 'Use of evidence',
  'Uses specific evidence from the material to support claims.',
  '{"excellent":"Cites specific examples, quotes, or data points; evidence clearly supports claims.","proficient":"Some specific references; evidence generally supports claims.","needs_improvement":"Vague or unsupported claims; little reference to evidence."}'::jsonb,
  '{video,text,code,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_mba_generic_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

-- COMMUNICATION: clarity (maps to Explanation layer)
INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_mba_generic_v1', 'COMMUNICATION', 'Clarity and coherence',
  'Communicates clearly and coherently with appropriate structure.',
  '{"excellent":"Clear, well-structured response; easy to follow and precise.","proficient":"Generally clear; minor issues with structure or clarity.","needs_improvement":"Unclear or disorganised; difficult to follow."}'::jsonb,
  '{video,text,code,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_mba_generic_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

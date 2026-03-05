-- Lighthouse Ledger: Demo Amina seed for product video
-- Run in Supabase SQL Editor AFTER phase1_rubrics, phase1_assessment_runs, phase2_assessment_questions_why_asked, phase5_scoring_records.
-- Replace 39d10382-e3f0-4af7-ba68-9b995eaf1110 with your GUEST_USER_ID from .env.local if different.

-- Fixed IDs for demo (reference these in the app)
-- Entry: aaaaaaaa-0000-4000-8000-000000000001
-- Evidence 1 (YouTube): aaaaaaaa-0000-4000-8000-000000000011
-- Evidence 2 (notebook): aaaaaaaa-0000-4000-8000-000000000012
-- Run: aaaaaaaa-0000-4000-8000-000000000002
-- Verification public_id: demo-amina-verify-v1

-- 1. MSME Retail rubric (rubric_msme_retail_demo_v1)
INSERT INTO rubrics (id, name, domain, description, version)
VALUES (
  'rubric_msme_retail_demo_v1',
  'MSME Retail Demo Rubric',
  'MSME_Retail',
  'Five-criterion rubric for MSME retail operations assessment (demo).',
  '1.0'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_msme_retail_demo_v1', 'Understanding', 'Conceptual accuracy',
  'Demonstrates accurate understanding of core retail concepts: stock, cash flow, credit.',
  '{"excellent":"Clear, precise explanation with correct use of domain terms.","proficient":"Accurate explanation with minor gaps.","needs_improvement":"Vague or inaccurate explanation."}'::jsonb,
  '{video,text,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_msme_retail_demo_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_msme_retail_demo_v1', 'Application', 'Application in context',
  'Applies concepts to real retail scenarios.',
  '{"excellent":"Concrete application with specific examples.","proficient":"Reasonable application with some specificity.","needs_improvement":"Generic or abstract application."}'::jsonb,
  '{video,text,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_msme_retail_demo_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_msme_retail_demo_v1', 'Reasoning', 'Logic and assumptions',
  'Identifies assumptions, trade-offs, and limitations.',
  '{"excellent":"Explicitly addresses assumptions and trade-offs.","proficient":"Some awareness of trade-offs.","needs_improvement":"Little awareness of assumptions."}'::jsonb,
  '{video,text,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_msme_retail_demo_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_msme_retail_demo_v1', 'EvidenceUse', 'Use of evidence',
  'Uses specific evidence from materials to support claims.',
  '{"excellent":"Cites specific examples from transcript or notebook.","proficient":"Some specific references.","needs_improvement":"Vague or unsupported claims."}'::jsonb,
  '{video,text,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_msme_retail_demo_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_msme_retail_demo_v1', 'Communication', 'Clarity and coherence',
  'Communicates clearly and coherently.',
  '{"excellent":"Clear, well-structured response.","proficient":"Generally clear.","needs_improvement":"Unclear or disorganised."}'::jsonb,
  '{video,text,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_msme_retail_demo_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

-- 2. Demo entry
INSERT INTO entries (id, user_id, title, description, created_at, intent_prompt, domain, eligibility, capability_summary, confidence_band)
VALUES (
  'aaaaaaaa-0000-4000-8000-000000000001',
  '39d10382-e3f0-4af7-ba68-9b995eaf1110',
  'Amina – Grocery Shop Operations',
  'Demo entry for MSME retail capability assessment.',
  now(),
  'I want to document my experience running a small grocery shop—managing stock, cash flow, and credit with suppliers—so I can show employers what I have learned.',
  'MSME_Retail',
  'Eligible',
  'Amina demonstrates adequate understanding of retail operations concepts including stock management, cash flow, and supplier credit. She applies these concepts well in practice, with strong use of specific evidence from her video and notebook. Her reasoning about trade-offs (e.g. upfront payment vs credit) is adequate. Communication could be clearer and more structured.',
  'Medium'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  intent_prompt = EXCLUDED.intent_prompt,
  domain = EXCLUDED.domain,
  capability_summary = EXCLUDED.capability_summary,
  confidence_band = EXCLUDED.confidence_band;

-- 3. Evidence: YouTube transcript (mock)
INSERT INTO evidence (id, entry_id, evidence_type, content, created_at, transcript)
VALUES (
  'aaaaaaaa-0000-4000-8000-000000000011',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'link',
  'https://www.youtube.com/watch?v=demo-amina-retail',
  now(),
  E'[0:00] Hi, I''m Amina. I run a small grocery shop in my neighbourhood.\n[0:05] Today I want to share how I manage my stock, cash, and credit with suppliers.\n[0:12] For stock, I keep a simple list. I order when items run low. I try not to over-order because I don''t have much space.\n[0:22] Cash flow is tight. Some customers pay upfront, others buy on credit. I give credit to regulars I trust, but not too much.\n[0:32] With suppliers, I pay upfront when I can get a discount. Otherwise I take 30-day credit. I had one supplier who stopped giving credit after I was late once.\n[0:45] So I learned: pay on time, or you lose the option.'
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, transcript = EXCLUDED.transcript;

-- 4. Evidence: Inventory notebook (text excerpt)
INSERT INTO evidence (id, entry_id, evidence_type, content, created_at)
VALUES (
  'aaaaaaaa-0000-4000-8000-000000000012',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'text',
  E'Inventory notebook excerpt:\n\nWeek 1: Rice 12 bags, Oil 8 bottles. Sold 4 rice, 3 oil. Reorder rice next week.\nWeek 2: Paid supplier M 5000 upfront – got 2% discount. Credit from supplier K due Friday.\nWeek 3: Mr. Hassan (regular) owes 800. Limit 1000 for him. New customer asked for credit – said no, cash only first time.',
  now()
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

-- 5. Assessment questions (6 questions)
INSERT INTO assessment_questions (entry_id, question_number, question_text, layer_number, criterion_code, skill_tags, evidence_anchors, why_asked)
VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 1,
   'Explain how you decide when to reorder stock. What signals do you use?',
   1, 'Understanding', ARRAY['stock_management','decision_making'],
   '[{"evidence_id":"aaaaaaaa-0000-4000-8000-000000000011","anchor":"transcript:0:12-0:22"}]'::jsonb,
   '{"purpose":"Check conceptual understanding of reorder triggers","evidenceTrigger":{"conceptsDetected":["stock","reorder","low"]},"scoringBasis":{"featuresExpected":["signals","thresholds"]}}'::jsonb),
  ('aaaaaaaa-0000-4000-8000-000000000001', 2,
   'You mentioned paying upfront for a discount. What is the trade-off between paying upfront and using supplier credit?',
   2, 'Application', ARRAY['trade_offs','cash_flow'],
   '[{"evidence_id":"aaaaaaaa-0000-4000-8000-000000000011","anchor":"transcript:0:32-0:45"}]'::jsonb,
   '{"purpose":"Application of cash flow concepts","evidenceTrigger":{"conceptsDetected":["upfront","discount","credit"]},"scoringBasis":{"featuresExpected":["trade-off articulation"]}}'::jsonb),
  ('aaaaaaaa-0000-4000-8000-000000000001', 3,
   'How do you manage credit risk with customers? Give an example from your notebook.',
   3, 'Reasoning', ARRAY['credit_risk','customer_management'],
   '[{"evidence_id":"aaaaaaaa-0000-4000-8000-000000000012","anchor":"notebook:Week 3"}]'::jsonb,
   '{"purpose":"Reasoning about trade-offs and limits","evidenceTrigger":{"conceptsDetected":["credit","limit","regular"]},"scoringBasis":{"featuresExpected":["risk mitigation","concrete example"]}}'::jsonb),
  ('aaaaaaaa-0000-4000-8000-000000000001', 4,
   'From your notebook, describe one specific decision you made about a supplier. What evidence supports that it was a good or bad decision?',
   2, 'EvidenceUse', ARRAY['evidence_use','supplier_management'],
   '[{"evidence_id":"aaaaaaaa-0000-4000-8000-000000000012","anchor":"notebook:Week 2"}]'::jsonb,
   '{"purpose":"Use of specific evidence to support claims","evidenceTrigger":{"conceptsDetected":["supplier","upfront","discount"]},"scoringBasis":{"featuresExpected":["citation","evaluation"]}}'::jsonb),
  ('aaaaaaaa-0000-4000-8000-000000000001', 5,
   'What did you learn from the supplier who stopped giving you credit? How would you explain this to another shop owner?',
   4, 'Reasoning', ARRAY['reflection','learning'],
   '[{"evidence_id":"aaaaaaaa-0000-4000-8000-000000000011","anchor":"transcript:0:38-0:45"}]'::jsonb,
   '{"purpose":"Reflection and transfer of learning","evidenceTrigger":{"conceptsDetected":["late","credit","learned"]},"scoringBasis":{"featuresExpected":["lesson","advice"]}}'::jsonb),
  ('aaaaaaaa-0000-4000-8000-000000000001', 6,
   'Summarise your approach to stock, cash, and credit in 2–3 clear sentences that a bank officer could understand.',
   1, 'Communication', ARRAY['communication','summary'],
   '[]'::jsonb,
   '{"purpose":"Clarity and coherence of communication","evidenceTrigger":{"conceptsDetected":["stock","cash","credit"]},"scoringBasis":{"featuresExpected":["clarity","structure"]}}'::jsonb)
ON CONFLICT (entry_id, question_number) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  layer_number = EXCLUDED.layer_number,
  criterion_code = EXCLUDED.criterion_code,
  skill_tags = EXCLUDED.skill_tags,
  evidence_anchors = EXCLUDED.evidence_anchors,
  why_asked = EXCLUDED.why_asked;

-- 6. Assessment answers (sample Amina-style answers)
INSERT INTO assessment_answers (entry_id, question_number, answer_text)
VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 1,
   'I use my notebook. When rice or oil gets low—like half of what I started with—I reorder. I also check what sold fast last week.'),
  ('aaaaaaaa-0000-4000-8000-000000000001', 2,
   'If I pay upfront I get 2% discount from supplier M. But then I have less cash. Credit is good when cash is tight, but I have to pay on time or they stop.'),
  ('aaaaaaaa-0000-4000-8000-000000000001', 3,
   'I give credit only to regulars and I set a limit. Mr Hassan can owe up to 1000. New customers I say cash only first. From my notebook, I turned down one new customer who asked for credit.'),
  ('aaaaaaaa-0000-4000-8000-000000000001', 4,
   'In Week 2 I paid supplier M 5000 upfront and got 2% discount. The evidence is in my notebook. It was a good decision because I saved 100 and had the stock.'),
  ('aaaaaaaa-0000-4000-8000-000000000001', 5,
   'I learned pay on time or you lose credit. I would tell another shop owner: keep a calendar, pay before due date, don''t take it for granted.'),
  ('aaaaaaaa-0000-4000-8000-000000000001', 6,
   'I manage stock by reordering when low. Cash I get from sales and some customers on credit. With suppliers I pay upfront for discount or use 30-day credit and pay on time.')
ON CONFLICT (entry_id, question_number) DO UPDATE SET answer_text = EXCLUDED.answer_text;

-- 7. Assessment run
INSERT INTO assessment_runs (id, entry_id, user_id, started_at, completed_at, question_budget, questions_asked, stop_reason, domain, rubric_id, confidence_category, metadata)
VALUES (
  'aaaaaaaa-0000-4000-8000-000000000002',
  'aaaaaaaa-0000-4000-8000-000000000001',
  '39d10382-e3f0-4af7-ba68-9b995eaf1110',
  now() - interval '1 hour',
  now(),
  6,
  6,
  'sufficient_evidence',
  'MSME_Retail',
  'rubric_msme_retail_demo_v1',
  'medium',
  '{"demo": true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET completed_at = EXCLUDED.completed_at;

-- 8. Scoring records (criterion-level: 3=Strong, 2=Adequate, 1=Needs work)
DELETE FROM scoring_records WHERE run_id = 'aaaaaaaa-0000-4000-8000-000000000002';
INSERT INTO scoring_records (run_id, criterion_code, rater_id, score)
VALUES
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Understanding', 'ai_v1', 2),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Application', 'ai_v1', 3),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Reasoning', 'ai_v1', 2),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'EvidenceUse', 'ai_v1', 3),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Communication', 'ai_v1', 1);

-- 9. Verification record
INSERT INTO verifications (entry_id, public_id, domain, capability_summary, confidence_band, intent_prompt, created_at, evidence_summary, layer1_descriptor, layer2_descriptor, layer3_descriptor, layer4_descriptor, rubric_id)
VALUES (
  'aaaaaaaa-0000-4000-8000-000000000001',
  'demo-amina-verify-v1',
  'MSME_Retail',
  'Amina demonstrates adequate understanding of retail operations concepts including stock management, cash flow, and supplier credit. She applies these concepts well in practice, with strong use of specific evidence from her video and notebook. Her reasoning about trade-offs is adequate. Communication could be clearer and more structured.',
  'Medium',
  'I want to document my experience running a small grocery shop—managing stock, cash flow, and credit with suppliers—so I can show employers what I have learned.',
  now(),
  'YouTube video transcript (stock, cash, credit) + inventory notebook excerpt.',
  'Adequate',
  'Strong',
  'Adequate',
  'Needs work',
  'rubric_msme_retail_demo_v1'
) ON CONFLICT (public_id) DO UPDATE SET
  capability_summary = EXCLUDED.capability_summary,
  confidence_band = EXCLUDED.confidence_band,
  layer1_descriptor = EXCLUDED.layer1_descriptor,
  layer2_descriptor = EXCLUDED.layer2_descriptor,
  layer3_descriptor = EXCLUDED.layer3_descriptor,
  layer4_descriptor = EXCLUDED.layer4_descriptor;

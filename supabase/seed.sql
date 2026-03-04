INSERT INTO public.anonymous_submissions (
  professional_background, professional_role, experience_level, industry, skills,
  preferred_days, preferred_times, frequency,
  format_presentations, format_workshops, format_discussions, format_networking, format_hackathons, format_mentoring,
  format_hybrid, format_custom,
  predefined_topics, custom_topics,
  submission_timestamp, completion_percentage,
  ip_hash, device_id, data_retention_acknowledged
) VALUES
-- 1: Senior dev, very engaged
('tech', 'Software Engineer', 'senior', 'Technology', ARRAY['TypeScript', 'React', 'Node.js'],
 ARRAY['tuesday', 'thursday'], ARRAY['evening'], 'biweekly',
 true, true, false, true, false, false,
 'hybrid', NULL,
 ARRAY['claude-code', 'building-agents', 'mcp-servers', 'coding-with-claude'], NULL,
 NOW() - INTERVAL '1 day', 100,
 'hash_seed_001', 'device_001', true),

-- 2: Junior, partial completion
('tech', 'Junior Developer', 'junior', 'Fintech', ARRAY['Python', 'SQL'],
 ARRAY['wednesday', 'friday'], ARRAY['afternoon', 'evening'], 'monthly',
 true, false, true, false, false, true,
 'virtual', NULL,
 ARRAY['claude-api', 'prompt-engineering', 'hands-on-labs'], NULL,
 NOW() - INTERVAL '2 days', 85,
 'hash_seed_002', 'device_002', true),

-- 3: Lead, in-person only
('tech', 'Tech Lead', 'lead', 'E-Commerce', ARRAY['Java', 'Kubernetes', 'AWS'],
 ARRAY['monday', 'wednesday'], ARRAY['morning'], 'weekly',
 true, true, true, true, false, false,
 'in_person', NULL,
 ARRAY['multi-agent-swarms', 'agentic-workflows', 'automation'], 'CI/CD with AI agents',
 NOW() - INTERVAL '3 days', 100,
 'hash_seed_003', 'device_003', true),

-- 4: Mid designer
('design', 'UX Designer', 'mid', 'Design Agency', ARRAY['Figma', 'CSS', 'Accessibility'],
 ARRAY['tuesday', 'thursday'], ARRAY['afternoon'], 'monthly',
 false, true, false, true, false, false,
 'hybrid', NULL,
 ARRAY['claude-desktop', 'cowork', 'demo-sessions'], NULL,
 NOW() - INTERVAL '3 days', 70,
 'hash_seed_004', 'device_004', true),

-- 5: Executive, minimal form
('business', 'CTO', 'executive', 'SaaS', ARRAY['Strategy', 'Architecture'],
 ARRAY['friday'], ARRAY['morning'], 'quarterly',
 true, false, true, false, false, false,
 'no_preference', NULL,
 ARRAY['building-agents', 'autonomous-tasks'], NULL,
 NOW() - INTERVAL '4 days', 60,
 'hash_seed_005', 'device_005', true),

-- 6: Data scientist
('tech', 'Data Scientist', 'senior', 'Healthcare', ARRAY['Python', 'TensorFlow', 'R'],
 ARRAY['monday', 'wednesday', 'friday'], ARRAY['morning', 'afternoon'], 'biweekly',
 true, true, false, false, true, false,
 'virtual', NULL,
 ARRAY['claude-api', 'claude-code-sdk', 'prompt-engineering', 'live-building'], NULL,
 NOW() - INTERVAL '5 days', 95,
 'hash_seed_006', 'device_006', true),

-- 7: DevOps eng
('tech', 'DevOps Engineer', 'mid', 'Banking', ARRAY['Docker', 'Terraform', 'GitHub Actions'],
 ARRAY['tuesday', 'thursday'], ARRAY['evening'], 'monthly',
 false, true, true, false, true, false,
 'hybrid', 'Lightning talks (10 min)',
 ARRAY['mcp-servers', 'integrations', 'automation', 'coding-with-claude'], NULL,
 NOW() - INTERVAL '5 days', 90,
 'hash_seed_007', 'device_007', true),

-- 8: PM, low completion
('business', 'Product Manager', 'mid', 'Startup', ARRAY['Jira', 'Analytics'],
 ARRAY['wednesday'], ARRAY['afternoon'], NULL,
 true, false, true, true, false, false,
 'in_person', NULL,
 ARRAY['cowork', 'demo-sessions'], NULL,
 NOW() - INTERVAL '6 days', 55,
 'hash_seed_008', 'device_008', true),

-- 9: Freelance fullstack
('tech', 'Fullstack Developer', 'senior', 'Freelance', ARRAY['Next.js', 'TypeScript', 'Supabase', 'Tailwind'],
 ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], ARRAY['flexible'], 'weekly',
 true, true, true, true, true, true,
 'hybrid', NULL,
 ARRAY['claude-code', 'claude-code-sdk', 'building-agents', 'subagents', 'creating-skills', 'mcp-servers', 'hands-on-labs', 'live-building'], 'Open source contributions',
 NOW() - INTERVAL '7 days', 100,
 'hash_seed_009', 'device_009', true),

-- 10: Student
('other', 'Student', 'junior', 'Education', ARRAY['JavaScript', 'HTML', 'CSS'],
 ARRAY['saturday'], ARRAY['morning', 'afternoon'], 'monthly',
 true, true, false, false, false, true,
 'virtual', NULL,
 ARRAY['claude-desktop', 'prompt-engineering', 'hands-on-labs'], NULL,
 NOW() - INTERVAL '8 days', 75,
 'hash_seed_010', 'device_010', true),

-- 11: Backend eng, recent
('tech', 'Backend Engineer', 'mid', 'Logistics', ARRAY['Go', 'PostgreSQL', 'gRPC'],
 ARRAY['tuesday', 'thursday'], ARRAY['evening'], 'biweekly',
 false, true, false, false, true, false,
 'in_person', NULL,
 ARRAY['claude-api', 'mcp-servers', 'automation', 'live-building'], NULL,
 NOW() - INTERVAL '1 day', 80,
 'hash_seed_011', 'device_011', true),

-- 12: Security analyst
('tech', 'Security Analyst', 'senior', 'Cybersecurity', ARRAY['Pentesting', 'OWASP', 'Python'],
 ARRAY['monday', 'friday'], ARRAY['morning'], 'monthly',
 true, false, true, false, false, false,
 'virtual', NULL,
 ARRAY['claude-code', 'integrations', 'autonomous-tasks'], 'AI security auditing',
 NOW() - INTERVAL '9 days', 88,
 'hash_seed_012', 'device_012', true),

-- 13: Mobile dev
('tech', 'Mobile Developer', 'mid', 'Media', ARRAY['Swift', 'Kotlin', 'React Native'],
 ARRAY['wednesday', 'thursday'], ARRAY['afternoon', 'evening'], 'biweekly',
 true, true, false, true, false, false,
 'hybrid', NULL,
 ARRAY['claude-code', 'coding-with-claude', 'demo-sessions'], NULL,
 NOW() - INTERVAL '10 days', 92,
 'hash_seed_013', 'device_013', true),

-- 14: AI researcher
('tech', 'AI Researcher', 'lead', 'Research', ARRAY['PyTorch', 'LangChain', 'LangGraph'],
 ARRAY['monday', 'wednesday', 'friday'], ARRAY['morning', 'afternoon'], 'weekly',
 true, true, true, false, true, true,
 'no_preference', 'Paper reading clubs',
 ARRAY['building-agents', 'multi-agent-swarms', 'subagents', 'agentic-workflows', 'autonomous-tasks', 'claude-code-sdk'], NULL,
 NOW() - INTERVAL '2 days', 100,
 'hash_seed_014', 'device_014', true),

-- 15: Consultant, older submission
('business', 'Management Consultant', 'executive', 'Consulting', ARRAY['Strategy', 'Change Management'],
 ARRAY['friday'], ARRAY['morning'], 'quarterly',
 true, false, true, true, false, false,
 'in_person', NULL,
 ARRAY['cowork', 'prompt-engineering'], NULL,
 NOW() - INTERVAL '12 days', 65,
 'hash_seed_015', 'device_015', true);

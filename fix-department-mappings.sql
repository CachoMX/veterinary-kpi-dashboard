-- Fixed Department Mappings - Handle people with multiple roles
-- Clear existing mappings first
DELETE FROM department_mappings;

-- Insert team members with priority logic:
-- If someone appears in multiple departments, prioritize: Dev > QC > CSM
INSERT INTO department_mappings (user_name, department) VALUES

-- Pure Developers (only in developers list)
('Alex Rivera', 'Dev'),
('Carlos Vazquez', 'Dev'),
('Diana Armendariz', 'Dev'),
('Diega Shelby', 'Dev'),
('Oscar R Pacheco', 'Dev'),
('Othon M', 'Dev'),
('Raul Pandur', 'Dev'),
('Ricardo Ceja', 'Dev'),
('Ruth Lopez', 'Dev'),
('Victor A', 'Dev'),

-- People in both Dev and QC - assign as Dev (primary role)
('Carlos Aragon', 'Dev'),
('Luis Bazan', 'Dev'),
('Marco Duenas', 'Dev'),
('Nicole Tempel', 'Dev'),
('Paola Fimbres', 'Dev'),

-- Pure QC Team (only in QC)
('Abi Thenthirath', 'QC'),
('Alyssa Ortiz', 'QC'),
('Fabiola Moya', 'QC'),
('Heather Jarek', 'QC'),
('Tiffany Souvanansy', 'QC'),
('daniela@vetcelerator.com', 'QC'),

-- Pure CSM/Requestors (not in Dev or QC)
('Alex Romay', 'CSM'),
('Dani Pappenheim', 'CSM'),
('Drew Bartholomew', 'CSM'),
('Jessica Michaels', 'CSM'),
('John Miller', 'CSM'),
('Katarina MacAfee', 'CSM'),
('Lynn Nard', 'CSM'),
('Tom Schoenfelder', 'CSM'),
('Vetcelerator Portal', 'CSM'),
('arun@vetcelerator.com', 'CSM')

ON CONFLICT (user_name) DO NOTHING;

-- Verify the results
SELECT department, COUNT(*) as count 
FROM department_mappings 
WHERE is_active = true 
GROUP BY department 
ORDER BY department;
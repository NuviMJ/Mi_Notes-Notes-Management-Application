-- -- Table: assignment_documents
-- Columns:
-- doc_id int AI PK 
-- assignment_id int 
-- doc_name varchar(200) 
-- file_path varchar(255) 
-- file_type varchar(50) 
-- uploaded_at timestamp

-- -- Table: assignments
-- Columns:
-- assignment_id int AI PK 
-- module_id int 
-- title varchar(200) 
-- deadline date 
-- status enum('Ongoing','Complete')

-- -- Table: modules
-- Columns:
-- id int AI PK 
-- semester_id int 
-- module_name varchar(255) 
-- code varchar(20)

-- -- Table: notes
-- Columns:
-- id int AI PK 
-- module_id int 
-- user_id int 
-- title varchar(150) 
-- description text 
-- file_url varchar(255) 
-- upload_date timestamp

-- -- Table: semesters
-- Columns:
-- id int AI PK 
-- name varchar(50)

-- --Table: users
-- Columns:
-- id int AI PK 
-- name varchar(100) 
-- email varchar(100) 
-- password varchar(255) 
-- role enum('student','admin') 
-- created_at timestamp

-- -- Table: examsTable: exams
-- Columns:
-- exam_id int AI PK 
-- module_id int 
-- exam_name varchar(100) 
-- exam_date date 
-- exam_type enum('Midterm','Final','Quiz','Assignment') 
-- created_at timestamp 
-- updated_at timestamp
CREATE DATABASE time_log
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE SCHEMA IF NOT EXISTS timebot
    AUTHORIZATION postgres;

CREATE TABLE IF NOT EXISTS timebot.employees
(
    employee_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    employee_name text COLLATE pg_catalog."default" NOT NULL,
    slack_id text COLLATE pg_catalog."default" NOT NULL,
    date_deleted timestamp without time zone,
    CONSTRAINT employees_pkey PRIMARY KEY (employee_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS timebot.employees
    OWNER to postgres;

--INSERT INTO timebot.employees(employee_name, slack_id) VALUES ('brianv','U02U0UX30');
----------------------------------------------------
CREATE TABLE IF NOT EXISTS timebot.systems
(
    system_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    system_name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT systems_pkey PRIMARY KEY (system_id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS timebot.systems
    OWNER to postgres;
--												
INSERT INTO timebot.systems(system_name)
VALUES ('Admin'),
('Data Collection'),
('Inhouse Tools'),
('Other'),
('Processes'),
('ROL'),
('Superman'),
('Merchants'),
('Office IT'),
('Data'),
('Alliant'),
('Production IT'),
('Dashboard');

-----------------------------------------
CREATE TABLE IF NOT EXISTS timebot.actions
(
    action_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    action_name text COLLATE pg_catalog."default" NOT NULL,
    --project_id text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT actions_pkey PRIMARY KEY (action_id)
)
TABLESPACE pg_default;

INSERT INTO timebot.actions(action_name)
VALUES ('Building'),
('Coding'),
('Documenting'),
('Fixing'),
('Maintaining'),
('Meeting'),
('Monitoring'),
('Other'),
('Planning'),
('Reporting'),
('Researching'),
('Supporting'),
('Testing'),
('Training'),
('Upgrading');

----------------------------------------

CREATE TABLE IF NOT EXISTS timebot.projects
(
    project_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    project_name text COLLATE pg_catalog."default" NOT NULL,
	allowed_systems integer[] NOT NULL,
    CONSTRAINT projects_pkey PRIMARY KEY (project_id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS timebot.projects
    OWNER to postgres;
--												
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Customer Edits', '{1,2,4,5}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Machine Learning', '{1,3,4,5,6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('One on One', '{1}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Rooftop Merchants', '{1,2,3,4,5}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('VOID Research', '{1}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Click Activity', '{1,4,5}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('State of the System', '{1}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Sales Leads', '{1}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Shopping Centers', '{2,3}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('VOID', '{2,3}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Research Merchants', '{2,3}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Square Footage', '{2}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Daily Worklog', '{3}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Classicall', '{3}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Authentication', '{3,6,7}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Bugzilla', '{3}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Angular', '{3,6,7,11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Dashboard', '{3}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('E2E Tests', '{4,5,6,7}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Performance Tests', '{4,5}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Pillar Tests', '{4,5}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Security Training', '{4}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Sales Pricing', '{4}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Future Projects', '{4}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Hatsu Demo', '{4}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Main Website', '{4}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('FOSS', '{4}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('API', '{6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Custom Reports', '{6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Mobile Data', '{6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Demos API', '{6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Market Opt', '{6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Inrix', '{6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('ROL5', '{6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('ROL5 - Mobile', '{6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Site Signature', '{6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Planned Server Shutdown', '{6}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Servers', '{9,12}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('PostgreSQL', '{9,12}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Environment', '{9,12}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Infrastructure', '{9,12}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Help Desk', '{9}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Goldmine', '{9}');

INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('AGS', '{10}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Inrix Traffic Counts', '{10}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Custom', '{10}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Profile', '{10}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Postal', '{10}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Inrix Drivetimes', '{10}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Safegraph', '{10}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Spatial AI', '{10}');

INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Purchasing', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Project Management', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Sales', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Warehouse', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Administrative', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Data', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Account Management', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('API/Backend', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Timesheets', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Admin', '{11, 13}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Payroll', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Workforce', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Safety', '{11}');
INSERT INTO timebot.projects(project_name, allowed_systems) VALUES ('Continuous Development', '{11}');

----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS timebot.employee_tasks
(
    task_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
	employee_id integer NOT NULL,
    system_id integer NOT NULL,
	project_id integer,
	action_id integer NOT NULL,
	hours double precision NOT NULL DEFAULT 0,
    description text COLLATE pg_catalog."default",
	date_created timestamp without time zone,
    CONSTRAINT user_tasks_pkey PRIMARY KEY (task_id),
	CONSTRAINT fk_employees_id FOREIGN KEY (employee_id)
        REFERENCES timebot.employees (employee_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
	CONSTRAINT fk_system_id FOREIGN KEY (system_id)
        REFERENCES timebot.systems (system_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
	CONSTRAINT fk_project_id FOREIGN KEY (project_id)
        REFERENCES timebot.projects (project_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
	CONSTRAINT fk_action_id FOREIGN KEY (action_id)
        REFERENCES timebot.actions (action_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
	
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS timebot.employee_tasks
    OWNER to postgres;

--INSERT INTO timebot.employee_tasks(employee_id, system_id, project_id, action_id, hours, description, date_created) VALUES (1, 6, 34, 11, 4.5, 'Making this slack bot...', now());

----------------------------------------------------------------



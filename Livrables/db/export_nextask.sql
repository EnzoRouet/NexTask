--
-- PostgreSQL database dump
--

\restrict rrlxqzZh2USaaMR6cyOEiw6ZZx5OI9xTVy0fUQe3ke340M8A9xH1SonG7OQgqUk

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public."Ticket" DROP CONSTRAINT "Ticket_projectId_fkey";
ALTER TABLE ONLY public."Ticket" DROP CONSTRAINT "Ticket_columnId_fkey";
ALTER TABLE ONLY public."Ticket" DROP CONSTRAINT "Ticket_assigneeId_fkey";
ALTER TABLE ONLY public."Project" DROP CONSTRAINT "Project_ownerId_fkey";
ALTER TABLE ONLY public."ProjectMember" DROP CONSTRAINT "ProjectMember_userId_fkey";
ALTER TABLE ONLY public."ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";
ALTER TABLE ONLY public."Doc" DROP CONSTRAINT "Doc_projectId_fkey";
ALTER TABLE ONLY public."BoardColumn" DROP CONSTRAINT "BoardColumn_projectId_fkey";
DROP INDEX public."User_email_key";
DROP INDEX public."ProjectMember_userId_projectId_key";
ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
ALTER TABLE ONLY public."Ticket" DROP CONSTRAINT "Ticket_pkey";
ALTER TABLE ONLY public."Project" DROP CONSTRAINT "Project_pkey";
ALTER TABLE ONLY public."ProjectMember" DROP CONSTRAINT "ProjectMember_pkey";
ALTER TABLE ONLY public."Doc" DROP CONSTRAINT "Doc_pkey";
ALTER TABLE ONLY public."BoardColumn" DROP CONSTRAINT "BoardColumn_pkey";
DROP TABLE public._prisma_migrations;
DROP TABLE public."User";
DROP TABLE public."Ticket";
DROP TABLE public."ProjectMember";
DROP TABLE public."Project";
DROP TABLE public."Doc";
DROP TABLE public."BoardColumn";
DROP TYPE public."Role";
DROP TYPE public."ProjectRole";
DROP TYPE public."Priority";
DROP SCHEMA public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


ALTER TYPE public."Priority" OWNER TO postgres;

--
-- Name: ProjectRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectRole" AS ENUM (
    'PO',
    'DEVELOPER',
    'OWNER'
);


ALTER TYPE public."ProjectRole" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: BoardColumn; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BoardColumn" (
    id text NOT NULL,
    name text NOT NULL,
    "position" integer NOT NULL,
    "projectId" text NOT NULL,
    "isLocked" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."BoardColumn" OWNER TO postgres;

--
-- Name: Doc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Doc" (
    id text NOT NULL,
    title text NOT NULL,
    content text,
    "projectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Doc" OWNER TO postgres;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "ownerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Project" OWNER TO postgres;

--
-- Name: ProjectMember; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProjectMember" (
    id text NOT NULL,
    role public."ProjectRole" DEFAULT 'DEVELOPER'::public."ProjectRole" NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "projectId" text NOT NULL
);


ALTER TABLE public."ProjectMember" OWNER TO postgres;

--
-- Name: Ticket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Ticket" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    "projectId" text NOT NULL,
    "assigneeId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "columnId" text NOT NULL,
    "position" integer NOT NULL
);


ALTER TABLE public."Ticket" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: BoardColumn; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BoardColumn" (id, name, "position", "projectId", "isLocked") FROM stdin;
2f648c17-71f9-45b0-9fda-977065bfc9f3	TODO	1000	77f7e8b8-9664-488b-b0cd-786c66b52af0	f
37701958-fc33-4bb8-8af5-7fbc4e387b83	IN_PROGRESS	2000	77f7e8b8-9664-488b-b0cd-786c66b52af0	f
a9ed38c7-bf8f-4b73-8d9a-e3ed0870c55e	DONE	3000	77f7e8b8-9664-488b-b0cd-786c66b52af0	t
7c94880d-21a0-4d10-b607-548eb49d7c94	QA	2500	77f7e8b8-9664-488b-b0cd-786c66b52af0	f
\.


--
-- Data for Name: Doc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Doc" (id, title, content, "projectId", "createdAt", "updatedAt") FROM stdin;
e22cd326-ce0e-4aa3-8e11-a1736132b964	Convention de code	<ul><li><p>- Snake Case</p></li><li><p>- Une ligne ne fais pas plus de 80 caractères</p></li><li><p>- La colonne DONE est réservée aux PO</p></li><li><p>- Toujours faire des PR pas de push sur la main</p></li></ul><p></p>	77f7e8b8-9664-488b-b0cd-786c66b52af0	2026-06-28 13:05:06.992	2026-06-28 13:06:41.241
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Project" (id, name, description, "ownerId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
77f7e8b8-9664-488b-b0cd-786c66b52af0	Refonte d'une app web		3b7904bb-dace-4949-a902-00ce3c5284ec	2026-06-28 12:57:14.377	2026-06-28 12:57:14.377	\N
\.


--
-- Data for Name: ProjectMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectMember" (id, role, "joinedAt", "userId", "projectId") FROM stdin;
fca310c0-999a-454f-a215-c2f1266d2938	PO	2026-06-28 12:59:19.516	1b0c140e-83f4-4e2f-a54f-aaf7a847f343	77f7e8b8-9664-488b-b0cd-786c66b52af0
de3357b8-56f0-4b63-b60a-01e1764beb8c	DEVELOPER	2026-06-28 13:04:58.853	c8461d64-e9a6-4167-a0d7-a8b018766c46	77f7e8b8-9664-488b-b0cd-786c66b52af0
\.


--
-- Data for Name: Ticket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Ticket" (id, title, description, priority, "projectId", "assigneeId", "createdAt", "updatedAt", "columnId", "position") FROM stdin;
f8185942-f3ff-4376-8d3f-4dd99fc688c8	Refaire le mot de passe oublié 	\N	LOW	77f7e8b8-9664-488b-b0cd-786c66b52af0	c8461d64-e9a6-4167-a0d7-a8b018766c46	2026-06-28 13:07:39.742	2026-06-28 13:08:41.473	2f648c17-71f9-45b0-9fda-977065bfc9f3	2000
1d465420-aa15-4a50-995e-a8f06901a9fe	Optimiser le LCP de la Landing Page	\N	MEDIUM	77f7e8b8-9664-488b-b0cd-786c66b52af0	1b0c140e-83f4-4e2f-a54f-aaf7a847f343	2026-06-28 13:09:05.676	2026-06-28 13:09:12.999	7c94880d-21a0-4d10-b607-548eb49d7c94	1000
7d6f170c-10f3-4f85-815c-2ffd1a942924	Création du schéma de db Prisma	Doit être fait au plus vite, sinon le projet se retrouvera bloqué...	HIGH	77f7e8b8-9664-488b-b0cd-786c66b52af0	3b7904bb-dace-4949-a902-00ce3c5284ec	2026-06-28 13:08:22.892	2026-06-28 13:16:15.925	37701958-fc33-4bb8-8af5-7fbc4e387b83	1000
1dfe3f11-16b4-4cf8-bf1e-9b24d0b3d6f8	Mise en place authentification Google	\N	MEDIUM	77f7e8b8-9664-488b-b0cd-786c66b52af0	c8461d64-e9a6-4167-a0d7-a8b018766c46	2026-06-28 13:07:17.162	2026-06-28 13:16:19.201	2f648c17-71f9-45b0-9fda-977065bfc9f3	1000
cfb61abf-77fc-475a-8fde-b5074cc13fdf	Configuration Pipeline CI/CD avec Docker	\N	HIGH	77f7e8b8-9664-488b-b0cd-786c66b52af0	1b0c140e-83f4-4e2f-a54f-aaf7a847f343	2026-06-28 13:10:15.754	2026-06-28 13:16:23.306	a9ed38c7-bf8f-4b73-8d9a-e3ed0870c55e	1000
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, name, role, "createdAt", "updatedAt", "deletedAt") FROM stdin;
3b7904bb-dace-4949-a902-00ce3c5284ec	admin@gmail.com	$2b$10$sfj/Mu1lbgnnI.JJyRCzzOMEcoKw6kR2TcD13TwZbWPm5zdz8mg2y	Admin	ADMIN	2026-06-03 20:26:39.65	2026-06-28 12:56:29.558	\N
1b0c140e-83f4-4e2f-a54f-aaf7a847f343	John.Doe@gmail.com	$2b$10$6jhN2THGSqE5hRed46hwxeRUEb2Bg0LOc1yrCuDefItfeo84pv.ri	John Doe	USER	2026-06-28 12:58:54.375	2026-06-28 12:58:54.375	\N
eb4fcf0b-39e4-4eac-8adb-e12f3f1dde0e	Jane.Doe@gmail.com	$2b$10$ddsGviRe0/f7FbeK.OL/Z.kbDOtUgCNRbM/.887AYiAXyaTp6QIg.	Jane	USER	2026-06-28 13:01:18.96	2026-06-28 13:01:18.96	\N
c8461d64-e9a6-4167-a0d7-a8b018766c46	theo@gmail.com	$2b$10$15mnZkGxgECPFlfqkGcouOv/LATRx7UCU4R/AHJYiwujLwkvPdc9S	Théo	USER	2026-06-28 13:02:19.781	2026-06-28 13:02:19.781	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
bd49f46b-521b-4ffa-8d5d-3d22b25de782	3ef4d6490a373d0584f4e9f473235780d45e019e32ce32b50c178bf193337053	2026-05-31 20:28:31.654877+00	20260506130038_initialisation	\N	\N	2026-05-31 20:28:31.560448+00	1
349c521b-844e-4e26-adde-615fffa73be8	60b603087199e792b3fd80840a3a6d3fb6e4ade516781eb7cda9871035aa6f3d	2026-06-03 20:30:59.38718+00	20260603203059_add_kanban_columns_dynamic	\N	\N	2026-06-03 20:30:59.264744+00	1
13070e34-bd6f-4964-8920-ca722dac06b6	826472e38ed4e1ae826994edfbfa0f439c95d1cf32dc001ab082af68b4ee57e9	2026-06-04 12:33:43.473029+00	20260604123343_add_locked_column	\N	\N	2026-06-04 12:33:43.391284+00	1
cbd4bf1a-d8fa-43a8-8789-1180477114f7	e0394276d50eba473ddf2143bd187fdceba8fff70cef4c1f71fe6ffe11b6644a	2026-06-05 09:33:03.469292+00	20260605093303_add_project_member_table	\N	\N	2026-06-05 09:33:03.380938+00	1
2d880985-e052-48aa-81db-f0bf9431d452	60de42e56317671af27812c478ab685f92c8d0517615b67dcaa2b46bf18beb8a	2026-06-12 08:20:53.500919+00	20260612082053_add_doc_model	\N	\N	2026-06-12 08:20:53.415954+00	1
6b325d69-56a5-486b-aedc-62f16384a13d	47f8426d1ba7dd0fdeead828a8c6e48b8db1ae5b9217ec1849e9f3e852ebc8fd	2026-06-19 20:56:32.307589+00	20260619205632_add_soft_delete	\N	\N	2026-06-19 20:56:32.230725+00	1
362cfd72-6eef-448a-9d81-8d738cc44f3c	965ef4c42c9118b213c9277b7665431351b688a3fc7f8c609b461e5d038512a0	2026-06-28 13:15:05.335759+00	20260628131505_remove_comment_table	\N	\N	2026-06-28 13:15:05.261553+00	1
\.


--
-- Name: BoardColumn BoardColumn_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BoardColumn"
    ADD CONSTRAINT "BoardColumn_pkey" PRIMARY KEY (id);


--
-- Name: Doc Doc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Doc"
    ADD CONSTRAINT "Doc_pkey" PRIMARY KEY (id);


--
-- Name: ProjectMember ProjectMember_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectMember"
    ADD CONSTRAINT "ProjectMember_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: Ticket Ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ProjectMember_userId_projectId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProjectMember_userId_projectId_key" ON public."ProjectMember" USING btree ("userId", "projectId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: BoardColumn BoardColumn_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BoardColumn"
    ADD CONSTRAINT "BoardColumn_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Doc Doc_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Doc"
    ADD CONSTRAINT "Doc_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectMember ProjectMember_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectMember"
    ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectMember ProjectMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectMember"
    ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Project Project_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ticket Ticket_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ticket Ticket_columnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES public."BoardColumn"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ticket Ticket_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict rrlxqzZh2USaaMR6cyOEiw6ZZx5OI9xTVy0fUQe3ke340M8A9xH1SonG7OQgqUk


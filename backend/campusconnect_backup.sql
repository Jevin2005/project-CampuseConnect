--
-- PostgreSQL database dump
--

\restrict t6JuT0ATsRFTSfaRHUQbXs9tMgfqydSe1Ljj1yPcvAbJvs6OTnQkwyw7pAIZ67d

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    "collegeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Admin" OWNER TO postgres;

--
-- Name: Advertisement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Advertisement" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "bannerUrl" text,
    scope text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    duration integer NOT NULL,
    cost double precision DEFAULT 0 NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    "startsAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "adminId" text NOT NULL,
    "collegeId" text NOT NULL,
    format text DEFAULT 'banner'::text NOT NULL
);


ALTER TABLE public."Advertisement" OWNER TO postgres;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    action text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "adminId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: BuyRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BuyRequest" (
    id text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "buyerId" text NOT NULL,
    "sellerId" text NOT NULL,
    "productId" text NOT NULL
);


ALTER TABLE public."BuyRequest" OWNER TO postgres;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    text text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "senderId" text NOT NULL,
    "threadId" text NOT NULL
);


ALTER TABLE public."ChatMessage" OWNER TO postgres;

--
-- Name: ChatThread; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatThread" (
    id text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "requestId" text NOT NULL
);


ALTER TABLE public."ChatThread" OWNER TO postgres;

--
-- Name: College; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."College" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "emailDomain" text NOT NULL,
    city text,
    type text,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."College" OWNER TO postgres;

--
-- Name: ListingPayment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ListingPayment" (
    id text NOT NULL,
    amount double precision NOT NULL,
    method text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    "transactionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "studentId" text NOT NULL,
    "productId" text NOT NULL
);


ALTER TABLE public."ListingPayment" OWNER TO postgres;

--
-- Name: MasterAdmin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasterAdmin" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MasterAdmin" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    text text NOT NULL,
    type text DEFAULT 'INFO'::text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    amount double precision NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "buyerId" text NOT NULL,
    "sellerId" text NOT NULL,
    "productId" text NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    price double precision NOT NULL,
    category text,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sellerId" text NOT NULL,
    "collegeId" text NOT NULL,
    condition text DEFAULT 'Good'::text,
    "digitalSubType" text,
    images text[] DEFAULT ARRAY[]::text[],
    "listingFeePaid" boolean DEFAULT false NOT NULL,
    "originalPrice" double precision,
    "productType" text DEFAULT 'physical'::text NOT NULL,
    status text DEFAULT 'pending_review'::text NOT NULL,
    views integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "isApproved" boolean DEFAULT false NOT NULL,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    "collegeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    password text,
    "enrollmentId" text,
    phone text,
    "isEmailVerified" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Student" OWNER TO postgres;

--
-- Name: WishlistItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WishlistItem" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "studentId" text NOT NULL,
    "productId" text NOT NULL
);


ALTER TABLE public."WishlistItem" OWNER TO postgres;

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
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Admin" (id, name, email, password, "isApproved", "tokenVersion", "collegeId", "createdAt", "updatedAt", "isEmailVerified") FROM stdin;
cmq7umfsg0004g56cy5p110nv	JEVIN	jevingoti005@gmail.com	$2b$12$pCmYvkQs9aUUrJ6f.2kQFuTCNerLAoP3u6vOZ6JU/.TS.wBuWe.SW	t	0	cmq7umfs90002g56cqps6zui0	2026-06-10 09:10:49.455	2026-06-10 09:12:30.628	t
cmqggpuyh0002g5fow2bh2aoc	Yash Naik	ybnaik@rngpit.ac.in	$2b$12$Ap/vApfjNs4rI1HuTGHsGOeC27e9Njy6tgB31dq1vaBN0Vb5sdQS6	t	0	cmqggpuy70000g5fod9t0kd0b	2026-06-16 09:51:30.041	2026-06-16 09:55:30.259	t
cmqggn7990004g5g49trxb785	Yash Naik	ybnaik@rngoit.acin	$2b$12$FYv7Y1LA7GrMKg1w4V541.O9EfHY1gG14Dx5GhHaNGOvfWML62wMO	t	0	cmqggn78r0002g5g4s4u3igqq	2026-06-16 09:49:26.013	2026-06-16 09:55:40.038	f
\.


--
-- Data for Name: Advertisement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Advertisement" (id, title, description, "bannerUrl", scope, status, duration, cost, views, clicks, "startsAt", "expiresAt", "createdAt", "updatedAt", "adminId", "collegeId", format) FROM stdin;
cmqb7d1zr0003g500wxh2q2v5	hackethon	bigest hackethon in world	/uploads/banners/ad_1781285445175.jpg	own	deactivated	7	0	0	0	2026-06-12 17:30:45.205	2026-06-19 17:30:45.205	2026-06-12 17:30:45.207	2026-06-12 17:34:29.753	cmq7umfsg0004g56cy5p110nv	cmq7umfs90002g56cqps6zui0	square
cmq7uwsjv000ag56cgl7jl4j5	hackthon	nery nice and very heigh oporchunity	/uploads/banners/ad_1781083132331.jpg	own	deactivated	7	0	0	0	2026-06-10 09:18:52.553	2026-06-17 09:18:52.553	2026-06-10 09:18:52.554	2026-06-12 17:34:41.847	cmq7umfsg0004g56cy5p110nv	cmq7umfs90002g56cqps6zui0	banner
cmqb7d1x90001g500y1f1f1kn	hackethon	bigest hackethon in world	/uploads/banners/ad_1781285444925.jpg	own	expired	7	0	101	8	2026-06-12 17:30:45.108	2026-06-19 17:30:45.108	2026-06-12 17:30:45.111	2026-06-21 17:06:52.596	cmq7umfsg0004g56cy5p110nv	cmq7umfs90002g56cqps6zui0	banner
cmqb7gw0q0005g500z9gfek4r	hostel	nice hostel	/uploads/banners/ad_1781285623689.jpg	cross	expired	7	500	208	9	2026-06-12 17:33:44.086	2026-06-19 17:33:44.086	2026-06-12 17:33:44.09	2026-06-21 17:06:52.596	cmq7umfsg0004g56cy5p110nv	cmq7umfs90002g56cqps6zui0	square
cmqb7gw410007g5002g64eaiq	hostel	nice hostel	/uploads/banners/ad_1781285624124.jpg	cross	expired	7	500	316	24	2026-06-12 17:33:44.206	2026-06-19 17:33:44.206	2026-06-12 17:33:44.209	2026-06-21 17:06:52.596	cmq7umfsg0004g56cy5p110nv	cmq7umfs90002g56cqps6zui0	strip
cmqb287hx0001g5z8gn3fung1	best college oporchunity	this is very proved movment	/uploads/banners/ad_1781276820876.jpg	own	active	14	0	107	6	2026-06-12 15:07:00.972	2026-06-26 15:07:00.972	2026-06-12 15:07:00.975	2026-06-21 17:10:15.65	cmq7umfsg0004g56cy5p110nv	cmq7umfs90002g56cqps6zui0	banner
cmqgh4a6v0006g5fo7ci37u87	helooooo	helloooo	/uploads/banners/ad_1781604162828.jpg	own	active	7	0	19	1	2026-06-16 10:02:42.962	2026-06-23 10:02:42.962	2026-06-16 10:02:42.966	2026-06-17 08:05:52.182	cmqggpuyh0002g5fow2bh2aoc	cmqggpuy70000g5fod9t0kd0b	banner
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, action, "ipAddress", "userAgent", "adminId", "createdAt") FROM stdin;
cmq7ulco40001g56cdwtrrbfp	MASTER_LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	cmq7ukhmf0000g5i09ogbfzwu	2026-06-10 09:09:58.755
cmqf8b4y80001g50o88q0p78g	MASTER_LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	cmq7ukhmf0000g5i09ogbfzwu	2026-06-15 13:08:20.042
cmqgfywfc0001g5g42qcc8qs0	MASTER_LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	cmq7ukhmf0000g5i09ogbfzwu	2026-06-16 09:30:32.228
cmqggur9y0004g5fof1j4gbdz	MASTER_LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	cmq7ukhmf0000g5i09ogbfzwu	2026-06-16 09:55:18.55
cmqgisqc9001qg5fo2fwk8nlh	MASTER_LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	cmq7ukhmf0000g5i09ogbfzwu	2026-06-16 10:49:43.257
cmqhqlmip0001g5qgeuq0cjad	MASTER_LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	cmq7ukhmf0000g5i09ogbfzwu	2026-06-17 07:15:54.813
cmqo1f7u40001g59c0x0go5fl	MASTER_LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	cmq7ukhmf0000g5i09ogbfzwu	2026-06-21 17:05:28.68
cmqo1m41v0003g59c0fh0o8zw	MASTER_LOGIN	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	cmq7ukhmf0000g5i09ogbfzwu	2026-06-21 17:10:50.363
\.


--
-- Data for Name: BuyRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BuyRequest" (id, message, status, "createdAt", "updatedAt", "buyerId", "sellerId", "productId") FROM stdin;
cmqgiinqt000eg5fo2vunv2wr	Hi! Is this still available?	rejected	2026-06-16 10:41:53.333	2026-06-16 10:43:27.101	cmqgibx6z000cg5fohl5rwrey	cmqgh9t3t0008g5fozqqag9yl	cmqghxuec000ag5fo2msz0gzk
cmqgilnmj0014g5foijm1ldnv	Can we meet on campus tomorrow?	completed	2026-06-16 10:44:13.148	2026-06-16 10:44:59.487	cmqgibx6z000cg5fohl5rwrey	cmqgh9t3t0008g5fozqqag9yl	cmqghxuec000ag5fo2msz0gzk
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatMessage" (id, text, "createdAt", "senderId", "threadId") FROM stdin;
cmqgij43t000mg5fomj5mimy6	Is this still available?	2026-06-16 10:42:14.537	cmqgh9t3t0008g5fozqqag9yl	cmqgiivm0000ig5foe35njxlu
cmqgik1xf000qg5fotftn74al	What condition is it in?	2026-06-16 10:42:58.371	cmqgibx6z000cg5fohl5rwrey	cmqgiivm0000ig5foe35njxlu
cmqgik4p4000ug5fos7g7j891	I can pay cash.	2026-06-16 10:43:01.96	cmqgh9t3t0008g5fozqqag9yl	cmqgiivm0000ig5foe35njxlu
cmqgik690000yg5fof6pwsctk	Can we meet on campus?	2026-06-16 10:43:03.972	cmqgibx6z000cg5fohl5rwrey	cmqgiivm0000ig5foe35njxlu
cmqgiko3n0012g5fotbwawash	The seller has ended this conversation.	2026-06-16 10:43:27.107	cmqgh9t3t0008g5fozqqag9yl	cmqgiivm0000ig5foe35njxlu
cmqgilzx9001cg5fobogy7jeu	Is this still available?	2026-06-16 10:44:29.085	cmqgh9t3t0008g5fozqqag9yl	cmqgilwmr0018g5fovlca35ax
cmqgim41a001gg5foztk8nrfz	Is the price negotiable?	2026-06-16 10:44:34.414	cmqgibx6z000cg5fohl5rwrey	cmqgilwmr0018g5fovlca35ax
\.


--
-- Data for Name: ChatThread; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatThread" (id, status, "createdAt", "updatedAt", "requestId") FROM stdin;
cmqgiivm0000ig5foe35njxlu	closed	2026-06-16 10:42:03.528	2026-06-16 10:43:27.097	cmqgiinqt000eg5fo2vunv2wr
cmqgilwmr0018g5fovlca35ax	deal_done	2026-06-16 10:44:24.819	2026-06-16 10:44:59.472	cmqgilnmj0014g5foijm1ldnv
\.


--
-- Data for Name: College; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."College" (id, name, code, "emailDomain", city, type, "isApproved", "createdAt", "updatedAt") FROM stdin;
cmq7ukhol0001g5i0axq15unm	Demo College	DEMO2024	demo.edu	Mumbai	Engineering	t	2026-06-10 09:09:18.598	2026-06-10 09:09:18.598
cmq7umfs90002g56cqps6zui0	rngpit	RNGPIT123	jevingoti005@gmail.com	Surat	Engineering	t	2026-06-10 09:10:49.448	2026-06-10 09:12:30.615
cmqggpuy70000g5fod9t0kd0b	Yash engg college	84	rngpit.ac.in	navsari	Engineering	t	2026-06-16 09:51:30.031	2026-06-16 09:55:30.253
cmqggn78r0002g5g4s4u3igqq	Yash engg college	084	rngpit.ac.in	navsari	Engineering	t	2026-06-16 09:49:25.993	2026-06-16 09:55:40.034
\.


--
-- Data for Name: ListingPayment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ListingPayment" (id, amount, method, status, "transactionId", "createdAt", "studentId", "productId") FROM stdin;
\.


--
-- Data for Name: MasterAdmin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasterAdmin" (id, email, password, name, "tokenVersion", "createdAt", "updatedAt") FROM stdin;
cmq7ukhmf0000g5i09ogbfzwu	admin@campusconnect.in	$2b$12$1jhpFTfYkYfxDlo86epfMe2q/Cz6.JlCCJBusJrKIWVCoeLXO6Pn2	Platform Admin	0	2026-06-10 09:09:18.517	2026-06-10 09:09:18.517
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "studentId", text, type, read, "createdAt") FROM stdin;
cmqgiinrc000gg5fomqikjn0g	cmqgh9t3t0008g5fozqqag9yl	varun sent a buy request for your product "pen is good".	NEW_REQUEST	f	2026-06-16 10:41:53.351
cmqgik1xw000sg5fogxmepkxm	cmqgh9t3t0008g5fozqqag9yl	New message from varun about "product".	CHAT_MESSAGE	f	2026-06-16 10:42:58.388
cmqgik69j0010g5fomougzpnx	cmqgh9t3t0008g5fozqqag9yl	New message from varun about "product".	CHAT_MESSAGE	f	2026-06-16 10:43:03.991
cmqgilnms0016g5fozv9zp8n7	cmqgh9t3t0008g5fozqqag9yl	varun sent a buy request for your product "pen is good".	NEW_REQUEST	f	2026-06-16 10:44:13.156
cmqgim41v001ig5fo38slhgsk	cmqgh9t3t0008g5fozqqag9yl	New message from varun about "product".	CHAT_MESSAGE	f	2026-06-16 10:44:34.435
cmqgimnf3001og5fo7a4z6r8b	cmqgh9t3t0008g5fozqqag9yl	Deal completed! You sold "pen is good" for Γé╣40.	DEAL_COMPLETED	f	2026-06-16 10:44:59.535
cmqgiivm6000kg5foqmbt9gjn	cmqgibx6z000cg5fohl5rwrey	Your buy request for "pen is good" has been accepted by the seller.	REQUEST_ACCEPTED	t	2026-06-16 10:42:03.534
cmqgij44o000og5fov638mxby	cmqgibx6z000cg5fohl5rwrey	New message from Anvi Naik about "product".	CHAT_MESSAGE	t	2026-06-16 10:42:14.568
cmqgik4pg000wg5foyzf4a4ia	cmqgibx6z000cg5fohl5rwrey	New message from Anvi Naik about "product".	CHAT_MESSAGE	t	2026-06-16 10:43:01.972
cmqgilwmy001ag5fod4vigxm8	cmqgibx6z000cg5fohl5rwrey	Your buy request for "pen is good" has been accepted by the seller.	REQUEST_ACCEPTED	t	2026-06-16 10:44:24.826
cmqgilzxl001eg5fot1amyzk2	cmqgibx6z000cg5fohl5rwrey	New message from Anvi Naik about "product".	CHAT_MESSAGE	t	2026-06-16 10:44:29.097
cmqgimnew001mg5folmkzbcvn	cmqgibx6z000cg5fohl5rwrey	Deal completed! You bought "pen is good" for Γé╣40.	DEAL_COMPLETED	t	2026-06-16 10:44:59.528
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, amount, status, "createdAt", "updatedAt", "buyerId", "sellerId", "productId") FROM stdin;
cmqgimned001kg5fovgfd7789	40	COMPLETED	2026-06-16 10:44:59.508	2026-06-16 10:44:59.508	cmqgibx6z000cg5fohl5rwrey	cmqgh9t3t0008g5fozqqag9yl	cmqghxuec000ag5fo2msz0gzk
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, title, description, price, category, "isApproved", "createdAt", "updatedAt", "sellerId", "collegeId", condition, "digitalSubType", images, "listingFeePaid", "originalPrice", "productType", status, views) FROM stdin;
cmq7uum940008g56c0mgc25a7	pen like 27	very smoth and very light weight pen	200	Stationery	t	2026-06-10 09:17:11.065	2026-06-12 15:32:18.511	cmq7ur9i50006g56cot6pa3m2	cmq7umfs90002g56cqps6zui0	Like New (Perfect)	\N	{https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev/images/74343613-7d8f-44ff-a6c1-126a1e6dd34c.jpg}	f	250	physical	active	6
cmqbare0g0001g5zchahjjkyx	box 123	nice box , mistry box	200	Books	t	2026-06-12 19:05:52.81	2026-06-15 15:40:37.341	cmq7ur9i50006g56cot6pa3m2	cmq7umfs90002g56cqps6zui0	Like New (Perfect)	\N	{https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev/images/598c3650-66e9-4506-828f-4af238f8fe69.jpg}	f	250	physical	active	6
cmqbab2mz0001g5fkd7dlacge	st- ai full video	this is very usefull content for your exam\r\n\r\n≡ƒô¥ STRUCTURED SPECIFICATIONS:\r\nInstructor: jevin\r\nTotal Videos: 2\r\nDuration: 1.30\r\nTarget Audience: semester 3\r\nPrerequisites: this is very usefull content	99	Digital Resource	t	2026-06-12 18:53:11.566	2026-06-16 09:29:36.294	cmq7ur9i50006g56cot6pa3m2	cmq7umfs90002g56cqps6zui0	Digital	video	{https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev/videos/afaa5b2a-1cbf-4d32-bfc7-18dace562966.mp4}	f	0	digital	active	27
cmqghxuec000ag5fo2msz0gzk	pen is good	pen is good from rngpit	40	Stationery	t	2026-06-16 10:25:42.177	2026-06-16 10:44:59.497	cmqgh9t3t0008g5fozqqag9yl	cmqggpuy70000g5fod9t0kd0b	Like New (Perfect)	\N	{https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev/images/fb85f1b4-0125-40af-b384-bc90623deeb4.jpg,https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev/images/7001bf88-0459-4e41-a00b-83bfaa19da22.jpg}	f	100	physical	sold	6
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Student" (id, email, name, "isApproved", "tokenVersion", "collegeId", "createdAt", "updatedAt", password, "enrollmentId", phone, "isEmailVerified") FROM stdin;
cmq7ur9i50006g56cot6pa3m2	cse.230840131027@gmail.com	jevin goti	t	0	cmq7umfs90002g56cqps6zui0	2026-06-10 09:14:34.585	2026-06-10 09:15:21.869	$2b$12$0tOZbI3l0zAcrUDgCN6j5e3Mg2Q/vGGVpxIjUKDzzB7hwEzwMeTN6	230840131027	9426637078	t
cmqgh9t3t0008g5fozqqag9yl	ybnaik@rngpit.ac.in	Anvi Naik	t	0	cmqggpuy70000g5fod9t0kd0b	2026-06-16 10:07:00.76	2026-06-16 10:10:10.467	$2b$12$AKMcmNX5s/kBEEBnLrYCBeeXUi5yFRyJ2A.hANwL/sOOMvu3pOPhG	\N	\N	t
cmqgibx6z000cg5fohl5rwrey	cse.230840131042@gmail.com	varun	t	0	cmqggpuy70000g5fod9t0kd0b	2026-06-16 10:36:38.987	2026-06-16 10:38:36.398	$2b$12$7SvjkxvUcuvi4uDB4uXnme8K9TrFXJTSUkk0nJnxuNalXfPxDKkxO	230840131042	\N	t
\.


--
-- Data for Name: WishlistItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WishlistItem" (id, "createdAt", "studentId", "productId") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ff7ddf8a-dc51-4251-9ce4-cb32a1ffd9a9	197f2afabd6d2bec20a692f55b013a4f79dc5bd10454beb5c41c7cbafa27c669	2026-06-10 14:24:06.002616+05:30	20260506175927_init	\N	\N	2026-06-10 14:24:05.840644+05:30	1
9d3db10d-51a8-4bce-8c02-559b455bda4a	283ea6503abcf7c23a1f66c8a40bf66ef522d8ff5da29cacb7e5aa3f973497a8	2026-06-10 14:24:06.010534+05:30	20260511185004_add_student_password	\N	\N	2026-06-10 14:24:06.004723+05:30	1
c79c8791-8bb6-41ff-a302-74ed6a631d27	4101f4da873c1920dc5fa19ca64d9fefdb9ee55dc09b213e5c9b703238222da6	2026-06-10 14:24:06.01763+05:30	20260512123636_add_student_auth_fields	\N	\N	2026-06-10 14:24:06.011975+05:30	1
cb750fff-d25b-49d6-b47b-8121fd227962	b13934a614401c34d582100a33439e6a5c3959e8f87fccc4fe4f5b4674e987d7	2026-06-10 14:24:06.115059+05:30	20260519162355_add_wishlist_and_orders_v2	\N	\N	2026-06-10 14:24:06.019439+05:30	1
\.


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: Advertisement Advertisement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Advertisement"
    ADD CONSTRAINT "Advertisement_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BuyRequest BuyRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BuyRequest"
    ADD CONSTRAINT "BuyRequest_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: ChatThread ChatThread_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatThread"
    ADD CONSTRAINT "ChatThread_pkey" PRIMARY KEY (id);


--
-- Name: College College_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."College"
    ADD CONSTRAINT "College_pkey" PRIMARY KEY (id);


--
-- Name: ListingPayment ListingPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ListingPayment"
    ADD CONSTRAINT "ListingPayment_pkey" PRIMARY KEY (id);


--
-- Name: MasterAdmin MasterAdmin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterAdmin"
    ADD CONSTRAINT "MasterAdmin_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: WishlistItem WishlistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Admin_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Admin_email_key" ON public."Admin" USING btree (email);


--
-- Name: ChatThread_requestId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ChatThread_requestId_key" ON public."ChatThread" USING btree ("requestId");


--
-- Name: College_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "College_code_key" ON public."College" USING btree (code);


--
-- Name: ListingPayment_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ListingPayment_productId_key" ON public."ListingPayment" USING btree ("productId");


--
-- Name: MasterAdmin_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasterAdmin_email_key" ON public."MasterAdmin" USING btree (email);


--
-- Name: Student_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Student_email_key" ON public."Student" USING btree (email);


--
-- Name: WishlistItem_studentId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WishlistItem_studentId_productId_key" ON public."WishlistItem" USING btree ("studentId", "productId");


--
-- Name: Admin Admin_collegeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES public."College"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Advertisement Advertisement_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Advertisement"
    ADD CONSTRAINT "Advertisement_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Advertisement Advertisement_collegeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Advertisement"
    ADD CONSTRAINT "Advertisement_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES public."College"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."MasterAdmin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BuyRequest BuyRequest_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BuyRequest"
    ADD CONSTRAINT "BuyRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BuyRequest BuyRequest_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BuyRequest"
    ADD CONSTRAINT "BuyRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BuyRequest BuyRequest_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BuyRequest"
    ADD CONSTRAINT "BuyRequest_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatMessage ChatMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatMessage ChatMessage_threadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES public."ChatThread"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatThread ChatThread_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatThread"
    ADD CONSTRAINT "ChatThread_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public."BuyRequest"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ListingPayment ListingPayment_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ListingPayment"
    ADD CONSTRAINT "ListingPayment_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ListingPayment ListingPayment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ListingPayment"
    ADD CONSTRAINT "ListingPayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_collegeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES public."College"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Student Student_collegeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES public."College"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WishlistItem WishlistItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WishlistItem WishlistItem_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict t6JuT0ATsRFTSfaRHUQbXs9tMgfqydSe1Ljj1yPcvAbJvs6OTnQkwyw7pAIZ67d


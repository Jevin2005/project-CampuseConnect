-- ============================================================
-- CampusConnect — Neon Import Script (DATA ONLY)
-- Neon-compatible: no superuser commands, ordered DELETE + INSERT
-- Run this in Neon SQL Editor after tables exist (prisma migrate ran)
-- ============================================================

-- ── Step 1: DELETE in reverse-dependency order ────────────────────────
-- Tables that always exist
DELETE FROM public."AuditLog";
DELETE FROM public."Notification";
DELETE FROM public."ChatMessage";
DELETE FROM public."ChatThread";
DELETE FROM public."BuyRequest";
DELETE FROM public."Order";
DELETE FROM public."ListingPayment";
DELETE FROM public."WishlistItem";
DELETE FROM public."Advertisement";
DELETE FROM public."Product";
DELETE FROM public."Student";
DELETE FROM public."Admin";
DELETE FROM public."College";
DELETE FROM public."MasterAdmin";
DELETE FROM public._prisma_migrations;

-- Tables that may not exist yet — safe delete (skips if missing)
DO $$ BEGIN DELETE FROM public."SellerPayout";    EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DELETE FROM public."PlatformSettings"; EXCEPTION WHEN undefined_table THEN NULL; END $$;


-- ── Step 2: INSERT in dependency order ───────────────────────────────

-- MasterAdmin
INSERT INTO public."MasterAdmin" (id, email, password, name, "tokenVersion", "createdAt", "updatedAt") VALUES
('cmq7ukhmf0000g5i09ogbfzwu','admin@campusconnect.in','$2b$12$1jhpFTfYkYfxDlo86epfMe2q/Cz6.JlCCJBusJrKIWVCoeLXO6Pn2','Platform Admin',0,'2026-06-10 09:09:18.517','2026-06-10 09:09:18.517');

-- College
INSERT INTO public."College" (id, name, code, "emailDomain", city, type, "isApproved", "createdAt", "updatedAt") VALUES
('cmq7ukhol0001g5i0axq15unm','Demo College','DEMO2024','demo.edu','Mumbai','Engineering',true,'2026-06-10 09:09:18.598','2026-06-10 09:09:18.598'),
('cmq7umfs90002g56cqps6zui0','rngpit','RNGPIT123','jevingoti005@gmail.com','Surat','Engineering',true,'2026-06-10 09:10:49.448','2026-06-10 09:12:30.615'),
('cmqggpuy70000g5fod9t0kd0b','Yash engg college','84','rngpit.ac.in','navsari','Engineering',true,'2026-06-16 09:51:30.031','2026-06-16 09:55:30.253'),
('cmqggn78r0002g5g4s4u3igqq','Yash engg college','084','rngpit.ac.in','navsari','Engineering',true,'2026-06-16 09:49:25.993','2026-06-16 09:55:40.034');

-- Admin
INSERT INTO public."Admin" (id, name, email, password, "isApproved", "tokenVersion", "collegeId", "createdAt", "updatedAt", "isEmailVerified") VALUES
('cmq7umfsg0004g56cy5p110nv','JEVIN','jevingoti005@gmail.com','$2b$12$pCmYvkQs9aUUrJ6f.2kQFuTCNerLAoP3u6vOZ6JU/.TS.wBuWe.SW',true,0,'cmq7umfs90002g56cqps6zui0','2026-06-10 09:10:49.455','2026-06-10 09:12:30.628',true),
('cmqggpuyh0002g5fow2bh2aoc','Yash Naik','ybnaik@rngpit.ac.in','$2b$12$Ap/vApfjNs4rI1HuTGHsGOeC27e9Njy6tgB31dq1vaBN0Vb5sdQS6',true,0,'cmqggpuy70000g5fod9t0kd0b','2026-06-16 09:51:30.041','2026-06-16 09:55:30.259',true),
('cmqggn7990004g5g49trxb785','Yash Naik','ybnaik@rngoit.acin','$2b$12$FYv7Y1LA7GrMKg1w4V541.O9EfHY1gG14Dx5GhHaNGOvfWML62wMO',true,0,'cmqggn78r0002g5g4s4u3igqq','2026-06-16 09:49:26.013','2026-06-16 09:55:40.038',false);

-- Student
INSERT INTO public."Student" (id, email, name, "isApproved", "tokenVersion", "collegeId", "createdAt", "updatedAt", password, "enrollmentId", phone, "isEmailVerified") VALUES
('cmq7ur9i50006g56cot6pa3m2','cse.230840131027@gmail.com','jevin goti',true,0,'cmq7umfs90002g56cqps6zui0','2026-06-10 09:14:34.585','2026-06-10 09:15:21.869','$2b$12$0tOZbI3l0zAcrUDgCN6j5e3Mg2Q/vGGVpxIjUKDzzB7hwEzwMeTN6','230840131027','9426637078',true),
('cmqgh9t3t0008g5fozqqag9yl','ybnaik@rngpit.ac.in','Anvi Naik',true,0,'cmqggpuy70000g5fod9t0kd0b','2026-06-16 10:07:00.76','2026-06-16 10:10:10.467','$2b$12$AKMcmNX5s/kBEEBnLrYCBeeXUi5yFRyJ2A.hANwL/sOOMvu3pOPhG',NULL,NULL,true),
('cmqgibx6z000cg5fohl5rwrey','cse.230840131042@gmail.com','varun',true,0,'cmqggpuy70000g5fod9t0kd0b','2026-06-16 10:36:38.987','2026-06-16 10:38:36.398','$2b$12$7SvjkxvUcuvi4uDB4uXnme8K9TrFXJTSUkk0nJnxuNalXfPxDKkxO','230840131042',NULL,true);

-- Product
INSERT INTO public."Product" (id, title, description, price, category, "isApproved", "createdAt", "updatedAt", "sellerId", "collegeId", condition, "digitalSubType", images, "listingFeePaid", "originalPrice", "productType", status, views) VALUES
('cmq7uum940008g56c0mgc25a7','pen like 27','very smoth and very light weight pen',200,'Stationery',true,'2026-06-10 09:17:11.065','2026-06-12 15:32:18.511','cmq7ur9i50006g56cot6pa3m2','cmq7umfs90002g56cqps6zui0','Like New (Perfect)',NULL,ARRAY['https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev/images/74343613-7d8f-44ff-a6c1-126a1e6dd34c.jpg'],false,250,'physical','active',6),
('cmqbare0g0001g5zchahjjkyx','box 123','nice box , mistry box',200,'Books',true,'2026-06-12 19:05:52.81','2026-06-15 15:40:37.341','cmq7ur9i50006g56cot6pa3m2','cmq7umfs90002g56cqps6zui0','Like New (Perfect)',NULL,ARRAY['https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev/images/598c3650-66e9-4506-828f-4af238f8fe69.jpg'],false,250,'physical','active',6),
('cmqbab2mz0001g5fkd7dlacge','st- ai full video','this is very usefull content for your exam',99,'Digital Resource',true,'2026-06-12 18:53:11.566','2026-06-16 09:29:36.294','cmq7ur9i50006g56cot6pa3m2','cmq7umfs90002g56cqps6zui0','Digital','video',ARRAY['https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev/videos/afaa5b2a-1cbf-4d32-bfc7-18dace562966.mp4'],false,0,'digital','active',27),
('cmqghxuec000ag5fo2msz0gzk','pen is good','pen is good from rngpit',40,'Stationery',true,'2026-06-16 10:25:42.177','2026-06-16 10:44:59.497','cmqgh9t3t0008g5fozqqag9yl','cmqggpuy70000g5fod9t0kd0b','Like New (Perfect)',NULL,ARRAY['https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev/images/fb85f1b4-0125-40af-b384-bc90623deeb4.jpg','https://pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev/images/7001bf88-0459-4e41-a00b-83bfaa19da22.jpg'],false,100,'physical','sold',6);

-- BuyRequest
INSERT INTO public."BuyRequest" (id, message, status, "createdAt", "updatedAt", "buyerId", "sellerId", "productId") VALUES
('cmqgiinqt000eg5fo2vunv2wr','Hi! Is this still available?','rejected','2026-06-16 10:41:53.333','2026-06-16 10:43:27.101','cmqgibx6z000cg5fohl5rwrey','cmqgh9t3t0008g5fozqqag9yl','cmqghxuec000ag5fo2msz0gzk'),
('cmqgilnmj0014g5foijm1ldnv','Can we meet on campus tomorrow?','completed','2026-06-16 10:44:13.148','2026-06-16 10:44:59.487','cmqgibx6z000cg5fohl5rwrey','cmqgh9t3t0008g5fozqqag9yl','cmqghxuec000ag5fo2msz0gzk');

-- ChatThread
INSERT INTO public."ChatThread" (id, status, "createdAt", "updatedAt", "requestId") VALUES
('cmqgiivm0000ig5foe35njxlu','closed','2026-06-16 10:42:03.528','2026-06-16 10:43:27.097','cmqgiinqt000eg5fo2vunv2wr'),
('cmqgilwmr0018g5fovlca35ax','deal_done','2026-06-16 10:44:24.819','2026-06-16 10:44:59.472','cmqgilnmj0014g5foijm1ldnv');

-- ChatMessage
INSERT INTO public."ChatMessage" (id, text, "createdAt", "senderId", "threadId") VALUES
('cmqgij43t000mg5fomj5mimy6','Is this still available?','2026-06-16 10:42:14.537','cmqgh9t3t0008g5fozqqag9yl','cmqgiivm0000ig5foe35njxlu'),
('cmqgik1xf000qg5fotftn74al','What condition is it in?','2026-06-16 10:42:58.371','cmqgibx6z000cg5fohl5rwrey','cmqgiivm0000ig5foe35njxlu'),
('cmqgik4p4000ug5fos7g7j891','I can pay cash.','2026-06-16 10:43:01.96','cmqgh9t3t0008g5fozqqag9yl','cmqgiivm0000ig5foe35njxlu'),
('cmqgik690000yg5fof6pwsctk','Can we meet on campus?','2026-06-16 10:43:03.972','cmqgibx6z000cg5fohl5rwrey','cmqgiivm0000ig5foe35njxlu'),
('cmqgiko3n0012g5fotbwawash','The seller has ended this conversation.','2026-06-16 10:43:27.107','cmqgh9t3t0008g5fozqqag9yl','cmqgiivm0000ig5foe35njxlu'),
('cmqgilzx9001cg5fobogy7jeu','Is this still available?','2026-06-16 10:44:29.085','cmqgh9t3t0008g5fozqqag9yl','cmqgilwmr0018g5fovlca35ax'),
('cmqgim41a001gg5foztk8nrfz','Is the price negotiable?','2026-06-16 10:44:34.414','cmqgibx6z000cg5fohl5rwrey','cmqgilwmr0018g5fovlca35ax');

-- Order
INSERT INTO public."Order" (id, amount, status, "createdAt", "updatedAt", "buyerId", "sellerId", "productId") VALUES
('cmqgimned001kg5fovgfd7789',40,'COMPLETED','2026-06-16 10:44:59.508','2026-06-16 10:44:59.508','cmqgibx6z000cg5fohl5rwrey','cmqgh9t3t0008g5fozqqag9yl','cmqghxuec000ag5fo2msz0gzk');

-- Advertisement
INSERT INTO public."Advertisement" (id, title, description, "bannerUrl", scope, status, duration, cost, views, clicks, "startsAt", "expiresAt", "createdAt", "updatedAt", "adminId", "collegeId", format) VALUES
('cmqb7d1zr0003g500wxh2q2v5','hackethon','bigest hackethon in world',NULL,'own','deactivated',7,0,0,0,'2026-06-12 17:30:45.205','2026-06-19 17:30:45.205','2026-06-12 17:30:45.207','2026-06-12 17:34:29.753','cmq7umfsg0004g56cy5p110nv','cmq7umfs90002g56cqps6zui0','square'),
('cmq7uwsjv000ag56cgl7jl4j5','hackthon','nery nice and very heigh oporchunity',NULL,'own','deactivated',7,0,0,0,'2026-06-10 09:18:52.553','2026-06-17 09:18:52.553','2026-06-10 09:18:52.554','2026-06-12 17:34:41.847','cmq7umfsg0004g56cy5p110nv','cmq7umfs90002g56cqps6zui0','banner'),
('cmqb7d1x90001g500y1f1f1kn','hackethon','bigest hackethon in world',NULL,'own','expired',7,0,101,8,'2026-06-12 17:30:45.108','2026-06-19 17:30:45.108','2026-06-12 17:30:45.111','2026-06-21 17:06:52.596','cmq7umfsg0004g56cy5p110nv','cmq7umfs90002g56cqps6zui0','banner'),
('cmqb7gw0q0005g500z9gfek4r','hostel','nice hostel',NULL,'cross','expired',7,500,208,9,'2026-06-12 17:33:44.086','2026-06-19 17:33:44.086','2026-06-12 17:33:44.09','2026-06-21 17:06:52.596','cmq7umfsg0004g56cy5p110nv','cmq7umfs90002g56cqps6zui0','square'),
('cmqb7gw410007g5002g64eaiq','hostel','nice hostel',NULL,'cross','expired',7,500,316,24,'2026-06-12 17:33:44.206','2026-06-19 17:33:44.206','2026-06-12 17:33:44.209','2026-06-21 17:06:52.596','cmq7umfsg0004g56cy5p110nv','cmq7umfs90002g56cqps6zui0','strip'),
('cmqb287hx0001g5z8gn3fung1','best college oporchunity','this is very proved movment',NULL,'own','active',14,0,107,6,'2026-06-12 15:07:00.972','2026-06-26 15:07:00.972','2026-06-12 15:07:00.975','2026-06-21 17:10:15.65','cmq7umfsg0004g56cy5p110nv','cmq7umfs90002g56cqps6zui0','banner'),
('cmqgh4a6v0006g5fo7ci37u87','helooooo','helloooo',NULL,'own','active',7,0,19,1,'2026-06-16 10:02:42.962','2026-06-23 10:02:42.962','2026-06-16 10:02:42.966','2026-06-17 08:05:52.182','cmqggpuyh0002g5fow2bh2aoc','cmqggpuy70000g5fod9t0kd0b','banner');

-- Notification
INSERT INTO public."Notification" (id, "studentId", text, type, read, "createdAt") VALUES
('cmqgiinrc000gg5fomqikjn0g','cmqgh9t3t0008g5fozqqag9yl','varun sent a buy request for your product "pen is good".','NEW_REQUEST',false,'2026-06-16 10:41:53.351'),
('cmqgik1xw000sg5fogxmepkxm','cmqgh9t3t0008g5fozqqag9yl','New message from varun about "product".','CHAT_MESSAGE',false,'2026-06-16 10:42:58.388'),
('cmqgik69j0010g5fomougzpnx','cmqgh9t3t0008g5fozqqag9yl','New message from varun about "product".','CHAT_MESSAGE',false,'2026-06-16 10:43:03.991'),
('cmqgilnms0016g5fozv9zp8n7','cmqgh9t3t0008g5fozqqag9yl','varun sent a buy request for your product "pen is good".','NEW_REQUEST',false,'2026-06-16 10:44:13.156'),
('cmqgim41v001ig5fo38slhgsk','cmqgh9t3t0008g5fozqqag9yl','New message from varun about "product".','CHAT_MESSAGE',false,'2026-06-16 10:44:34.435'),
('cmqgimnf3001og5fo7a4z6r8b','cmqgh9t3t0008g5fozqqag9yl','Deal completed! You sold "pen is good" for 40.','DEAL_COMPLETED',false,'2026-06-16 10:44:59.535'),
('cmqgiivm6000kg5foqmbt9gjn','cmqgibx6z000cg5fohl5rwrey','Your buy request for "pen is good" has been accepted.','REQUEST_ACCEPTED',true,'2026-06-16 10:42:03.534'),
('cmqgij44o000og5fov638mxby','cmqgibx6z000cg5fohl5rwrey','New message from Anvi Naik about "product".','CHAT_MESSAGE',true,'2026-06-16 10:42:14.568'),
('cmqgik4pg000wg5foyzf4a4ia','cmqgibx6z000cg5fohl5rwrey','New message from Anvi Naik about "product".','CHAT_MESSAGE',true,'2026-06-16 10:43:01.972'),
('cmqgilwmy001ag5fod4vigxm8','cmqgibx6z000cg5fohl5rwrey','Your buy request for "pen is good" has been accepted.','REQUEST_ACCEPTED',true,'2026-06-16 10:44:24.826'),
('cmqgilzxl001eg5fot1amyzk2','cmqgibx6z000cg5fohl5rwrey','New message from Anvi Naik about "product".','CHAT_MESSAGE',true,'2026-06-16 10:44:29.097'),
('cmqgimnew001mg5folmkzbcvn','cmqgibx6z000cg5fohl5rwrey','Deal completed! You bought "pen is good" for 40.','DEAL_COMPLETED',true,'2026-06-16 10:44:59.528');

-- AuditLog
INSERT INTO public."AuditLog" (id, action, "ipAddress", "userAgent", "adminId", "createdAt") VALUES
('cmq7ulco40001g56cdwtrrbfp','MASTER_LOGIN','::1','Mozilla/5.0','cmq7ukhmf0000g5i09ogbfzwu','2026-06-10 09:09:58.755'),
('cmqf8b4y80001g50o88q0p78g','MASTER_LOGIN','::1','Mozilla/5.0','cmq7ukhmf0000g5i09ogbfzwu','2026-06-15 13:08:20.042'),
('cmqgfywfc0001g5g42qcc8qs0','MASTER_LOGIN','::1','Mozilla/5.0','cmq7ukhmf0000g5i09ogbfzwu','2026-06-16 09:30:32.228'),
('cmqggur9y0004g5fof1j4gbdz','MASTER_LOGIN','::1','Mozilla/5.0','cmq7ukhmf0000g5i09ogbfzwu','2026-06-16 09:55:18.55'),
('cmqgisqc9001qg5fo2fwk8nlh','MASTER_LOGIN','::1','Mozilla/5.0','cmq7ukhmf0000g5i09ogbfzwu','2026-06-16 10:49:43.257'),
('cmqhqlmip0001g5qgeuq0cjad','MASTER_LOGIN','::1','Mozilla/5.0','cmq7ukhmf0000g5i09ogbfzwu','2026-06-17 07:15:54.813'),
('cmqo1f7u40001g59c0x0go5fl','MASTER_LOGIN','::1','Mozilla/5.0','cmq7ukhmf0000g5i09ogbfzwu','2026-06-21 17:05:28.68'),
('cmqo1m41v0003g59c0fh0o8zw','MASTER_LOGIN','::1','Mozilla/5.0','cmq7ukhmf0000g5i09ogbfzwu','2026-06-21 17:10:50.363');

-- _prisma_migrations (prevents P3005 on next deploy)
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES
  ('ff7ddf8a-dc51-4251-9ce4-cb32a1ffd9a9','197f2afabd6d2bec20a692f55b013a4f79dc5bd10454beb5c41c7cbafa27c669','2026-06-10 08:54:06.002616+00','20260506175927_init',NULL,NULL,'2026-06-10 08:54:05.840644+00',1),
  ('9d3db10d-51a8-4bce-8c02-559b455bda4a','283ea6503abcf7c23a1f66c8a40bf66ef522d8ff5da29cacb7e5aa3f973497a8','2026-06-10 08:54:06.010534+00','20260511185004_add_student_password',NULL,NULL,'2026-06-10 08:54:06.004723+00',1),
  ('c79c8791-8bb6-41ff-a302-74ed6a631d27','4101f4da873c1920dc5fa19ca64d9fefdb9ee55dc09b213e5c9b703238222da6','2026-06-10 08:54:06.017630+00','20260512123636_add_student_auth_fields',NULL,NULL,'2026-06-10 08:54:06.011975+00',1),
  ('cb750fff-d25b-49d6-b47b-8121fd227962','b13934a614401c34d582100a33439e6a5c3959e8f87fccc4fe4f5b4674e987d7','2026-06-10 08:54:06.115059+00','20260519162355_add_wishlist_and_orders_v2',NULL,NULL,'2026-06-10 08:54:06.019439+00',1)
ON CONFLICT (id) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────────
SELECT
  (SELECT count(*) FROM public."MasterAdmin") AS master_admins,
  (SELECT count(*) FROM public."College")     AS colleges,
  (SELECT count(*) FROM public."Admin")       AS admins,
  (SELECT count(*) FROM public."Student")     AS students,
  (SELECT count(*) FROM public."Product")     AS products,
  (SELECT count(*) FROM public."Order")       AS orders,
  (SELECT count(*) FROM public._prisma_migrations) AS migrations;

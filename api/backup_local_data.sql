--
-- PostgreSQL database dump
--

\restrict iSimnaWqPG1nJwGRdXi4AUeBLePh7ULbTJcFM18wHozHWtHWRmjZgqYpx7PwJzY

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('14eb289d-977a-499b-9f4d-0a12a877ebbd', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'VERIFIKASI_BERKAS', 'Status berkas diubah menjadi [INVALID]. Catatan: Dokumen KTP tidak sesuai dengan yangn di inputkan', 'admin@gmail.com', '2026-10-18 00:33:08.391');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('f711fe9a-5c92-474f-a1c9-c0bb481fa4fb', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'PENILAIAN_DAN_KELULUSAN', 'Nilai: 88.5, Status Kelulusan: LULUS, Ruang: Lab CBT 1, Jadwal: Senin, 20 Mei 2026', 'siswa_test_1792281833026@muska.sch.id', '2026-10-18 00:34:15.368');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('568e7fa9-d8b9-4ccf-847c-6848c9f9054d', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PENGATURAN', 'Memperbarui pengaturan: Status Pengumuman=true, Tgl Pengumuman=2026-05-31T20:00:00.000Z', 'SYSTEM', '2026-10-18 01:20:00.75');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('780b3702-629b-451d-a472-c82e896da1d8', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PENGATURAN', 'Memperbarui pengaturan: Status Pengumuman=false, Tgl Pengumuman=2026-10-18T01:21:00.000Z', 'SYSTEM', '2026-10-18 01:20:48.24');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('c57de1bd-0496-4219-90cd-da65083ac3c9', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'PENILAIAN_DAN_KELULUSAN', 'Nilai: -, Status Kelulusan: MENUNGGU, Ruang: Ruang LAB FO, Jadwal: Senin, 18 Mei 2026 (08.00 - 10.00 WIB)', 'admin@gmail.com', '2026-10-18 01:40:31.275');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('bbe19895-7f6c-48e0-bcde-11bd5154c1cf', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'PENILAIAN_DAN_KELULUSAN', 'Nilai: 90, Status Kelulusan: LULUS, Ruang: Ruang LAB FO, Jadwal: Senin, 18 Mei 2026 (08.00 - 10.00 WIB)', 'admin@gmail.com', '2026-10-18 02:33:01.67');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('8d086675-6102-46f2-b3d1-8af841c709c2', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'PENILAIAN_DAN_KELULUSAN', 'Nilai: 90, Status Kelulusan: TIDAK_LULUS, Ruang: Ruang LAB FO, Jadwal: Senin, 18 Mei 2026 (08.00 - 10.00 WIB)', 'admin@gmail.com', '2026-10-18 02:33:55.492');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('90b22024-5476-4360-b342-539c1026d435', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'PENILAIAN_DAN_KELULUSAN', 'Nilai: 90, Status Kelulusan: MENUNGGU, Ruang: Ruang LAB FO, Jadwal: Senin, 18 Mei 2026 (08.00 - 10.00 WIB)', 'admin@gmail.com', '2026-10-18 02:34:24.634');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('fd390904-6f43-4ccb-b09e-f93642925215', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'BACKUP_DATABASE', 'Membuat file cadangan database (Total 7 data pendaftar)', 'DATABASE', '2026-10-18 09:20:27.894');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('2a02a766-3f93-4d7a-b3b2-25b1f4051e6b', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'BACKUP_DATABASE', 'Membuat file cadangan database (Total 7 data pendaftar)', 'DATABASE', '2026-10-18 09:20:53.889');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('5f8ee2ee-11b7-4c3b-a481-f6c4b2a07923', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'RESTORE_DATABASE', 'Memulihkan database: 7 pendaftar, 8 jurusan, 3 pengaturan', 'DATABASE', '2026-10-18 09:20:54.006');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('e0804148-e7eb-4aec-88cd-654e5935a251', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'JALANKAN_SELEKSI_OTOMATIS', 'Menjalankan seleksi otomatis kuota: Total diproses 1 siswa (1 Lulus, 0 Cadangan)', 'ALL_APPLICANTS', '2026-10-18 09:21:01.825');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('06ce7fe7-a48b-464e-abb9-360949ecc4b9', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROFIL_SEKOLAH', 'Memperbarui data profil sekolah & sambutan kepala sekolah', 'PROFIL_SEKOLAH', '2026-10-18 11:49:33.943');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('9fb9ab69-f884-4b1f-a9e5-bdf7b5ce8bbb', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROFIL_SEKOLAH', 'Memperbarui data profil sekolah & sambutan kepala sekolah', 'PROFIL_SEKOLAH', '2026-10-18 11:49:38.97');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('04c56741-b302-4dc1-baf5-30221a8f2c0b', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROFIL_SEKOLAH', 'Memperbarui data profil sekolah & sambutan kepala sekolah', 'PROFIL_SEKOLAH', '2026-10-18 11:49:39.614');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('ea78535e-46d4-4057-9099-dddab936fcbd', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROFIL_SEKOLAH', 'Memperbarui data profil sekolah & sambutan kepala sekolah', 'PROFIL_SEKOLAH', '2026-10-18 11:49:40.088');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('4aeeaef9-312c-4d5d-93b6-d4264eae49e4', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROFIL_SEKOLAH', 'Memperbarui data profil sekolah & sambutan kepala sekolah', 'PROFIL_SEKOLAH', '2026-10-18 11:49:40.241');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('ab545df7-fe7f-41d1-9786-b53269226af4', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROFIL_SEKOLAH', 'Memperbarui data profil sekolah & sambutan kepala sekolah', 'PROFIL_SEKOLAH', '2026-10-18 11:49:40.64');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('2c90cf6f-b8e5-4b05-86c3-8401c4e9cf40', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Jaringan Komputer dan Telekomunikasi', '5ca235f9-c496-4d32-935f-4f6ea2cbb303', '2026-10-18 11:57:06.783');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('194bf23c-a74f-48cd-92e9-28265e892ad8', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Otomotif (Teknik Sepeda Motor)', '5683f883-6e47-4bc0-815b-55fb989db45d', '2026-10-18 11:57:23.639');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('94405bda-0452-4955-8bbf-a9d73be8d5b4', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Desain Komunikasi Visual', 'd6d93d38-b7d3-4abf-a773-71c4b5c22035', '2026-10-18 11:57:34.006');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('40a2cc3d-9b57-4469-ad8f-e2a87bccbeb7', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Kulineri (Tata Boga)', '7d822156-1ad1-46b1-8a63-1c523bbccf1a', '2026-10-18 11:57:56.844');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('236eccdc-5dd4-4538-8c7e-24b08f04c9a5', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Kecantikan dan Tata Rias', '12ad614a-6426-47f2-811f-bd608a836e7c', '2026-10-18 11:58:09.054');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('5c88a4e1-6e29-42b6-9f3a-5347641b3b56', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Pemesinan (CNC)', 'bb04c639-d1bd-447d-92c0-fccf10cff337', '2026-10-18 11:58:22.93');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('745082f5-f523-484e-9599-a8cb69615efa', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Pengelasan (Welding)', 'cfa87c53-e367-4f49-b312-26d413a1192c', '2026-10-18 11:58:36.908');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('0c4f0557-37d4-4251-a311-3b0c84ff7650', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROFIL_SEKOLAH', 'Memperbarui data profil sekolah & sambutan kepala sekolah', 'PROFIL_SEKOLAH', '2026-10-18 12:04:42.807');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('317d0543-8ab1-4643-a731-3cbaaea93707', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_HERO_SLIDER', 'Memperbarui banner slider: "Penerimaan Siswa Baru (SPMB) Tahun Ajaran 2026/2027"', 'eb37c872-c8f3-40b8-bb49-d0d48ac81884', '2026-10-18 12:07:57.045');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('f51232fb-05a0-4951-b7d6-3eec28845961', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_HERO_SLIDER', 'Memperbarui banner slider: "Pendidikan Vokasi Unggulan & Berstandar Industri"', '6d14cbfe-5fe0-4673-9fb9-058eebee0a0b', '2026-10-18 12:09:24.088');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('b5c213ee-d699-4ac0-8572-be007a3f1551', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_HERO_SLIDER', 'Memperbarui banner slider: "Fasilitas Bengkel Modern & Laboratorium CBT"', '4c3f8a56-6c15-4630-bb12-23b5a5127367', '2026-10-18 12:12:29.637');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('c1ace896-0799-43c4-bf63-d86dacdee871', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_WKS', 'Memperbarui WKS: Drs. Ahmad Fauzi, M.Pd.', '34c20bfd-d6bb-4448-be70-543a3f5c5372', '2026-10-18 12:14:56.412');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('e1cdf82c-6895-4784-b027-28c48f09fb5b', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'DELETE_WKS', 'Menghapus WKS: Drs. Ahmad Fauzi, M.Pd.', '34c20bfd-d6bb-4448-be70-543a3f5c5372', '2026-10-18 12:17:02.511');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('5f81c1bc-5258-4e0b-859a-e7deda36aad8', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'DELETE_WKS', 'Menghapus WKS: Ust. Muhammad Rifa''i, S.Pd.I.', '8727d875-41e5-4d69-9d66-2ca39f693987', '2026-10-18 12:17:06.378');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('5510e9cf-e0b7-4270-a72e-70e5a59ffb49', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_WKS', 'Memperbarui WKS: Ir. Siti Rahmawati, M.T.', '8c81a1b8-b80a-45a8-8bc4-99e08836a2b4', '2026-10-18 12:17:15.149');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('a3d49edc-365f-457f-a100-8416b244902f', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_WKS', 'Memperbarui WKS: Bambang Sudarmono, S.Kom.', '6efd85a6-9522-40b7-9466-1ed761c93bc7', '2026-10-18 12:17:53.221');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('c1081192-63c3-4e65-8806-5851d90e4039', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_MITRA_INDUSTRI', 'Memperbarui mitra industri: Telkom Indonesia', 'efa47a8d-b557-4fdf-b667-b0fa2b7ca5e8', '2026-10-18 12:19:01.452');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('f572a6f1-5d25-47d4-a724-e5481deb07ef', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_MITRA_INDUSTRI', 'Memperbarui mitra industri: PT Astra Honda Motor (AHM)', '8eb7d49f-0174-4dc2-af26-0518676fe8ef', '2026-10-18 12:19:27.983');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('2e30f8e4-90b0-4442-867e-dfd447901850', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_MITRA_INDUSTRI', 'Memperbarui mitra industri: PT United Tractors Tbk', '68cc6cb8-ace7-4773-9d88-43ae1c1533b6', '2026-10-18 12:20:07.821');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('313c0f40-388c-4bba-b474-2e620167f0a7', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_MITRA_INDUSTRI', 'Memperbarui mitra industri: Axioo Class Program', '07ce737c-a3f2-4ae3-9e9a-3b6ffbef6f4e', '2026-10-18 12:20:58.686');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('6444d4a7-1e0f-46b8-bc75-8f00c8d86409', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_MITRA_INDUSTRI', 'Memperbarui mitra industri: Hotel Horison Lampung', '3a86b294-e7a4-472e-af92-6809e08e43f6', '2026-10-18 12:21:24.992');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('5f761feb-ba2f-4732-a915-1aa18f19c699', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_MITRA_INDUSTRI', 'Memperbarui mitra industri: PT Komatsu Indonesia', '03868da9-2cf1-4b1f-8ce2-de738eb6a6a6', '2026-10-18 12:21:50.617');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('30f17dc4-9dbc-4d5a-adbb-92db68bb6701', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_BERITA', 'Memperbarui berita: "Pembukaan Pendaftaran SPMB SMK Muhammadiyah Sekampung Gelombang 1"', '6ec902f2-ccfc-41f6-a7ea-98b8f48c15e5', '2026-10-18 12:30:04.819');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('3add9852-4a12-4d49-b7d1-6aaac7cec8eb', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_BERITA', 'Memperbarui berita: "Siswa Jurusan TKJ Raih Juara 1 LKS Tingkat Provinsi Lampung"', '42c51d05-a363-4c17-beb6-c73a859e6af0', '2026-10-18 12:30:42.311');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('15419c58-8ec7-4a12-ae08-9c57185a70f6', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_BERITA', 'Memperbarui berita: "Kunjungan Industri & Penandatanganan MoU Kelas Khusus Otomotif"', '31a2ed36-1f9b-4aed-a344-9b6e92f435b4', '2026-10-18 12:31:52.34');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('3ba99145-2ed9-4d7f-9957-e54efa622b00', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPLOAD_KNOWLEDGE_BASE', 'Menambahkan dokumen AI Knowledge Base: "test" [Kategori: Brosur]', 'a728268f-23fe-4978-a425-d2ccbe74d450', '2026-10-19 05:36:47.153');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('345d814b-0631-47ec-a13d-c96923ee22c0', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'PENILAIAN_DAN_KELULUSAN', 'Nilai: 90, Status Kelulusan: MENUNGGU, Ruang: Ruang LAB FO, Jadwal: Senin, 18 Mei 2026 (08.00 - 10.00 WIB)', 'admin@gmail.com', '2026-10-19 05:38:09.949');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('b2bdf3ae-010c-42ba-9409-e72e520dc269', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'PENILAIAN_DAN_KELULUSAN', 'Nilai: 90, Status Kelulusan: LULUS, Ruang: Ruang LAB FO, Jadwal: Senin, 18 Mei 2026 (08.00 - 10.00 WIB)', 'admin@gmail.com', '2026-10-19 05:39:59.623');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('5d74bcd4-ac0c-465c-b9ae-b63a8819dd89', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'VERIFIKASI_BERKAS', 'Status berkas diubah menjadi [VALID]. Catatan: Dokumen KTP berhasil diverifikasi secara otomatis oleh sistem OCR. NIK cocok. | Seleksi Otomatis Kuota Rank #1 (LULUS)', 'admin@gmail.com', '2026-10-19 06:57:14.586');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('396ef959-9117-49e4-8723-feb76e402380', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'VERIFIKASI_BERKAS', 'Status berkas diubah menjadi [INVALID]. Catatan: Dokumen KTP berhasil diverifikasi secara otomatis oleh sistem OCR. NIK cocok. | Seleksi Otomatis Kuota Rank #1 (LULUS)', 'admin@gmail.com', '2026-10-19 06:57:25.618');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('02667c46-d833-4a39-b45f-0477407cdf7c', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'VERIFIKASI_BERKAS', 'Status berkas diubah menjadi [VALID]. Catatan: Dokumen KTP berhasil diverifikasi secara otomatis oleh sistem OCR. NIK cocok. | Seleksi Otomatis Kuota Rank #1 (LULUS)', 'admin@gmail.com', '2026-10-19 06:57:44.257');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('64948d9f-f980-4a7f-955a-68ccf82a06ef', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'PENILAIAN_DAN_KELULUSAN', 'Nilai: 90, Status Kelulusan: TIDAK_LULUS, Ruang: Ruang LAB FO, Jadwal: Senin, 18 Mei 2026 (08.00 - 10.00 WIB)', 'admin@gmail.com', '2026-10-19 06:58:21.554');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('47bd5f93-f734-4378-9980-9aa1badd83cd', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'PENILAIAN_DAN_KELULUSAN', 'Nilai: 90, Status Kelulusan: LULUS, Ruang: Ruang LAB FO, Jadwal: Senin, 18 Mei 2026 (08.00 - 10.00 WIB)', 'admin@gmail.com', '2026-10-19 06:58:34.192');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('27aa1001-3633-44a8-9c71-0ff6ba70847d', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Otomotif (Teknik Sepeda Motor)', '5683f883-6e47-4bc0-815b-55fb989db45d', '2026-10-19 10:03:00.864');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('a70a40f2-21da-462a-bca5-85d65e56a7b3', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Jaringan Komputer dan Telekomunikasi', '5ca235f9-c496-4d32-935f-4f6ea2cbb303', '2026-10-19 10:15:27.436');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('3ab34955-4cb8-4033-a1f0-6cecb3faabfa', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Jaringan Komputer dan Telekomunikasi', '5ca235f9-c496-4d32-935f-4f6ea2cbb303', '2026-10-19 10:17:18.162');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('05b6e050-c037-4e5d-b9aa-f75b84918e35', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Jaringan Komputer dan Telekomunikasi', '5ca235f9-c496-4d32-935f-4f6ea2cbb303', '2026-10-19 10:57:14.874');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('c715fab5-8777-416d-88ad-2bd09978d911', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Jaringan Komputer dan Telekomunikasi', '5ca235f9-c496-4d32-935f-4f6ea2cbb303', '2026-10-19 11:07:35.535');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('3c1074c5-2cf3-4aec-ad90-a7daeffbd3be', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Jaringan Komputer dan Telekomunikasi', '5ca235f9-c496-4d32-935f-4f6ea2cbb303', '2026-10-19 11:09:24.9');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('241f1d85-b818-4a0d-b10d-f36bda23c1c6', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Otomotif (Teknik Sepeda Motor)', '5683f883-6e47-4bc0-815b-55fb989db45d', '2026-10-19 14:45:29.649');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('7dac87ef-c62a-43ae-b440-f2f5a45c3c9c', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Desain Komunikasi Visual', 'd6d93d38-b7d3-4abf-a773-71c4b5c22035', '2026-10-19 14:45:59.764');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('f8c8cabb-9764-481c-8682-6f19b8f14fe4', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Bisnis Digital dan Kreatif', '24371fab-aaef-4e69-ab15-f071969de1db', '2026-10-19 14:46:33.731');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('a76f6920-23e4-4b62-9450-bc30d9281130', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Kulineri (Tata Boga)', '7d822156-1ad1-46b1-8a63-1c523bbccf1a', '2026-10-19 14:48:17.089');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('c4784175-e619-4216-a1d6-c44922f1c41f', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Kecantikan dan Tata Rias', '12ad614a-6426-47f2-811f-bd608a836e7c', '2026-10-19 14:51:51.048');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('d1e5b1c6-9375-4805-a76c-0f810244e84d', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Pemesinan (CNC)', 'bb04c639-d1bd-447d-92c0-fccf10cff337', '2026-10-19 14:53:27.199');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('61f74da5-a9d1-4013-8b97-f9e8faae9177', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PROGRAM_KEAHLIAN', 'Memperbarui program keahlian: Teknik Pengelasan (Welding)', 'cfa87c53-e367-4f49-b312-26d413a1192c', '2026-10-19 14:54:01.089');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('3be0bbe7-53ba-4522-88c8-b474573a0009', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PENGATURAN', 'Memperbarui pengaturan: BukaPendaftaran=true, Pengumuman=false, Tahun=2027/2028', 'SYSTEM', '2026-10-20 18:47:36.203');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('d2078a85-d225-426a-b572-f4ad5a36f097', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PENGATURAN', 'Memperbarui pengaturan: BukaPendaftaran=true, Pengumuman=false, Tahun=2027/2028', 'SYSTEM', '2026-10-20 18:48:27.352');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('4776d6b6-9eb8-40d0-9ca2-5e057ed29231', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PENGATURAN', 'Memperbarui pengaturan: BukaPendaftaran=true, Pengumuman=false, Tahun=2026/2027', 'SYSTEM', '2026-10-20 18:49:36.567');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('d8800016-a6c1-47ed-ba65-ef136b1c3a50', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PENGATURAN', 'Memperbarui pengaturan: BukaPendaftaran=false, Pengumuman=false, Tahun=2026/2027', 'SYSTEM', '2026-10-20 19:05:12.237');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('2ae9c505-b9d1-48aa-bafe-09f335cbe1bf', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PENGATURAN', 'Memperbarui pengaturan: BukaPendaftaran=false, Pengumuman=false, Tahun=2026/2027', 'SYSTEM', '2026-10-20 19:05:35.065');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('cfda27c0-aa2d-4439-a773-7a8e353ee5d9', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PENGATURAN', 'Memperbarui pengaturan: BukaPendaftaran=false, Pengumuman=false, Tahun=2026/2027', 'SYSTEM', '2026-10-20 19:05:36.56');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('be75d711-eb43-4375-b4f5-cd44198f628e', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PENGATURAN', 'Memperbarui pengaturan: BukaPendaftaran=true, Pengumuman=false, Tahun=2026/2027', 'SYSTEM', '2026-10-20 19:12:26.036');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('df0daa77-e775-4188-bcdf-a6dcc0a169a5', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_ADMIN', 'Memperbarui akun admin: admin@muska.sch.id (Administrator MUSKA)', 'admin@muska.sch.id', '2026-10-20 19:19:29.119');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('d708e39b-945d-4991-a935-4e2abe926d62', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_ADMIN', 'Memperbarui akun admin: admin@muska.sch.id (Administrator muska)', 'admin@muska.sch.id', '2026-10-20 19:27:34.386');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('e7f82019-dc8d-4dc4-9c5a-60f846b542fa', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_ADMIN', 'Memperbarui akun admin: admin@muska.sch.id (Administrator muska)', 'admin@muska.sch.id', '2026-10-20 19:27:50.411');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('100bcf0b-8aa9-413a-8cc3-8634e9f854bd', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'PENILAIAN_DAN_KELULUSAN', 'Nilai: 88.5, Status Kelulusan: LULUS, Ruang: Lab CBT 1, Jadwal: Senin, 20 Mei 2026', 'siswa_test_1792281833026@muska.sch.id', '2026-10-20 19:28:22.596');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('79d08690-0c3b-4392-af96-6722ebd68326', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_PENGATURAN', 'Memperbarui pengaturan: BukaPendaftaran=true, Pengumuman=false, Tahun=2026/2027', 'SYSTEM', '2026-10-20 19:29:27.863');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('ab3a26f4-b56c-4294-96be-47e48a8c5614', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_KUOTA_JURUSAN', 'Memperbarui kuota jurusan Bisnis Digital dan Kreatif menjadi 7275 kursi', 'Bisnis Digital dan Kreatif', '2026-10-20 19:30:02.164');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('06b60b46-b3fb-4548-85e4-dca655081381', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'UPDATE_KUOTA_JURUSAN', 'Memperbarui kuota jurusan Bisnis Digital dan Kreatif menjadi 70 kursi', 'Bisnis Digital dan Kreatif', '2026-10-20 19:30:06.178');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('a0545ecb-aaa3-49a1-8ffc-1fe378b71877', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'VERIFIKASI_BERKAS', 'Status berkas diubah menjadi [INVALID]. Catatan: Dokumen KTP berhasil diverifikasi secara otomatis oleh sistem OCR. NIK cocok. | Seleksi Otomatis Kuota Rank #1 (LULUS)', 'admin@gmail.com', '2026-10-20 19:45:59.804');
INSERT INTO public."AuditLog" (id, "adminId", "adminNama", aksi, detail, "targetUser", "createdAt") VALUES ('c04474ce-c704-49c1-bcd8-b18abc9d278a', 'de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', 'TAMBAH_ADMIN', 'Menambahkan akun admin baru: admin2@gmail.com (Admin2)', 'admin2@gmail.com', '2026-10-21 09:30:14.501');


--
-- Data for Name: Berita; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Berita" (id, judul, slug, ringkasan, konten, thumbnail, kategori, "tanggalPublish", penulis, "createdAt", "updatedAt") VALUES ('6ec902f2-ccfc-41f6-a7ea-98b8f48c15e5', 'Pembukaan Pendaftaran SPMB SMK Muhammadiyah Sekampung Gelombang 1', 'pembukaan-spmb-gelombang-1-2026', 'Pendaftaran peserta didik baru resmi dibuka dengan kemudahan upload berkas digital berteknologi OCR cerdas.', 'SMK Muhammadiyah Sekampung secara resmi membuka gelombang pertama penerimaan peserta didik baru (SPMB) untuk tahun ajaran 2026/2027. Pada periode ini, calon siswa mendapatkan fasilitas kemudahan pendaftaran online terintegrasi dengan kecerdasan buatan (AI) yang mempermudah proses verifikasi berkas secara instan.', '/uploads/website/cms-1792326602358-669488148.jpg', 'Umum', '2026-10-18 10:13:44.367', 'Humas SMK MUSKA', '2026-10-18 10:13:44.371', '2026-10-18 12:30:04.794');
INSERT INTO public."Berita" (id, judul, slug, ringkasan, konten, thumbnail, kategori, "tanggalPublish", penulis, "createdAt", "updatedAt") VALUES ('42c51d05-a363-4c17-beb6-c73a859e6af0', 'Siswa Jurusan TKJ Raih Juara 1 LKS Tingkat Provinsi Lampung', 'siswa-tkj-juara-1-lks-lampung', 'Prestasi gemilang kembali ditorehkan ananda Fikri Pratama pada cabang IT Network System Administration.', 'Prestasi membanggakan kembali diukir oleh peserta didik SMK Muhammadiyah Sekampung. Dalam gelaran Lomba Kompetensi Siswa (LKS) Tingkat Provinsi Lampung, perwakilan jurusan TJKT berhasil menyabet juara pertama dan melaju ke tingkat nasional.', '/uploads/website/cms-1792326640791-899851003.jpg', 'Prestasi', '2026-10-15 10:13:44.367', 'Tim Jurnalistik MUSKA', '2026-10-18 10:13:44.371', '2026-10-18 12:30:42.299');
INSERT INTO public."Berita" (id, judul, slug, ringkasan, konten, thumbnail, kategori, "tanggalPublish", penulis, "createdAt", "updatedAt") VALUES ('31a2ed36-1f9b-4aed-a344-9b6e92f435b4', 'Kunjungan Industri & Penandatanganan MoU Kelas Khusus Otomotif', 'mou-kelas-industri-otomotif', 'Perluasan kerja sama link and match kurikulum berbasis kebutuhan bengkel resmi nasional.', 'Guna memperkuat relevansi kompetensi lulusan dengan kebutuhan dunia kerja riil, SMK Muhammadiyah Sekampung menandatangani perjanjian kerja sama kelas industri bersama mitra ATPM terkemuka, menjamin peluang magang dan rekrutmen kerja langsung.', '/uploads/website/cms-1792326711115-881198010.jpg', 'Jurusan', '2026-10-11 10:13:44.367', 'WKS 3 Humas & Hubin', '2026-10-18 10:13:44.371', '2026-10-18 12:31:52.315');


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."User" (id, email, password, nama, role, "createdAt") VALUES ('9a908258-f19a-453e-8b26-1409419e1c27', 'siswa@example.com', '$2b$10$u.QVwIDebC7Og6FLlA3DIuAywYwcu88pYxdlXGSj2mSSrXr/2JAW6', 'Budi Santoso', 'USER', '2026-10-16 16:49:58.931');
INSERT INTO public."User" (id, email, password, nama, role, "createdAt") VALUES ('b7b5d261-3d5f-4259-b605-2dc06c0ebd90', 'test1@example.com', '$2b$10$eSWzmcYe2IUvQpZ5ZfNR3.zjioew3C1n4INIx0xWzfkG1BstGdTp2', 'Test 1', 'USER', '2026-10-17 18:43:55.118');
INSERT INTO public."User" (id, email, password, nama, role, "createdAt") VALUES ('71ca75c4-18b1-4eb9-b1c3-d2c22b741b99', 'budi_1792263052886@example.com', '$2b$10$EmEWvpe64mjrvcWEOAWyzOe2tMWK0rGw9KKckJI.zMPBvCJ5NsDAi', 'Budi Santoso', 'USER', '2026-10-17 18:50:53.195');
INSERT INTO public."User" (id, email, password, nama, role, "createdAt") VALUES ('c84acaa5-89df-499b-b0bf-80b1e7d6641f', 'siswa_1792263114504@example.com', '$2b$10$X0.JFvNZmyKbyhJjIfSFIu3pwrs1OP6Nnkrxp8Waw0EhSXCEIxXPK', 'Ahmad Faiz', 'USER', '2026-10-17 18:51:54.851');
INSERT INTO public."User" (id, email, password, nama, role, "createdAt") VALUES ('48041ce7-2412-4f5b-9792-0486a870aca4', 'faiz_1792263720@gmail.com', '$2b$10$Xhk3Oqay4pugyyImasVczuGt4BEvrCCKo6vvaCp06agV7O6pMrydO', 'Faiz Nizar Nuaim', 'USER', '2026-10-17 19:05:44.59');
INSERT INTO public."User" (id, email, password, nama, role, "createdAt") VALUES ('ea9fac86-e504-4186-bd8c-f542b5156521', 'budi@example.com', '$2b$10$7Ja5cT8OCf.U9qG3G.qe.eshPimI/x32Y7nUUVhpa4RZ.6sryTRsC', 'Budi Santoso', 'USER', '2026-10-17 19:32:54.554');
INSERT INTO public."User" (id, email, password, nama, role, "createdAt") VALUES ('5563dbd2-c9b7-435b-8f75-ac58e2f33200', 'siswa_test_1792281833026@muska.sch.id', '$2b$10$ol8srrY3EJ7sCk0w2bMvCOY.FhDaJBGrM5GF9SY3Vb1Z3hxLWgU8q', 'Siswa Uji Coba', 'USER', '2026-10-18 00:03:53.336');
INSERT INTO public."User" (id, email, password, nama, role, "createdAt") VALUES ('de82f276-6532-43c8-8305-6defe1614c4b', 'admin@muska.sch.id', '$2b$10$IKmG4YZBYwV0ZtA63hLxuOw70464ZUn6qtYH34CrlXwSK3F.ZIjBi', 'Administrator muska', 'ADMIN', '2026-10-18 00:20:27.786');
INSERT INTO public."User" (id, email, password, nama, role, "createdAt") VALUES ('7ad3b865-8afb-4a3c-b6e4-02449cdb3128', 'admin@gmail.com', '$2b$10$0otHs8AJk1tuGvXLiNmNi.3mm5RpUlfd.e58PwtbcdaqavUmXcSuq', 'faiz nizar nu''aim', 'USER', '2026-10-17 18:54:49.609');
INSERT INTO public."User" (id, email, password, nama, role, "createdAt") VALUES ('997c6e0b-5c5d-45d1-94ec-4ccc9438b9bd', 'admin2@gmail.com', '$2b$10$veL5gyIqkKrQw82eXReyzO1bB.ZJPgO.gqwgSmUPyFYyLNUprJcjC', 'Admin2', 'ADMIN', '2026-10-21 09:30:14.479');


--
-- Data for Name: Pendaftaran; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Pendaftaran" (id, "userId", nisn, nik, jurusan, status, "createdAt", agama, alamat, "alamatOrtu", "alamatWali", "beratBadan", "catatanVerifikasi", ekstrakurikuler, intrakurikuler, "jadwalUjian", "jenisKelamin", "namaAyah", "namaIbu", "namaLengkap", "namaWali", "noHpOrtu", "noHpWa", "noHpWali", "nomorPendaftaran", "pekerjaanAyah", "pekerjaanIbu", "ruangUjian", "sekolahAsal", "tanggalLahir", "tempatLahir", "tinggiBadan", "ukuranBaju", "ukuranBajuLainnya", "updatedAt", "buktiPembayaran", "namaIbuKandung", "nilaiUjian", "statusKelulusan", "statusPembayaran", latitude, longitude) VALUES ('21d5eac8-6276-4aea-a6c4-ed80687fb0d9', '9a908258-f19a-453e-8b26-1409419e1c27', '0012345678', '3171234567890123', 'Teknik Komputer dan Jaringan', 'PENDING', '2026-10-16 16:57:34.606', NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:20:53.962', NULL, NULL, NULL, 'MENUNGGU', 'BELUM_BAYAR', NULL, NULL);
INSERT INTO public."Pendaftaran" (id, "userId", nisn, nik, jurusan, status, "createdAt", agama, alamat, "alamatOrtu", "alamatWali", "beratBadan", "catatanVerifikasi", ekstrakurikuler, intrakurikuler, "jadwalUjian", "jenisKelamin", "namaAyah", "namaIbu", "namaLengkap", "namaWali", "noHpOrtu", "noHpWa", "noHpWali", "nomorPendaftaran", "pekerjaanAyah", "pekerjaanIbu", "ruangUjian", "sekolahAsal", "tanggalLahir", "tempatLahir", "tinggiBadan", "ukuranBaju", "ukuranBajuLainnya", "updatedAt", "buktiPembayaran", "namaIbuKandung", "nilaiUjian", "statusKelulusan", "statusPembayaran", latitude, longitude) VALUES ('0652431b-902b-4dab-9fcf-2b0406eee3a0', '5563dbd2-c9b7-435b-8f75-ac58e2f33200', '0098765432', '1807010101010099', 'TKJ', 'PENDING', '2026-10-18 00:03:53.336', NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, 'Senin, 20 Mei 2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Lab CBT 1', NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-20 19:28:22.585', NULL, NULL, 88.5, 'LULUS', 'BELUM_BAYAR', NULL, NULL);
INSERT INTO public."Pendaftaran" (id, "userId", nisn, nik, jurusan, status, "createdAt", agama, alamat, "alamatOrtu", "alamatWali", "beratBadan", "catatanVerifikasi", ekstrakurikuler, intrakurikuler, "jadwalUjian", "jenisKelamin", "namaAyah", "namaIbu", "namaLengkap", "namaWali", "noHpOrtu", "noHpWa", "noHpWali", "nomorPendaftaran", "pekerjaanAyah", "pekerjaanIbu", "ruangUjian", "sekolahAsal", "tanggalLahir", "tempatLahir", "tinggiBadan", "ukuranBaju", "ukuranBajuLainnya", "updatedAt", "buktiPembayaran", "namaIbuKandung", "nilaiUjian", "statusKelulusan", "statusPembayaran", latitude, longitude) VALUES ('0b685a40-d65e-4500-adbb-175741bb086a', '7ad3b865-8afb-4a3c-b6e4-02449cdb3128', '1234567890', '1234567890', '1. TKJ (Teknik Komputer & Jaringan)', 'INVALID', '2026-10-17 18:54:49.609', 'Islam', 'Marga Mulya', '', 'Marga Mulya', 50, 'Dokumen KTP berhasil diverifikasi secara otomatis oleh sistem OCR. NIK cocok. | Seleksi Otomatis Kuota Rank #1 (LULUS)', '{"Web programing",E-Sport,Futsal}', 'IPM', 'Senin, 18 Mei 2026 (08.00 - 10.00 WIB)', 'Laki-laki', 'Suradi', 'Nainul Fauziah', 'faiz nizar nu''aim', 'Suradi', '081809884140', '081809884140', '081809884140', 'MUSKA-2026-28011', 'Wirausaha', 'Ibu Rumah Tangga', 'Ruang LAB FO', 'SMP N 1 Sekampung', '2005-04-14', 'Sekampung', 161, 'L (45-50 kg)', '', '2026-10-20 20:42:06.694', NULL, 'Nainul Fauziah', 90, 'LULUS', 'BELUM_BAYAR', -5.381474, 105.256855);
INSERT INTO public."Pendaftaran" (id, "userId", nisn, nik, jurusan, status, "createdAt", agama, alamat, "alamatOrtu", "alamatWali", "beratBadan", "catatanVerifikasi", ekstrakurikuler, intrakurikuler, "jadwalUjian", "jenisKelamin", "namaAyah", "namaIbu", "namaLengkap", "namaWali", "noHpOrtu", "noHpWa", "noHpWali", "nomorPendaftaran", "pekerjaanAyah", "pekerjaanIbu", "ruangUjian", "sekolahAsal", "tanggalLahir", "tempatLahir", "tinggiBadan", "ukuranBaju", "ukuranBajuLainnya", "updatedAt", "buktiPembayaran", "namaIbuKandung", "nilaiUjian", "statusKelulusan", "statusPembayaran", latitude, longitude) VALUES ('2e723ae0-d1d3-4bb6-9b62-3d96d04eff76', '71ca75c4-18b1-4eb9-b1c3-d2c22b741b99', '0055632087', '3307010101990001', 'TKJ', 'PENDING', '2026-10-17 18:50:53.195', NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:20:53.968', NULL, NULL, NULL, 'MENUNGGU', 'BELUM_BAYAR', NULL, NULL);
INSERT INTO public."Pendaftaran" (id, "userId", nisn, nik, jurusan, status, "createdAt", agama, alamat, "alamatOrtu", "alamatWali", "beratBadan", "catatanVerifikasi", ekstrakurikuler, intrakurikuler, "jadwalUjian", "jenisKelamin", "namaAyah", "namaIbu", "namaLengkap", "namaWali", "noHpOrtu", "noHpWa", "noHpWali", "nomorPendaftaran", "pekerjaanAyah", "pekerjaanIbu", "ruangUjian", "sekolahAsal", "tanggalLahir", "tempatLahir", "tinggiBadan", "ukuranBaju", "ukuranBajuLainnya", "updatedAt", "buktiPembayaran", "namaIbuKandung", "nilaiUjian", "statusKelulusan", "statusPembayaran", latitude, longitude) VALUES ('87f73a66-653b-49ca-9180-f90d667db68d', 'c84acaa5-89df-499b-b0bf-80b1e7d6641f', '0064397203', '3307010203040001', 'TKJ', 'PENDING', '2026-10-17 18:51:54.851', NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:20:53.971', NULL, NULL, NULL, 'MENUNGGU', 'BELUM_BAYAR', NULL, NULL);
INSERT INTO public."Pendaftaran" (id, "userId", nisn, nik, jurusan, status, "createdAt", agama, alamat, "alamatOrtu", "alamatWali", "beratBadan", "catatanVerifikasi", ekstrakurikuler, intrakurikuler, "jadwalUjian", "jenisKelamin", "namaAyah", "namaIbu", "namaLengkap", "namaWali", "noHpOrtu", "noHpWa", "noHpWali", "nomorPendaftaran", "pekerjaanAyah", "pekerjaanIbu", "ruangUjian", "sekolahAsal", "tanggalLahir", "tempatLahir", "tinggiBadan", "ukuranBaju", "ukuranBajuLainnya", "updatedAt", "buktiPembayaran", "namaIbuKandung", "nilaiUjian", "statusKelulusan", "statusPembayaran", latitude, longitude) VALUES ('c466fdc5-267a-4667-9705-817d5ce78de7', '48041ce7-2412-4f5b-9792-0486a870aca4', '0064829103', '3307011802030001', 'TKJ', 'PENDING', '2026-10-17 19:05:44.59', NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-18 09:20:53.974', NULL, NULL, NULL, 'MENUNGGU', 'BELUM_BAYAR', NULL, NULL);
INSERT INTO public."Pendaftaran" (id, "userId", nisn, nik, jurusan, status, "createdAt", agama, alamat, "alamatOrtu", "alamatWali", "beratBadan", "catatanVerifikasi", ekstrakurikuler, intrakurikuler, "jadwalUjian", "jenisKelamin", "namaAyah", "namaIbu", "namaLengkap", "namaWali", "noHpOrtu", "noHpWa", "noHpWali", "nomorPendaftaran", "pekerjaanAyah", "pekerjaanIbu", "ruangUjian", "sekolahAsal", "tanggalLahir", "tempatLahir", "tinggiBadan", "ukuranBaju", "ukuranBajuLainnya", "updatedAt", "buktiPembayaran", "namaIbuKandung", "nilaiUjian", "statusKelulusan", "statusPembayaran", latitude, longitude) VALUES ('754dc3d7-de32-4418-962f-4949a5e6106b', 'ea9fac86-e504-4186-bd8c-f542b5156521', '0081234567', '3305123456789012', 'TKJ', 'PENDING', '2026-10-17 19:32:54.554', 'Islam', 'marga mulya', '', '', 50, NULL, '{"Futsal putra putri"}', 'Ikatan Pelajar Muhammadiyah', 'Senin, 18 Mei 2026 (08.00 - 10.00 WIB)', 'Laki-laki', 'Bapak Budi', 'Ibu Budi', 'Budi Santoso', '', '081234567891', '081234567890', '', 'MUSKA-2026-52063', 'Wiraswasta', 'Ibu Rumah Tangga', 'Ruang CBT Kampus 1 SMK Muhammadiyah Sekampung', 'SMP Negeri 1 Wonosobo', '2008-05-15', 'Wonosobo', 165, 'M (40-45 kg)', '', '2026-10-18 09:20:53.979', NULL, NULL, NULL, 'MENUNGGU', 'BELUM_BAYAR', NULL, NULL);


--
-- Data for Name: Dokumen; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Dokumen" (id, "pendaftaranId", "jenisDokumen", "fileUrl", "hasiltEkstraksi", status, "createdAt") VALUES ('85d84309-bef0-432a-9fbb-ef25634dfb4b', '21d5eac8-6276-4aea-a6c4-ed80687fb0d9', 'Text', '/uploads/ktp - MAHARDIKA_AKBAR_WIJAYA Mahasiswa.jpeg', '————

SE EE ——

NIK : $3710560203000P00V

Nama : MAHARDIKA AKBAR WIJAYA
E E', 'PENDING', '2026-10-16 17:03:40.995');
INSERT INTO public."Dokumen" (id, "pendaftaranId", "jenisDokumen", "fileUrl", "hasiltEkstraksi", status, "createdAt") VALUES ('3687280a-6fae-4a16-a331-832d4589ac27', '21d5eac8-6276-4aea-a6c4-ed80687fb0d9', 'Text', '/uploads/ktp - MAHARDIKA_AKBAR_WIJAYA Mahasiswa.jpeg', '————

SE EE ——

NIK : $3710560203000P00V

Nama : MAHARDIKA AKBAR WIJAYA
E E', 'PENDING', '2026-10-16 17:19:30.401');
INSERT INTO public."Dokumen" (id, "pendaftaranId", "jenisDokumen", "fileUrl", "hasiltEkstraksi", status, "createdAt") VALUES ('39e3f1a1-b91e-4784-bcaf-d8e6019aa877', '21d5eac8-6276-4aea-a6c4-ed80687fb0d9', 'Text', '/uploads/KTP-TEST.jpeg', 'PROVINSI DKI JAKARTA

JAKARTA BARAT

NIK 3171234567890123
Nama : MIRA SETIAWAN
Tempat/Tgi Lahir : JAKARTA, 18-02-1986
Jenis Kelamin : PEREMPUAN Gol. Darah : B
Alamat L. PASTI CEPAT A7/66

RTIRW 07/008

Kel/Desa : PEGSADUNGAN

Kecamatan : KALIDERES
Agama : ISLAM
Status Perkawinan : KAWIN
Pekerjaan PEGAWAI SWASTA
Kewarganegaraan : WNI JAKARTA BARAT

02-12-2012

Berlaku Hingga — : 22-02-2017

4—', 'PENDING', '2026-10-16 17:22:10.701');
INSERT INTO public."Dokumen" (id, "pendaftaranId", "jenisDokumen", "fileUrl", "hasiltEkstraksi", status, "createdAt") VALUES ('04bc12b8-ef7b-43a7-87fc-f1e5f09edf42', '21d5eac8-6276-4aea-a6c4-ed80687fb0d9', 'Text', '/uploads/KTP-TEST.jpeg', 'PROVINSI DKI JAKARTA

JAKARTA BARAT

NIK 3171234567890123
Nama : MIRA SETIAWAN
Tempat/Tgi Lahir : JAKARTA, 18-02-1986
Jenis Kelamin : PEREMPUAN Gol. Darah : B
Alamat L. PASTI CEPAT A7/66

RTIRW 07/008

Kel/Desa : PEGSADUNGAN

Kecamatan : KALIDERES
Agama : ISLAM
Status Perkawinan : KAWIN
Pekerjaan PEGAWAI SWASTA
Kewarganegaraan : WNI JAKARTA BARAT

02-12-2012

Berlaku Hingga — : 22-02-2017

4—', 'PENDING', '2026-10-16 17:34:27.36');
INSERT INTO public."Dokumen" (id, "pendaftaranId", "jenisDokumen", "fileUrl", "hasiltEkstraksi", status, "createdAt") VALUES ('56fcd434-7049-4ff3-8381-9db65f8d5f08', '21d5eac8-6276-4aea-a6c4-ed80687fb0d9', 'Text', '/uploads/KTP-TEST.jpeg', 'PROVINSI DKI JAKARTA

JAKARTA BARAT

NIK 3171234567890123
Nama : MIRA SETIAWAN
Tempat/Tgi Lahir : JAKARTA, 18-02-1986
Jenis Kelamin : PEREMPUAN Gol. Darah : B
Alamat L. PASTI CEPAT A7/66

RTIRW 07/008

Kel/Desa : PEGSADUNGAN

Kecamatan : KALIDERES
Agama : ISLAM
Status Perkawinan : KAWIN
Pekerjaan PEGAWAI SWASTA
Kewarganegaraan : WNI JAKARTA BARAT

02-12-2012

Berlaku Hingga — : 22-02-2017

4—', 'PENDING', '2026-10-16 17:36:29.578');
INSERT INTO public."Dokumen" (id, "pendaftaranId", "jenisDokumen", "fileUrl", "hasiltEkstraksi", status, "createdAt") VALUES ('7bc7a1f6-908d-42a2-a7ee-8ad16be5d28e', '21d5eac8-6276-4aea-a6c4-ed80687fb0d9', 'KTP', '/uploads/KTP-TEST.jpeg', 'PROVINSI DKI JAKARTA

JAKARTA BARAT

NIK 3171234567890123
Nama : MIRA SETIAWAN
Tempat/Tgi Lahir : JAKARTA, 18-02-1986
Jenis Kelamin : PEREMPUAN Gol. Darah : B
Alamat L. PASTI CEPAT A7/66

RTIRW 07/008

Kel/Desa : PEGSADUNGAN

Kecamatan : KALIDERES
Agama : ISLAM
Status Perkawinan : KAWIN
Pekerjaan PEGAWAI SWASTA
Kewarganegaraan : WNI JAKARTA BARAT

02-12-2012

Berlaku Hingga — : 22-02-2017

4—', 'VALID', '2026-10-16 17:42:02.039');
INSERT INTO public."Dokumen" (id, "pendaftaranId", "jenisDokumen", "fileUrl", "hasiltEkstraksi", status, "createdAt") VALUES ('45d00d2b-f15d-41af-9bd4-c69aca885505', '0b685a40-d65e-4500-adbb-175741bb086a', 'KTP', '/uploads/1792266175127-KTP-TEST.jpeg', 'PROVINSI DKI JAKARTA

JAKARTA BARAT

NIK 3171234567890123
Nama : MIRA SETIAWAN
Tempat/Tgi Lahir : JAKARTA, 18-02-1986
Jenis Kelamin : PEREMPUAN Gol. Darah : B
Alamat L. PASTI CEPAT A7/66

RTIRW 07/008

Kel/Desa : PEGSADUNGAN

Kecamatan : KALIDERES
Agama : ISLAM
Status Perkawinan : KAWIN
Pekerjaan PEGAWAI SWASTA
Kewarganegaraan : WNI JAKARTA BARAT

02-12-2012

Berlaku Hingga — : 22-02-2017

4—', 'INVALID', '2026-10-17 19:42:55.139');
INSERT INTO public."Dokumen" (id, "pendaftaranId", "jenisDokumen", "fileUrl", "hasiltEkstraksi", status, "createdAt") VALUES ('bbd29f8b-af91-4d2d-b2c0-f05c5a3d3b44', '0b685a40-d65e-4500-adbb-175741bb086a', 'KTP', '/uploads/1792285991797-ktp_-_MAHARDIKA_AKBAR_WIJAYA_Mahasiswa.jpeg', '', 'INVALID', '2026-10-18 01:13:11.822');
INSERT INTO public."Dokumen" (id, "pendaftaranId", "jenisDokumen", "fileUrl", "hasiltEkstraksi", status, "createdAt") VALUES ('56a67b45-506a-43a6-8992-4cadd620dadd', '0b685a40-d65e-4500-adbb-175741bb086a', 'KIA_KARTU_PELAJAR', '/uploads/1792525141163-images__16_.jpg', '{"text":"KARTU PELAJAR ..\r\nP SMP HARAPAN BANGSA\r\nJl. Mawar 92 Kec. Sawah Kab. Riau —————\r\n5 Nama _: Marisa Zulaika > |\r\nN “> NIS _: 001234567 eon NG\r\nSs TTL =: Riau, 20 Oktober 2003 =\r\n: KAMPUNG MAWAR : y\r\nfeds fai NIP. 133098000234874","parsed":{"nik":"-","nomor_kk":"-","nama":"MARISA ZULAIKA","tempat_lahir":"-","tanggal_lahir":"-","jenis_kelamin":"-","gol_darah":"-","alamat":"-","rt_rw":"-","kel_desa":"-","kecamatan":"-","agama":"-","status_perkawinan":"-","pekerjaan":"PELAJAR / MAHASISWA","kewarganegaraan":"WNI","berlaku_hingga":"SEUMUR HIDUP"},"detectedNik":"1234567890"}', 'INVALID', '2026-10-20 19:39:01.18');
INSERT INTO public."Dokumen" (id, "pendaftaranId", "jenisDokumen", "fileUrl", "hasiltEkstraksi", status, "createdAt") VALUES ('d2f222b1-32cc-4d31-92e8-117541f308b6', '0b685a40-d65e-4500-adbb-175741bb086a', 'PAS_FOTO', '/uploads/1792525865327-foto.jpeg', '{"text":"","parsed":{"nik":"-","nomor_kk":"-","nama":"-","tempat_lahir":"-","tanggal_lahir":"-","jenis_kelamin":"-","gol_darah":"-","alamat":"-","rt_rw":"-","kel_desa":"-","kecamatan":"-","agama":"-","status_perkawinan":"-","pekerjaan":"-","kewarganegaraan":"WNI","berlaku_hingga":"SEUMUR HIDUP"},"detectedNik":null}', 'PENDING', '2026-10-20 19:51:05.333');


--
-- Data for Name: Guru; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Guru" (id, nama, nip, "mataPelajaran", pendidikan, "fotoUrl", urutan, "isActive", "createdAt", "updatedAt") VALUES ('bb3ea5cf-b612-465c-a5ae-d45e606f2702', 'H. Suwandi, S.T., M.Kom.', '19780512 200501 1 008', 'Teknik Jaringan Komputer & Cloud Computing', 'S2 Magister Komputer', '/guru/guru-tkj.jpg', 1, true, '2026-10-18 11:00:12.759', '2026-10-18 11:00:12.759');
INSERT INTO public."Guru" (id, nama, nip, "mataPelajaran", pendidikan, "fotoUrl", urutan, "isActive", "createdAt", "updatedAt") VALUES ('9e7fa2ab-51f5-40d0-b896-7ef89e2d4111', 'Dedi Kusuma, S.Pd., Gr.', '19820315 200801 1 012', 'Teknik Sepeda Motor & Sistem Injeksi Otomotif', 'S1 Pendidikan Teknik Mesin Otomotif', '/guru/guru-tsm.jpg', 2, true, '2026-10-18 11:00:12.759', '2026-10-18 11:00:12.759');
INSERT INTO public."Guru" (id, nama, nip, "mataPelajaran", pendidikan, "fotoUrl", urutan, "isActive", "createdAt", "updatedAt") VALUES ('5cb9507c-b169-43bc-9846-4190ba9ebcbe', 'Nurul Hidayati, S.Sn.', '19860822 201001 2 015', 'Desain Komunikasi Visual & Motion Graphics', 'S1 Seni Rupa & Desain', '/guru/guru-dkv.jpg', 3, true, '2026-10-18 11:00:12.759', '2026-10-18 11:00:12.759');
INSERT INTO public."Guru" (id, nama, nip, "mataPelajaran", pendidikan, "fotoUrl", urutan, "isActive", "createdAt", "updatedAt") VALUES ('0ece6aec-b68c-4bfd-8b3f-9c596659d3c0', 'Ahmad Rifai, S.E.', '19841109 200901 1 007', 'Bisnis Digital, Digital Marketing & E-Commerce', 'S1 Ekonomi Bisnis Digital', '/guru/guru-bdk.jpg', 4, true, '2026-10-18 11:00:12.759', '2026-10-18 11:00:12.759');
INSERT INTO public."Guru" (id, nama, nip, "mataPelajaran", pendidikan, "fotoUrl", urutan, "isActive", "createdAt", "updatedAt") VALUES ('d335a9f7-dc4e-4f7d-83ef-bcba69e55632', 'Siti Aminah, S.Pd.', '19890117 201201 2 020', 'Tata Boga, Kuliner Nusantara & Pastry', 'S1 Pendidikan Tata Boga', '/guru/guru-kuliner.jpg', 5, true, '2026-10-18 11:00:12.759', '2026-10-18 11:00:12.759');
INSERT INTO public."Guru" (id, nama, nip, "mataPelajaran", pendidikan, "fotoUrl", urutan, "isActive", "createdAt", "updatedAt") VALUES ('51b6912b-b2ba-4aac-8397-2a3f3ccb68a0', 'Rina Anggraini, S.Pd.', '19910405 201501 2 018', 'Tata Rias Pengantin & Estetika Kecantikan', 'S1 Pendidikan Tata Rias & Kecantikan', '/guru/guru-kecantikan.jpg', 6, true, '2026-10-18 11:00:12.759', '2026-10-18 11:00:12.759');
INSERT INTO public."Guru" (id, nama, nip, "mataPelajaran", pendidikan, "fotoUrl", urutan, "isActive", "createdAt", "updatedAt") VALUES ('b9eedcc1-68fa-4729-8ac3-fecfb3614b0f', 'Budi Santoso, S.T.', '19810719 200601 1 011', 'Teknik Pemesinan Bubut, Frais & Pemrograman CNC', 'S1 Teknik Mesin Produksi', '/guru/guru-cnc.jpg', 7, true, '2026-10-18 11:00:12.759', '2026-10-18 11:00:12.759');
INSERT INTO public."Guru" (id, nama, nip, "mataPelajaran", pendidikan, "fotoUrl", urutan, "isActive", "createdAt", "updatedAt") VALUES ('454b18f2-64cd-47f0-bb31-657def824020', 'Eko Prasetyo, S.T.', '19831204 200701 1 014', 'Teknik Pengelasan SMAW, MIG/MAG & TIG Argon', 'S1 Teknik Metalurgi & Material', '/guru/guru-las.jpg', 8, true, '2026-10-18 11:00:12.759', '2026-10-18 11:00:12.759');


--
-- Data for Name: HeroSlider; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."HeroSlider" (id, "imageUrl", title, subtitle, "linkUrl", "isActive", urutan, "createdAt", "updatedAt", "badgeText", "ctaText") VALUES ('eb37c872-c8f3-40b8-bb49-d0d48ac81884', '/uploads/website/cms-1792325267445-164600596.jpg', 'Penerimaan Siswa Baru (SPMB) Tahun Ajaran 2026/2027', 'Daftar sekarang secara online dengan verifikasi AI OCR & Chatbot RAG terintegrasi.', '/register', true, 1, '2026-10-18 10:13:44.295', '2026-10-18 12:07:57.024', NULL, NULL);
INSERT INTO public."HeroSlider" (id, "imageUrl", title, subtitle, "linkUrl", "isActive", urutan, "createdAt", "updatedAt", "badgeText", "ctaText") VALUES ('6d14cbfe-5fe0-4673-9fb9-058eebee0a0b', '/uploads/website/cms-1792325362299-203844755.jpg', 'Pendidikan Vokasi Unggulan & Berstandar Industri', 'Kurikulum selaras dengan Dunia Usaha dan Dunia Industri serta sertifikasi kompetensi BNSP.', '/login', true, 2, '2026-10-18 10:13:44.295', '2026-10-18 12:09:24.071', NULL, NULL);
INSERT INTO public."HeroSlider" (id, "imageUrl", title, subtitle, "linkUrl", "isActive", urutan, "createdAt", "updatedAt", "badgeText", "ctaText") VALUES ('4c3f8a56-6c15-4630-bb12-23b5a5127367', '/uploads/website/cms-1792325547618-98485473.jpg', 'Fasilitas Bengkel Modern & Laboratorium CBT', 'Laboratorium komputer multimedia canggih, bengkel otomotif standar APM, dan studio DKV.', '/register', true, 3, '2026-10-18 10:13:44.295', '2026-10-18 12:12:29.617', NULL, NULL);


--
-- Data for Name: Jurusan; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Jurusan" (id, "namaJurusan", singkatan, "kuotaMaksimal", deskripsi, "createdAt", "updatedAt") VALUES ('3d8a52d4-bc85-4cf2-80c6-5e8652046c62', 'Teknik Jaringan Komputer dan Telekomunikasi', 'TKJ', 72, 'Konsentrasi Jaringan Komputer, Cloud, Server, & Telekomunikasi', '2026-10-18 09:17:26.493', '2026-10-18 09:20:53.932');
INSERT INTO public."Jurusan" (id, "namaJurusan", singkatan, "kuotaMaksimal", deskripsi, "createdAt", "updatedAt") VALUES ('4949c9d0-18a0-4197-b5be-53e7a7d6105a', 'Teknik Otomotif (Teknik Sepeda Motor)', 'TSM', 72, 'Perbengkelan, Injeksi, & Rancang Bangun Kendaraan Sepeda Motor', '2026-10-18 09:17:26.516', '2026-10-18 09:20:53.937');
INSERT INTO public."Jurusan" (id, "namaJurusan", singkatan, "kuotaMaksimal", deskripsi, "createdAt", "updatedAt") VALUES ('7990aed1-ca47-431e-8b9d-8f9473c9e244', 'Desain Komunikasi Visual', 'DKV', 72, 'Desain Grafis, UI/UX, Animasi, Fotografi, & Periklanan Kreatif', '2026-10-18 09:17:26.523', '2026-10-18 09:20:53.939');
INSERT INTO public."Jurusan" (id, "namaJurusan", singkatan, "kuotaMaksimal", deskripsi, "createdAt", "updatedAt") VALUES ('bd3a6c16-4a39-4fda-9651-9f8b006636db', 'Kulineri (Tata Boga)', 'BOGA', 72, 'Pengolahan Makanan Tradisional & Kontinental, Pastry, & Restoran', '2026-10-18 09:17:26.533', '2026-10-18 09:20:53.943');
INSERT INTO public."Jurusan" (id, "namaJurusan", singkatan, "kuotaMaksimal", deskripsi, "createdAt", "updatedAt") VALUES ('1c2977bf-5566-4b52-a7eb-7907c78a64ef', 'Kecantikan dan Tata Rias', 'TATA RIAS', 72, 'Perawatan Kulit, Tata Rias Pengantin, & Manajemen Beauty Spa', '2026-10-18 09:17:26.539', '2026-10-18 09:20:53.945');
INSERT INTO public."Jurusan" (id, "namaJurusan", singkatan, "kuotaMaksimal", deskripsi, "createdAt", "updatedAt") VALUES ('4e9c8cd7-27c5-469d-af21-841354ae9ef3', 'Teknik Pemesinan (CNC)', 'CNC', 72, 'Operator Mesin Bubut, Frais, Presisi Tinggi, & Desain CAD/CAM', '2026-10-18 09:17:26.546', '2026-10-18 09:20:53.946');
INSERT INTO public."Jurusan" (id, "namaJurusan", singkatan, "kuotaMaksimal", deskripsi, "createdAt", "updatedAt") VALUES ('ba78a186-9059-4650-9b5f-f663126426f8', 'Teknik Pengelasan (Welding)', 'LAS', 72, 'Pengelasan SMAW, GMAW, Argon, Konstruksi Baja, & Sertifikasi Industri', '2026-10-18 09:17:26.559', '2026-10-18 09:20:53.947');
INSERT INTO public."Jurusan" (id, "namaJurusan", singkatan, "kuotaMaksimal", deskripsi, "createdAt", "updatedAt") VALUES ('591f601c-61cf-4277-a5e3-b00dc1470f19', 'Bisnis Digital dan Kreatif', 'BDK', 70, 'E-Commerce, Pemasaran Digital, FinTech, & Kewirausahaan', '2026-10-18 09:17:26.528', '2026-10-20 19:30:06.146');


--
-- Data for Name: KnowledgeBase; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."KnowledgeBase" (id, judul, kategori, "fileUrl", deskripsi, embedded, "createdAt") VALUES ('a728268f-23fe-4978-a425-d2ccbe74d450', 'test', 'Brosur', '/uploads/kb/kb-1792388207084-759386954.pdf', 'dokumen testing', true, '2026-10-19 05:36:47.113');


--
-- Data for Name: MitraIndustri; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."MitraIndustri" (id, "namaPerusahaan", "logoUrl", "bidangKerjasama", urutan, "createdAt", "updatedAt") VALUES ('efa47a8d-b557-4fdf-b667-b0fa2b7ca5e8', 'Telkom Indonesia', '/uploads/website/cms-1792325940366-855293085.jpg', 'Jaringan Fiber Optik & Internet', 2, '2026-10-18 10:13:44.354', '2026-10-18 12:19:01.434');
INSERT INTO public."MitraIndustri" (id, "namaPerusahaan", "logoUrl", "bidangKerjasama", urutan, "createdAt", "updatedAt") VALUES ('8eb7d49f-0174-4dc2-af26-0518676fe8ef', 'PT Astra Honda Motor (AHM)', '/uploads/website/cms-1792325966874-420464954.jpg', 'Teknik Sepeda Motor', 1, '2026-10-18 10:13:44.354', '2026-10-18 12:19:27.971');
INSERT INTO public."MitraIndustri" (id, "namaPerusahaan", "logoUrl", "bidangKerjasama", urutan, "createdAt", "updatedAt") VALUES ('68cc6cb8-ace7-4773-9d88-43ae1c1533b6', 'PT United Tractors Tbk', '/uploads/website/cms-1792326006615-588584561.png', 'Alat Berat & Pemesinan', 3, '2026-10-18 10:13:44.354', '2026-10-18 12:20:07.794');
INSERT INTO public."MitraIndustri" (id, "namaPerusahaan", "logoUrl", "bidangKerjasama", urutan, "createdAt", "updatedAt") VALUES ('07ce737c-a3f2-4ae3-9e9a-3b6ffbef6f4e', 'Axioo Class Program', '/uploads/website/cms-1792326057783-354421428.png', 'Perakitan & Service Laptop/PC', 4, '2026-10-18 10:13:44.354', '2026-10-18 12:20:58.681');
INSERT INTO public."MitraIndustri" (id, "namaPerusahaan", "logoUrl", "bidangKerjasama", urutan, "createdAt", "updatedAt") VALUES ('3a86b294-e7a4-472e-af92-6809e08e43f6', 'Hotel Horison Lampung', '/uploads/website/cms-1792326083814-84199897.jpg', 'Kulineri & Perhotelan', 5, '2026-10-18 10:13:44.354', '2026-10-18 12:21:24.981');
INSERT INTO public."MitraIndustri" (id, "namaPerusahaan", "logoUrl", "bidangKerjasama", urutan, "createdAt", "updatedAt") VALUES ('03868da9-2cf1-4b1f-8ce2-de738eb6a6a6', 'PT Komatsu Indonesia', '/uploads/website/cms-1792326109581-122108616.png', 'Teknik Pengelasan & Fabrikasi', 6, '2026-10-18 10:13:44.354', '2026-10-18 12:21:50.604');


--
-- Data for Name: ProfilSekolah; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."ProfilSekolah" (id, "sambutanKepsek", "fotoKepsek", "namaKepsek", motto, "videoProfilUrl", "sejarahSingkat", visi, misi, "alamatLengkap", "emailResmi", "teleponResmi", "whatsappResmi", "mapsEmbedUrl", "createdAt", "updatedAt") VALUES ('default', 'Assalamu’alaikum Warahmatullahi Wabarakatuh.

Selamat datang di portal resmi SMK Muhammadiyah Sekampung. Sebagai lembaga pendidikan vokasi unggulan di Kabupaten Lampung Timur, kami berkomitmen mencetak generasi muda yang berakhlak mulia, kompeten, berjiwa wirausaha, dan siap bersaing di kancah global. Didukung oleh teknologi informasi terdepan, kurikulum berbasis industri, dan sertifikasi keahlian, SMK Muhammadiyah Sekampung senantiasa berikhtiar memberikan layanan pendidikan terbaik demi masa depan gemilang putra-putri bangsa.

Wassalamu’alaikum Warahmatullahi Wabarakatuh.', '/uploads/website/cms-1792325023333-640255206.jpg', 'Hendra Agus Wijaya, S.E', 'Sukses · Jaya · Bermanfaat · Inspiratif', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'SMK Muhammadiyah Sekampung didirikan pada tahun 1998 di bawah naungan Pimpinan Cabang Muhammadiyah Sekampung untuk menjawab kebutuhan tenaga kerja terampil dan berakhlak Islami di Lampung.', 'Menjadi Sekolah Menengah Kejuruan yang Unggul, Berkarakter Islami, dan Berdaya Saing Global.', '1. Mengembangkan pendidikan vokasi berbasis teknologi dan standar industri modern.
2. Menanamkan nilai-nilai Al-Islam dan Kemuhammadiyahan dalam setiap aspek pembelajaran.
3. Menjalin kemitraan strategis dengan Dunia Usaha dan Dunia Industri (DUDI).
4. Membekali lulusan dengan sertifikasi kompetensi nasional dan jiwa kewirausahaan.', 'Jl. Raya Sekampung No. 45, Sekampung, Kabupaten Lampung Timur, Lampung 34382', 'smkmuhsekampung@gmail.com', '(0725) 7851234', '08819884140', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.109012345678!2d105.4414!3d-5.1973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMTEnNTAuMyJTIDEwNcKwMjYnMjkuMCJF!5e0!3m2!1sid!2sid!4v1600000000000!5m2!1sid!2sid', '2026-10-18 10:13:44.268', '2026-10-18 12:04:42.625');


--
-- Data for Name: ProfilWKS; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."ProfilWKS" (id, nama, jabatan, "fotoUrl", urutan, "createdAt", "updatedAt") VALUES ('8c81a1b8-b80a-45a8-8bc4-99e08836a2b4', 'Ir. Siti Rahmawati, M.T.', 'WKS 3 - Bidang Sarana Prasarana & Humas', '/uploads/website/cms-1792325833802-684724335.jpg', 3, '2026-10-18 10:13:44.311', '2026-10-18 12:17:15.144');
INSERT INTO public."ProfilWKS" (id, nama, jabatan, "fotoUrl", urutan, "createdAt", "updatedAt") VALUES ('6efd85a6-9522-40b7-9466-1ed761c93bc7', 'Bambang Sudarmono, S.Kom.', 'WKS 2 - Bidang Kesiswaan & Kedisiplinan', '/uploads/website/cms-1792325871675-113133675.jpg', 2, '2026-10-18 10:13:44.311', '2026-10-18 12:17:53.204');


--
-- Data for Name: ProgramKeahlian; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."ProgramKeahlian" (id, nama, singkatan, deskripsi, "iconUrl", kuota, urutan, "createdAt", "updatedAt", "fotoUrls") VALUES ('cfa87c53-e367-4f49-b312-26d413a1192c', 'Teknik Pengelasan (Welding)', 'LAS', 'Teknik pengelasan SMAW, GMAW/MIG, GTAW/Argon, inspeksi NDT visual las, dan konstruksi baja bersertifikasi industri.', '/uploads/website/cms-1792324714815-411926046.png', 72, 8, '2026-10-18 10:13:44.33', '2026-10-19 14:54:01.082', '{/uploads/website/cms-1792421639996-815300557.jpg}');
INSERT INTO public."ProgramKeahlian" (id, nama, singkatan, deskripsi, "iconUrl", kuota, urutan, "createdAt", "updatedAt", "fotoUrls") VALUES ('5ca235f9-c496-4d32-935f-4f6ea2cbb303', 'Teknik Jaringan Komputer dan Telekomunikasi', 'TJKT / TKJ', 'Mempelajari administrasi server, fiber optic, cloud computing, cybersecurity, dan infrastruktur jaringan modern.', '/uploads/website/cms-1792324623068-502233629.PNG', 72, 1, '2026-10-18 10:13:44.33', '2026-10-19 11:09:24.889', '{/uploads/website/cms-1792408163387-154260271.jpg}');
INSERT INTO public."ProgramKeahlian" (id, nama, singkatan, deskripsi, "iconUrl", kuota, urutan, "createdAt", "updatedAt", "fotoUrls") VALUES ('5683f883-6e47-4bc0-815b-55fb989db45d', 'Teknik Otomotif (Teknik Sepeda Motor)', 'TBSM / TSM', 'Penguasaan teknologi sistem injeksi EFI, transmisi otomatis, kelistrikan bodi, dan manajemen bengkel resmi modern.', '/uploads/website/cms-1792324639224-398256324.png', 72, 2, '2026-10-18 10:13:44.33', '2026-10-19 14:45:29.621', '{/uploads/website/cms-1792421128374-227647428.jpg}');
INSERT INTO public."ProgramKeahlian" (id, nama, singkatan, deskripsi, "iconUrl", kuota, urutan, "createdAt", "updatedAt", "fotoUrls") VALUES ('d6d93d38-b7d3-4abf-a773-71c4b5c22035', 'Desain Komunikasi Visual', 'DKV', 'Desain grafis periklanan, videografi & sinematografi, animasi 2D/3D, fotografi profesional, serta UI/UX interface.', '/uploads/website/cms-1792324651702-939589034.png', 72, 3, '2026-10-18 10:13:44.33', '2026-10-19 14:45:59.759', '{/uploads/website/cms-1792421158703-176036261.jpg}');
INSERT INTO public."ProgramKeahlian" (id, nama, singkatan, deskripsi, "iconUrl", kuota, urutan, "createdAt", "updatedAt", "fotoUrls") VALUES ('24371fab-aaef-4e69-ab15-f071969de1db', 'Bisnis Digital dan Kreatif', 'BDK', 'Digital marketing, e-commerce marketplace, optimasi SEO/SEM, content creation, dan manajemen operasional bisnis online.', '/jurusan/bdk.svg', 72, 4, '2026-10-18 10:13:44.33', '2026-10-19 14:46:33.717', '{/uploads/website/cms-1792421192506-669919578.jpg}');
INSERT INTO public."ProgramKeahlian" (id, nama, singkatan, deskripsi, "iconUrl", kuota, urutan, "createdAt", "updatedAt", "fotoUrls") VALUES ('7d822156-1ad1-46b1-8a63-1c523bbccf1a', 'Kulineri (Tata Boga)', 'BOGA', 'Pengolahan hidangan nusantara & kontinental, bakery pastry, tata hidang restoran bintang, dan food hygiene HACCP.', '/uploads/website/cms-1792324674575-221656880.png', 72, 5, '2026-10-18 10:13:44.33', '2026-10-19 14:48:17.076', '{/uploads/website/cms-1792421259622-426659813.jpg,/uploads/website/cms-1792421295394-694794717.jpg}');
INSERT INTO public."ProgramKeahlian" (id, nama, singkatan, deskripsi, "iconUrl", kuota, urutan, "createdAt", "updatedAt", "fotoUrls") VALUES ('12ad614a-6426-47f2-811f-bd608a836e7c', 'Kecantikan dan Tata Rias', 'TATA RIAS', 'Perawatan kulit & rambut modern, tata rias pengantin adat/internasional, seni nail art, dan salon & spa management.', '/uploads/website/cms-1792324686790-447370497.png', 72, 6, '2026-10-18 10:13:44.33', '2026-10-19 14:51:51.036', '{/uploads/website/cms-1792421509777-253761609.jpg}');
INSERT INTO public."ProgramKeahlian" (id, nama, singkatan, deskripsi, "iconUrl", kuota, urutan, "createdAt", "updatedAt", "fotoUrls") VALUES ('bb04c639-d1bd-447d-92c0-fccf10cff337', 'Teknik Pemesinan (CNC)', 'CNC', 'Pengoperasian mesin bubut presisi tinggi, frais CNC, desain CAD/CAM SolidWorks, dan fabrikasi komponen presisi.', '/uploads/website/cms-1792324700006-232326203.png', 72, 7, '2026-10-18 10:13:44.33', '2026-10-19 14:53:27.195', '{/uploads/website/cms-1792421606176-341555792.jpg}');


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."SystemSetting" (key, value, "updatedAt") VALUES ('pengumumanDibuka', 'false', '2026-10-20 19:29:27.811');
INSERT INTO public."SystemSetting" (key, value, "updatedAt") VALUES ('bukaPendaftaran', 'true', '2026-10-20 19:29:27.826');
INSERT INTO public."SystemSetting" (key, value, "updatedAt") VALUES ('tanggalPengumuman', '2026-10-18T01:21:00.000Z', '2026-10-20 19:29:27.843');
INSERT INTO public."SystemSetting" (key, value, "updatedAt") VALUES ('tahunAjaran', '2026/2027', '2026-10-20 19:29:27.847');


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('7bf61e13-1bf7-4222-89a0-42ffa93bdec4', '6aa7fc344c7064768bc0da8715f6c4a84da346a9aadfbcdd71fa6d08a352275b', '2026-10-16 22:43:23.83298+07', '20261016154323_init_spmb', NULL, NULL, '2026-10-16 22:43:23.809026+07', 1);


--
-- PostgreSQL database dump complete
--

\unrestrict iSimnaWqPG1nJwGRdXi4AUeBLePh7ULbTJcFM18wHozHWtHWRmjZgqYpx7PwJzY


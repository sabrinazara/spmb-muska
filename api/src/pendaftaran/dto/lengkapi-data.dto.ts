export class LengkapiDataDto {
  // Data Diri
  namaLengkap?: string;
  jenisKelamin?: string;
  agama?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  alamat?: string;
  noHpWa?: string;
  sekolahAsal?: string;
  nisn?: string;
  nik?: string;

  // Data Fisik
  beratBadan?: number;
  tinggiBadan?: number;

  // Data Orang Tua
  namaAyah?: string;
  pekerjaanAyah?: string;
  namaIbu?: string;
  namaIbuKandung?: string;
  pekerjaanIbu?: string;
  alamatOrtu?: string;
  noHpOrtu?: string;

  // Data Wali Murid
  namaWali?: string;
  alamatWali?: string;
  noHpWali?: string;

  // Pilihan Jurusan
  jurusan?: string;

  // Ukuran Baju
  ukuranBaju?: string;
  ukuranBajuLainnya?: string;

  // Intra & Ekstrakurikuler
  intrakurikuler?: string;
  ekstrakurikuler?: string[];
}

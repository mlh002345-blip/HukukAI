/**
 * Faz 3 yer tutucusu (Bölüm 14 — "Virüs taramasından geçmeyen dosya
 * reddedilir"). Gerçek bir antivirüs motoru (ör. ClamAV) entegrasyonu
 * ileriki bir fazda bu modülün yerini alacaktır; bugün yalnızca bilinen
 * test imzalarını (EICAR) reddeder.
 */
const EICAR_TEST_FILE_SHA256 =
  "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0";

const BLOCKED_CHECKSUMS = new Set([EICAR_TEST_FILE_SHA256]);

export interface VirusScanResult {
  clean: boolean;
  scannerVersion: string;
}

export function scanChecksum(checksum: string): VirusScanResult {
  return {
    clean: !BLOCKED_CHECKSUMS.has(checksum.toLowerCase()),
    scannerVersion: "placeholder-v1",
  };
}

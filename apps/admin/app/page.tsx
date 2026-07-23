/**
 * Yönetim Paneli — Bölüm 5.5 ve Bölüm 10.
 * Kullanıcı yönetimi, kural seti yönetimi, AI maliyet takibi, audit log
 * gibi ekranlar Faz 9 kapsamında bu iskelet üzerine inşa edilecektir.
 * Bu sayfa, monorepo yapısını tamamlamak için bilinçli olarak minimaldir.
 */
export default function AdminHomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#101828" }}>
        HukukAI Yönetim Paneli
      </h1>
      <p style={{ fontSize: 14, color: "#667085", maxWidth: 480 }}>
        Bu panel Faz 9 kapsamında geliştirilecektir: kullanıcı yönetimi,
        araç/kural seti yönetimi, resmi tatil yönetimi, AI maliyet takibi ve
        audit log görüntüleme. Şu an yalnızca monorepo iskeleti mevcuttur.
      </p>
    </main>
  );
}

import GhostButton from '@/components/GhostButton';
import HazeCard from '@/components/HazeCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-black-void text-whiteout p-8 sm:p-12 font-control">
      <nav className="max-w-[1150px] mx-auto flex justify-between items-center mb-24">
        <h1 className="text-heading font-medium tracking-tight">
          Your<span className="text-twilight-blue italic font-control-cursive">Drive</span>
        </h1>
        <GhostButton>Login via Telegram</GhostButton>
      </nav>

      <main className="max-w-[1150px] mx-auto flex flex-col gap-24">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h2 className="text-[12vw] sm:text-[100px] md:text-[180px] font-black leading-[0.85] tracking-tighter uppercase mb-8 text-whiteout">
            STORE IT ONCE.
          </h2>
          <p className="text-subheading text-whiteout/80 max-w-2xl mx-auto font-medium">
            Penyimpanan cloud aman tak terbatas menggunakan Telegram Saved Messages. 
            Tanpa server perantara, 100% privasi di tangan Anda.
          </p>
        </section>

        {/* Features / Mock Dashboard */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HazeCard>
            <h3 className="text-xl font-bold text-ink mb-3">Privasi Penuh</h3>
            <p className="text-ink/70">
              Sesi dan file Anda tidak pernah menyentuh server kami. Semuanya berjalan langsung dari browser ke Telegram.
            </p>
          </HazeCard>
          
          <HazeCard>
            <h3 className="text-xl font-bold text-ink mb-3">Sistem Folder</h3>
            <p className="text-ink/70">
              Merapikan "Pesan Tersimpan" yang berantakan menjadi struktur folder virtual layaknya Google Drive.
            </p>
          </HazeCard>

          <HazeCard>
            <h3 className="text-xl font-bold text-ink mb-3">Tanpa Batas</h3>
            <p className="text-ink/70">
              Nikmati penyimpanan gratis dari Telegram untuk keluarga dan teman terdekat Anda.
            </p>
          </HazeCard>
        </section>
      </main>
    </div>
  );
}

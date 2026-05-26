import Image from "next/image";

export default function PendientePage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-4 text-center gap-6">
      <Image src="/logo.ico" alt="Elbio Fernández Universitario" width={64} height={64} unoptimized className="object-contain" />
      <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-3xl">⏳</div>
      <div>
        <h1 className="font-display font-black text-[#1A2F5E] text-2xl uppercase tracking-wide mb-2">
          Pago pendiente
        </h1>
        <p className="font-body text-[#6B7A99] text-sm max-w-xs leading-relaxed">
          Tu pago está siendo procesado. Te avisaremos cuando se confirme. Podés cerrar esta página.
        </p>
      </div>
      <a href="/" className="inline-block border border-[#1A2F5E] text-[#1A2F5E] font-display font-black text-xs uppercase tracking-widest px-8 py-3 hover:bg-[#1A2F5E] hover:text-white transition-colors">
        Volver al inicio
      </a>
    </div>
  );
}

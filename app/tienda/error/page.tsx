import Image from "next/image";

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-4 text-center gap-6">
      <Image src="/logo.ico" alt="Elbio Fernández Universitario" width={64} height={64} unoptimized className="object-contain" />
      <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center text-3xl">✕</div>
      <div>
        <h1 className="font-display font-black text-[#1A2F5E] text-2xl uppercase tracking-wide mb-2">
          Pago rechazado
        </h1>
        <p className="font-body text-[#6B7A99] text-sm max-w-xs leading-relaxed">
          El pago no pudo procesarse. Por favor intentá de nuevo o contactanos por WhatsApp.
        </p>
      </div>
      <div className="flex gap-3">
        <a href="/#tienda" className="inline-block bg-[#1A2F5E] text-white font-display font-black text-xs uppercase tracking-widest px-6 py-3 hover:bg-[#152549] transition-colors">
          Reintentar
        </a>
        <a href="https://wa.me/59899019892" className="inline-block border border-[#1A2F5E] text-[#1A2F5E] font-display font-black text-xs uppercase tracking-widest px-6 py-3 hover:bg-[#1A2F5E] hover:text-white transition-colors">
          WhatsApp
        </a>
      </div>
    </div>
  );
}

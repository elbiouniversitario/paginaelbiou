export async function sendWhatsApp(message: string): Promise<void> {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const phone  = process.env.WPP_ADMIN_NUMBER;
  if (!apiKey || !phone) return;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
  await fetch(url).catch(() => {});
}

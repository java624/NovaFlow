interface CheckoutOverlayProps {
  visible: boolean;
}

export default function CheckoutOverlay({ visible }: CheckoutOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-medium">Перенаправлення на безпечну оплату…</p>
      </div>
    </div>
  );
}

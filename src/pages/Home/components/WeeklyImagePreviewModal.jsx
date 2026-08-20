export default function WeeklyImagePreviewModal({ imageUrl, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <img
        src={imageUrl}
        alt=""
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

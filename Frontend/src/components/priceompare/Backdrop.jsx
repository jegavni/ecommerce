export default function Backdrop({ onClose }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
    />
  );
}
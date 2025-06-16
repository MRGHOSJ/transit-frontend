export default function SettingsButton({ onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
    >
      ⚙️
    </button>
  );
}

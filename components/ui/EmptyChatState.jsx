// src/components/ui/EmptyChatState.jsx
export default function EmptyChatState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <i className="pi pi-lock text-9xl text-gray-300 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Your messages are end-to-end encrypted
        </h2>
        <p className="text-gray-600 text-lg">
          Start chatting from any device. Only you can read your messages.
        </p>
        <div className="mt-8 flex justify-center gap-12 text-gray-500">
          <div className="text-center">
            <i className="pi pi-mobile text-5xl text-blue-600" />
            <p className="mt-2 font-medium">Mobile</p>
          </div>
          <div className="text-center">
            <i className="pi pi-desktop text-5xl text-green-600" />
            <p className="mt-2 font-medium">Web</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { ChatContainer } from "@/components/ai-chat/chat-container";

export default function NewTrackerPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-xl font-bold">Create New Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Tell the AI what you want to track and it will generate the perfect schema
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatContainer />
      </div>
    </div>
  );
}

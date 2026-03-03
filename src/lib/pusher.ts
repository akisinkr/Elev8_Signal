import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance (lazy — only created when called)
let _pusherServer: Pusher | null = null;

export function getPusherServer() {
  if (!_pusherServer) {
    _pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return _pusherServer;
}

// Client-side Pusher instance (lazy)
let _pusherClient: PusherClient | null = null;

export function getPusherClient() {
  if (!_pusherClient) {
    _pusherClient = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );
  }
  return _pusherClient;
}

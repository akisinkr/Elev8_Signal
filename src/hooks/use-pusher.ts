"use client";

import { useEffect } from "react";
import { getPusherClient } from "@/lib/pusher";

export function usePusher(
  channelName: string,
  eventName: string,
  callback: (data: unknown) => void
) {
  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe(channelName);
    channel.bind(eventName, callback);

    return () => {
      channel.unbind(eventName, callback);
      client.unsubscribe(channelName);
    };
  }, [channelName, eventName, callback]);
}

"use client";

import { useUser } from "@clerk/nextjs";
import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MediaRoomProps {
    serverId: string;
    chatId: string;
    video: boolean;
    audio: boolean;
}

export function MediaRoom({ serverId, chatId, video, audio }: MediaRoomProps) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [token, setToken] = useState("");

    // 🔥 DEBUG: перевіряємо env у проді
    console.log("LIVEKIT URL:", process.env.NEXT_PUBLIC_LIVEKIT_URL);

    useEffect(() => {
        const name =
            user?.fullName ||
            user?.firstName ||
            user?.lastName ||
            user?.primaryEmailAddress?.emailAddress.split("@")[0];

        if (!name) return;

        (async () => {
            try {
                const resp = await fetch(
                    `/api/get-participant-token?room=${chatId}&username=${name}`
                );

                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [
        chatId,
        user?.firstName,
        user?.lastName,
        user?.fullName,
        user?.primaryEmailAddress?.emailAddress
    ]);

    if (token === "" || !isLoaded) {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                    Loading...
                </p>
            </div>
        );
    }

    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!livekitUrl) {
        return (
            <div className="flex flex-col flex-1 justify-center items-center text-red-500">
                Missing LiveKit URL
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={video}
            audio={audio}
            token={token}
            serverUrl={livekitUrl}
            connect={true}
            onDisconnected={() => {
                router.push(`/servers/${serverId}`);
            }}
            data-lk-theme="default"
            className="flex flex-col flex-1 h-[80%]"
        >
            <MyVideoConference />
            <RoomAudioRenderer />
            <ControlBar />
        </LiveKitRoom>
    );
}

function MyVideoConference() {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false }
        ],
        { onlySubscribed: false }
    );

    return (
        <GridLayout tracks={tracks}>
            <ParticipantTile />
        </GridLayout>
    );
}
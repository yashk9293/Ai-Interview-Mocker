"use client";
import { Video } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { SecondaryButton } from "@/components/app/ui";

// The webcam library is only downloaded once the user turns the camera on.
const Webcam = dynamic(() => import("react-webcam"), { ssr: false });

export default function WebcamPreview() {
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-md bg-raised">
      {webCamEnabled ? (
        <Webcam
          onUserMediaError={() => setWebCamEnabled(false)}
          mirrored={true}
          audio={false}
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          <Video className="size-6 text-faint" strokeWidth={1.5} aria-hidden="true" />
          <SecondaryButton type="button" onClick={() => setWebCamEnabled(true)} className="bg-surface hover:bg-bg">
            Turn on camera
          </SecondaryButton>
        </>
      )}
    </div>
  );
}

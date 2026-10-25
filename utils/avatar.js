import "server-only";

// Whether the live interview can show a Simli avatar (see startAvatarSession).
export function avatarConfigured() {
  return Boolean(process.env.SIMLI_API_KEY && process.env.SIMLI_FACE_ID);
}

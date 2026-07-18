export const UPLOAD_LIMITS = {
  image: { maxMB: 5, formats: "JPG, PNG, WEBP o GIF" },
  video: { maxMB: 50, formats: "MP4, WEBM o MOV" },
} as const;

export type UploadKind = keyof typeof UPLOAD_LIMITS;

export function maxBytesFor(kind: UploadKind): number {
  return UPLOAD_LIMITS[kind].maxMB * 1024 * 1024;
}

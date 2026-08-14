// Shared file-upload constraints for chat/message attachments — used by both
// the student-facing chat upload route and the instructor-facing messages
// upload route, so the accepted types/size stay identical everywhere.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_UPLOAD_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export const ALLOWED_UPLOAD_TYPES_ACCEPT = ALLOWED_UPLOAD_TYPES.join(",");

export const UPLOAD_TYPE_ERROR = "Unsupported file type. PNG, JPEG, WebP, GIF, or PDF only.";

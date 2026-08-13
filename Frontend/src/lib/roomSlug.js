const RESERVED = new Set(["health", "api"])

export function slugifyRoomName(input) {
  return input.trim().toLowerCase().replace(/\s+/g, "-")
}

export function validateRoomName(input) {
  const slug = slugifyRoomName(input)

  if (!slug || slug.length > 50) {
    return { valid: false, error: "Room name must be 1-50 characters." }
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: "Use only letters, numbers, and hyphens." }
  }

  if (RESERVED.has(slug)) {
    return { valid: false, error: "That room name is reserved." }
  }

  return { valid: true, slug }
}

export const getAvatarColor = (id: string, name?: string) => {
  const input = name ?? id;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash * 137) % 360;
  return `hsl(${h}, 65%, 45%)`;
};

export const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 1).toUpperCase();
};

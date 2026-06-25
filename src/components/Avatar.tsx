type AvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
};

export default function Avatar({ name, avatarUrl, size = 24 }: AvatarProps) {
  const style = { width: size, height: size };

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        style={style}
        className="rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <span
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-semibold"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

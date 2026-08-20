import { Box, Typography } from "@mui/material";

const variantStyles = {
  card: { width: "100%", objectFit: "cover" },
  detail: { width: "min(100%, 360px)", objectFit: "contain" },
  admin: { width: 48, objectFit: "cover" },
  adminDetail: { width: "min(100%, 260px)", objectFit: "contain" },
};

export default function BookCoverImage({
  src,
  alt,
  fallback = "No cover image",
  variant = "card",
  loading = "lazy",
  children,
  sx,
}) {
  const presentation = variantStyles[variant] || variantStyles.card;
  return (
    <Box sx={{ position: "relative", overflow: "hidden", flexShrink: 0, aspectRatio: "2 / 3", bgcolor: "action.hover", borderRadius: variant === "card" ? 0 : 2, ...presentation, ...sx }}>
      {src ? (
        <Box component="img" src={src} alt={alt || fallback} loading={loading} fetchPriority={loading === "eager" ? "high" : "auto"} decoding="async" sx={{ display: "block", width: "100%", height: "100%", objectFit: presentation.objectFit, objectPosition: "center" }} />
      ) : (
        <Box sx={{ width: "100%", height: "100%", display: "grid", placeItems: "center", p: 2, textAlign: "center" }}><Typography variant="body2" color="text.secondary">{fallback}</Typography></Box>
      )}
      {children}
    </Box>
  );
}

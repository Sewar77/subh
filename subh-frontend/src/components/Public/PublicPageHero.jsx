import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useId } from "react";

export default function PublicPageHero({
  title,
  eyebrow,
  description,
  icon,
  count,
  countLabel,
  actions,
  variant = "listing",
  children,
}) {
  const titleId = useId();
  const compact = variant === "detail";

  return (
    <Paper
      component="section"
      aria-labelledby={titleId}
      sx={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        p: {
          xs: 2.25,
          sm: compact ? 2.75 : 3,
          md: compact ? 3 : 3.5,
        },
        borderRadius: { xs: 2.5, md: 3.5 },
        borderColor: "rgba(101, 70, 163, 0.14)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,.97), rgba(249,247,253,.94))",
        "&::before": {
          content: '""',
          position: "absolute",
          zIndex: -1,
          width: { xs: 190, md: 270 },
          height: { xs: 190, md: 270 },
          borderRadius: "50%",
          insetBlockStart: { xs: -130, md: -210 },
          insetInlineEnd: { xs: -90, md: -120 },
          background:
            "radial-gradient(circle, rgba(101,70,163,.18), rgba(192,82,169,.08) 45%, transparent 72%)",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          zIndex: -1,
          width: { xs: 180, md: 260 },
          height: { xs: 180, md: 260 },
          borderRadius: "50%",
          insetBlockEnd: { xs: -130, md: -180 },
          insetInlineStart: { xs: -100, md: -120 },
          background:
            "radial-gradient(circle, rgba(85,201,181,.18), rgba(101,191,210,.07) 48%, transparent 72%)",
          pointerEvents: "none",
        },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 2, md: 3 }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 1.75, sm: 2.25 }}
          alignItems="flex-start"
          sx={{ minWidth: 0, maxWidth: 780 }}
        >
          {icon && (
            <Box
              aria-hidden="true"
              sx={{
                flex: "0 0 auto",
                width: { xs: 42, sm: 48 },
                height: { xs: 42, sm: 48 },
                display: "grid",
                placeItems: "center",
                borderRadius: 3,
                color: "primary.main",
                bgcolor: "rgba(101,70,163,.09)",
                border: "1px solid rgba(101,70,163,.12)",
                "& svg": { fontSize: { xs: 23, sm: 26 } },
              }}
            >
              {icon}
            </Box>
          )}

          <Box sx={{ minWidth: 0 }}>
            {eyebrow && (
              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  color: "secondary.dark",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  lineHeight: 1.4,
                }}
              >
                {eyebrow}
              </Typography>
            )}
            <Typography
              id={titleId}
              component="h1"
              variant={compact ? "h2" : "h1"}
              sx={{
                mt: eyebrow ? 0.5 : 0,
                maxWidth: 760,
                fontSize: compact
                  ? { xs: "1.75rem", sm: "2.05rem", md: "2.35rem" }
                  : { xs: "1.9rem", sm: "2.25rem", md: "2.6rem" },
                lineHeight: 1.16,
                overflowWrap: "anywhere",
              }}
            >
              {title}
            </Typography>
            {description && (
              <Typography
                color="text.secondary"
                sx={{ mt: 0.9, maxWidth: 680, lineHeight: 1.65 }}
              >
                {description}
              </Typography>
            )}
            {children}
          </Box>
        </Stack>

        {(count !== undefined || actions) && (
          <Stack
            spacing={1.25}
            alignItems={{ xs: "flex-start", md: "flex-end" }}
            sx={{ flex: "0 0 auto" }}
          >
            {count !== undefined && count !== null && (
              <Chip
                label={`${count}${countLabel ? ` ${countLabel}` : ""}`}
                sx={{
                  minHeight: 36,
                  px: 0.5,
                  bgcolor: "rgba(85,201,181,.13)",
                  color: "primary.dark",
                  border: "1px solid rgba(85,201,181,.24)",
                  fontSize: "0.95rem",
                }}
              />
            )}
            {actions && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ width: { xs: "100%", md: "auto" } }}
              >
                {actions}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

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
          xs: compact ? 2.5 : 3,
          sm: compact ? 3.5 : 4,
          md: compact ? 4 : 5,
        },
        borderRadius: { xs: 3, md: 4 },
        borderColor: "rgba(101, 70, 163, 0.14)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,.97), rgba(249,247,253,.94))",
        "&::before": {
          content: '""',
          position: "absolute",
          zIndex: -1,
          width: { xs: 210, md: 330 },
          height: { xs: 210, md: 330 },
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
        spacing={{ xs: 2.5, md: 4 }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 1.75, sm: 2.25 }}
          alignItems="flex-start"
          sx={{ minWidth: 0, maxWidth: 860 }}
        >
          {icon && (
            <Box
              aria-hidden="true"
              sx={{
                flex: "0 0 auto",
                width: { xs: 46, sm: 54 },
                height: { xs: 46, sm: 54 },
                display: "grid",
                placeItems: "center",
                borderRadius: 3,
                color: "primary.main",
                bgcolor: "rgba(101,70,163,.09)",
                border: "1px solid rgba(101,70,163,.12)",
                "& svg": { fontSize: { xs: 25, sm: 29 } },
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
                  ? { xs: "1.85rem", sm: "2.3rem", md: "2.7rem" }
                  : { xs: "2rem", sm: "2.55rem", md: "3rem" },
                lineHeight: 1.16,
                overflowWrap: "anywhere",
              }}
            >
              {title}
            </Typography>
            {description && (
              <Typography
                color="text.secondary"
                sx={{ mt: 1.25, maxWidth: 720, lineHeight: 1.8 }}
              >
                {description}
              </Typography>
            )}
            {children}
          </Box>
        </Stack>

        {(count !== undefined || actions) && (
          <Stack
            spacing={1.5}
            alignItems={{ xs: "flex-start", md: "flex-end" }}
            sx={{ flex: "0 0 auto" }}
          >
            {count !== undefined && count !== null && (
              <Chip
                label={`${count}${countLabel ? ` ${countLabel}` : ""}`}
                sx={{
                  minHeight: 38,
                  px: 0.75,
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

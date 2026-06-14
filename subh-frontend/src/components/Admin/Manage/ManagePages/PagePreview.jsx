import { useEffect } from "react";
import { Box, Typography, Stack, Chip, Divider, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages";

export default function PagePreview({ page }) {
  const navigate = useNavigate();

  const { pageTranslations, fetchPageTranslations } = usePages();

  useEffect(() => {
    if (page?.id) {
      fetchPageTranslations(page.id);
    }
  }, [page?.id, fetchPageTranslations]);

  if (!page) return null;

  const getByLocale = (locale) =>
    pageTranslations?.find((t) => t.locale === locale);

  const en = getByLocale("en");
  const ar = getByLocale("ar");

  const renderBlock = (t, locale) => {
    const missing = !t;

    return (
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 4,
          border: "1px solid #e5e5e5",
          backgroundColor: "#fff",
          transition: "0.2s ease",
          "&:hover": {
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            transform: "translateY(-3px)",
          },
        }}
      >
        {/* HEADER */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Chip
            label={locale}
            color={t ? "primary" : "default"}
            sx={{
              fontSize: "1rem",
              fontWeight: 700,
              px: 1,
            }}
          />

          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 700,
              color: t ? "success.main" : "error.main",
            }}
          >
            {t ? "ACTIVE" : "MISSING"}
          </Typography>
        </Stack>

        {/* CONTENT */}
        {!missing ? (
          <>
            {/* TITLE */}
            <Typography
              sx={{
                fontSize: "1.4rem",
                fontWeight: 800,
                mb: 2,
              }}
            >
              {t.title}
            </Typography>

            {/* SLUG */}
            <Typography sx={{ fontSize: "1rem", mb: 2 }}>
              <strong>Slug:</strong> {t.slug}
            </Typography>

            {/* SEO TITLE */}
            <Typography sx={{ fontSize: "1.1rem", mb: 1 }}>
              <strong>SEO Title:</strong> {t.seo_title}
            </Typography>

            {/* SEO DESCRIPTION */}
            <Typography sx={{ fontSize: "1rem", opacity: 0.85 }}>
              <strong>SEO Description:</strong> {t.seo_description}
            </Typography>
          </>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2rem",
                fontWeight: 700,
                mb: 2,
                color: "text.secondary",
              }}
            >
              No {locale.toUpperCase()} Translation Found
            </Typography>

            <Button
              onClick={() =>
                navigate(`/admin/add-translations-page/${page.id}`)
              }
              variant="contained"
              color="primary"
            >
              Add Translation
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 4,
        border: "1px solid #e0e0e0",
        backgroundColor: "#fafafa",
      }}
    >
      {/* HEADER */}
      <Typography
        sx={{
          fontSize: "1.8rem",
          fontWeight: 900,
          mb: 1,
        }}
      >
        Page Translation Overview
      </Typography>

      {/* INSTRUCTIONS */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          backgroundColor: "#fff",
          border: "1px dashed #ccc",
        }}
      >
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, mb: 1 }}>
          Instructions
        </Typography>

        <Typography sx={{ fontSize: "1rem", opacity: 0.8 }}>
          • Ensure both EN and AR translations exist before publishing <br />
          • SEO fields must be filled for better search visibility <br />•
          Missing translations will block full page activation
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* PAGE KEY */}
      <Typography sx={{ fontSize: "1rem", color: "text.secondary" }}>
        Page Key
      </Typography>

      <Typography
        sx={{
          fontSize: "1.5rem",
          fontWeight: 800,
          mb: 4,
        }}
      >
        {page.key}
      </Typography>

      {/* TRANSLATIONS */}
      {renderBlock(en, "EN")}
      {renderBlock(ar, "AR")}
    </Box>
  );
}

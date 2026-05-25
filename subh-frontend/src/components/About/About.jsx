import { useEffect } from "react";
import { Box, Container, Divider, Typography, useTheme } from "@mui/material";
import { useSections } from "../../Hooks/useSections";
import { usePages } from "../../Hooks/usePages";

function renderMedia(media) {
  if (!media) return null;

  // IMAGE
  if (
    media.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i) ||
    media.includes("image")
  ) {
    return (
      <Box
        component="img"
        src={media}
        sx={{
          width: "100%",
          maxHeight: 500,
          objectFit: "cover",
          borderRadius: 3,
          mt: 3,
        }}
      />
    );
  }

  // VIDEO
  if (media.match(/\.(mp4|webm|ogg)$/i) || media.includes("video")) {
    return (
      <Box
        component="video"
        controls
        src={media}
        sx={{
          width: "100%",
          borderRadius: 3,
          mt: 3,
        }}
      />
    );
  }

  // FILE
  return (
    <Typography
      component="a"
      href={media}
      target="_blank"
      sx={{
        display: "inline-block",
        mt: 2,
        fontWeight: 700,
        textDecoration: "none",
      }}
    >
      Open File
    </Typography>
  );
}

function renderSection(section) {
  const settings = section.settings || {};
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        py: { xs: 10, md: 16 },
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: "background.default",
        transition: "0.3s ease",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: settings.media ? "row" : "column",
            },

            alignItems: "center",
            justifyContent: "space-between",

            gap: { xs: 5, md: 10 },
          }}
        >
          {/* CONTENT */}
          <Box
            sx={{
              flex: 1,
              width: "100%",

              display: "flex",
              flexDirection: "column",

              alignItems: {
                xs: "center",
                md: settings.media ? "flex-start" : "center",
              },

              textAlign: {
                xs: "center",
                md: settings.media ? "left" : "center",
              },

              gap: 3,
            }}
          >
            {/* TITLE */}
            {settings.title && (
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.1,

                  fontSize: {
                    xs: "2.3rem",
                    md: "4rem",
                  },

                  maxWidth: 800,

                  color: "text.primary",
                }}
              >
                {settings.title}
              </Typography>
            )}

            {/* SUBTITLE */}
            {settings.subtitle && (
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 500,
                  lineHeight: 1.8,
                  color: "text.primary",
                  maxWidth: 700,
                }}
              >
                {settings.subtitle}
              </Typography>
            )}

            {/* DIVIDER */}
            {(settings.title || settings.subtitle) && (
              <Box
                sx={{
                  width: 100,
                  height: 4,
                  borderRadius: 999,
                  background: theme.palette.primary.main,
                }}
              />
            )}

            {/* PARAGRAPH */}
            {settings.paragraph && (
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 2.1,
                  fontSize: "1.05rem",
                  color: "text.primary",
                  maxWidth: 800,
                }}
              >
                {settings.paragraph}
              </Typography>
            )}
          </Box>

          {/* MEDIA */}
          {settings.media && (
            <Box
              sx={{
                flex: 1,
                width: "100%",

                display: "flex",
                justifyContent: "center",

                "& img, & video": {
                  width: "100%",
                  maxWidth: 550,
                  maxHeight: 500,

                  objectFit: "cover",

                  borderRadius: 5,

                  border: `1px solid ${theme.palette.divider}`,

                  boxShadow: theme.shadows[10],

                  transition: "0.4s ease",

                  "&:hover": {
                    transform: "translateY(-8px)",
                  },
                },
              }}
            >
              {renderMedia(settings.media)}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default function About() {
  const pageKey = "home";

  const { getPageByKey, page } = usePages();
  const { fetchSectionsPage, sections } = useSections();
  useEffect(() => {
    const loadPage = async () => {
      try {
        const pageData = await getPageByKey(pageKey);

        if (pageData?.id) {
          await fetchSectionsPage(pageData.id);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadPage();
  }, []);

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "100vh",
      }}
    >
      {sections?.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
          }}
        >
          <Typography variant="h4" fontWeight={800}>
            No Sections Yet
          </Typography>

          <Typography sx={{ mt: 2 }}>
            Admin still building the page. The classic “works on my machine”
            phase.
          </Typography>
        </Box>
      ) : (
        sections.map((section) => (
          <Box key={section.id}>{renderSection(section)}</Box>
        ))
      )}
    </Container>
  );
}

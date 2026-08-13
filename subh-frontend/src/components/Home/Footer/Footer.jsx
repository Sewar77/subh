import { Box, Container, Grid, Typography } from "@mui/material";

import Subscribe from "./Subscribe";
import ConnectInfo from "./ConnectInfo";
import CopyRight from "./CopyRight";
import Pages from "./Pages";
import Info from "./Info";

import { useLanguage } from "../../../Context/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();

  const isArabic = language === "ar";

  return (
    <Box
      component="footer"
      sx={{
        direction: isArabic ? "rtl" : "ltr",

        position: "relative",

        mt: {
          xs: 8,
          md: 12,
        },

        overflow: "hidden",

        color: "common.white",

        background:
          "linear-gradient(145deg, #241D38 0%, #302448 45%, #25233F 100%)",

        borderTop: "1px solid rgba(255,255,255,0.08)",

        // Aurora glow left
        "&::before": {
          content: '""',
          position: "absolute",

          width: {
            xs: 300,
            md: 520,
          },

          height: {
            xs: 300,
            md: 520,
          },

          borderRadius: "50%",

          left: {
            xs: -180,
            md: -240,
          },

          top: -300,

          background:
            "radial-gradient(circle, rgba(192,82,169,0.30) 0%, rgba(192,82,169,0.08) 38%, transparent 70%)",

          pointerEvents: "none",
        },

        // Aurora glow right
        "&::after": {
          content: '""',
          position: "absolute",

          width: {
            xs: 320,
            md: 560,
          },

          height: {
            xs: 320,
            md: 560,
          },

          borderRadius: "50%",

          right: {
            xs: -200,
            md: -260,
          },

          bottom: -360,

          background:
            "radial-gradient(circle, rgba(85,201,181,0.24) 0%, rgba(101,191,210,0.10) 40%, transparent 72%)",

          pointerEvents: "none",
        },
      }}
    >
      {/* Aurora top line */}
      <Box
        sx={{
          height: 3,

          background:
            "linear-gradient(90deg, transparent 0%, #C052A9 22%, #6546A3 45%, #65BFD2 70%, #55C9B5 85%, transparent 100%)",

          opacity: 0.9,
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,

          pt: {
            xs: 6,
            md: 8,
          },

          pb: {
            xs: 3,
            md: 4,
          },
        }}
      >
        {/* Brand introduction */}
        <Box
          sx={{
            maxWidth: 620,
            mb: {
              xs: 5,
              md: 7,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box
              component="img"
              src="/subhlogo.png"
              alt="Subh"
              sx={{
                width: 54,
                height: 54,
                objectFit: "contain",
              }}
            />

            <Typography
              variant="h4"
              sx={{
                color: "common.white",
                fontWeight: 800,
              }}
            >
              {isArabic ? "صُبح" : "Subh"}
            </Typography>
          </Box>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.68)",

              fontSize: {
                xs: "0.95rem",
                md: "1.05rem",
              },

              lineHeight: 1.9,
            }}
          >
            {isArabic
              ? "مساحة للمعرفة والكتب والتعلم، صُممت لتجعل الوصول إلى المحتوى أكثر بساطة ووضوحاً."
              : "A thoughtful space for books, knowledge and learning — designed to make meaningful content easier to discover."}
          </Typography>
        </Box>

        {/* Main footer content */}
        <Grid
          container
          spacing={{
            xs: 4,
            md: 5,
          }}
        >
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <FooterSection>
              <Subscribe />
            </FooterSection>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <FooterSection>
              <ConnectInfo />
            </FooterSection>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <FooterSection>
              <Pages />
            </FooterSection>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <FooterSection>
              <Info />
            </FooterSection>
          </Grid>
        </Grid>

        {/* Bottom */}
        <Box
          sx={{
            mt: {
              xs: 6,
              md: 8,
            },

            pt: 3,

            borderTop: "1px solid rgba(255,255,255,0.10)",

            display: "flex",

            flexDirection: {
              xs: "column",
              sm: "row",
            },

            alignItems: {
              xs: "flex-start",
              sm: "center",
            },

            justifyContent: "space-between",

            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.56)",
            }}
          >
            {isArabic
              ? "المعرفة تبدأ من فضول صغير."
              : "Knowledge begins with a little curiosity."}
          </Typography>

          <Box
            sx={{
              color: "rgba(255,255,255,0.65)",
            }}
          >
            <CopyRight />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function FooterSection({ children }) {
  return (
    <Box
      sx={{
        height: "100%",

        p: {
          xs: 0,
          md: 1,
        },

        color: "rgba(255,255,255,0.78)",

        "& h1, & h2, & h3, & h4, & h5, & h6": {
          color: "common.white",
          fontWeight: 750,
          mb: 2,
        },

        "& p": {
          color: "rgba(255,255,255,0.66)",
          lineHeight: 1.8,
        },

        "& a": {
          color: "rgba(255,255,255,0.66)",
          textDecoration: "none",

          transition: "color 160ms ease, transform 160ms ease",

          "&:hover": {
            color: "#88E0D1",
          },
        },

        "& .MuiButton-root": {
          minHeight: 42,
        },

        "& .MuiInputBase-root": {
          bgcolor: "rgba(255,255,255,0.08)",
          color: "common.white",
        },

        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(255,255,255,0.14)",
        },
      }}
    >
      {children}
    </Box>
  );
}

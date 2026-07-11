import { Box, Container, TextField, Typography, Button } from "@mui/material";
import { useLanguage } from "../../Context/LanguageContext";

export default function Contact() {
  const { language } = useLanguage();

  const isArabic = language === "ar";

  const translations = {
    en: {
      title: "Contact Us",
      description:
        "We are here to help! If you have any questions or need assistance, feel free to reach out to us.",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      message: "Message",
      send: "Send Message",
    },
    ar: {
      title: "تواصل معنا",
      description:
        "نحن هنا لمساعدتك! إذا كان لديك أي استفسارات أو تحتاج إلى أي مساعدة، فلا تتردد في التواصل معنا.",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      message: "الرسالة",
      send: "إرسال الرسالة",
    },
  };

  const t = translations[language];

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 8,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 6,
        minWidth: "100%",
        direction: isArabic ? "rtl" : "ltr",
      }}
    >
      <Box
        component="img"
        src="/Contact_us-01.png"
        sx={{
          width: "22rem",
          height: "25rem",
          objectFit: "contain",
        }}
      />

      <Box
        sx={{
          backdropFilter: "blur(30px)",
          backgroundColor: "rgba(255,255,255,0.4)",
          border: "1px solid rgba(0, 0, 0, 0.3)",
          p: 4,
          borderRadius: 3,
          color: "text.primary",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            mb: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {t.title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t.description}
          </Typography>
        </Box>

        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <TextField
            label={t.name}
            required
            fullWidth
            sx={{
              input: {
                color: "primary.main",
                textAlign: isArabic ? "right" : "left",
              },
              label: {
                color: "primary.main",
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <TextField
              label={t.email}
              type="email"
              required
              fullWidth
              sx={{
                input: {
                  color: "primary.main",
                  textAlign: isArabic ? "right" : "left",
                },
                label: {
                  color: "primary.main",
                },
              }}
            />

            <TextField
              label={t.phone}
              fullWidth
              type="number"
              sx={{
                input: {
                  color: "primary.main",
                  textAlign: isArabic ? "right" : "left",
                },
                label: {
                  color: "primary.main",
                },
              }}
            />
          </Box>

          <TextField
            label={t.message}
            required
            fullWidth
            multiline
            rows={4}
            sx={{
              textarea: {
                textAlign: isArabic ? "right" : "left",
              },
              label: {
                color: "primary.main",
              },
            }}
          />

          <Button
            variant="contained"
            size="large"
            sx={{
              mt: 1,
              py: 1.2,
              fontWeight: 600,
            }}
          >
            {t.send}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

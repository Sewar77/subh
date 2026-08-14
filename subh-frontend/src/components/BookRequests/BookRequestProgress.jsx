import { Box, Stack, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { getBookRequestCopy, formatRequestNumber } from "../../Utils/bookRequestI18n.js";

const progressIndex = (request) => {
  if (request.fulfillmentStatus === "delivered") return 6;
  if (request.fulfillmentStatus === "shipped") return 5;
  if (["preparing", "ready"].includes(request.fulfillmentStatus)) return 4;
  if (["confirmed", "completed"].includes(request.requestStatus)) return 3;
  if (
    request.requestStatus === "quote_sent" ||
    !["not_prepared", "draft"].includes(request.quoteStatus) ||
    request.contactStatus !== "not_contacted"
  ) return 2;
  if (request.requestStatus === "under_review") return 1;
  return 0;
};

export default function BookRequestProgress({ request, language }) {
  const t = getBookRequestCopy(language);
  const activeIndex = progressIndex(request);

  return (
    <Box
      component="ol"
      aria-label={t.progress}
      sx={{
        m: 0,
        p: 0,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(7, 1fr)" },
        gap: 1,
        listStyle: "none",
      }}
    >
      {t.progressSteps.map((label, index) => {
        const complete = index < activeIndex;
        const active = index === activeIndex;
        return (
          <Stack
            component="li"
            key={label}
            direction="row"
            alignItems="center"
            spacing={1}
            aria-current={active ? "step" : undefined}
            sx={{
              p: 1.25,
              borderRadius: 2,
              border: "1px solid",
              borderColor: active ? "primary.main" : "divider",
              bgcolor: complete ? "rgba(85,201,181,.12)" : active ? "rgba(101,70,163,.08)" : "background.paper",
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                flex: "0 0 auto",
                display: "grid",
                placeItems: "center",
                bgcolor: complete || active ? "primary.main" : "action.disabledBackground",
                color: complete || active ? "primary.contrastText" : "text.secondary",
                fontWeight: 800,
              }}
            >
              {complete ? <CheckRoundedIcon fontSize="small" /> : formatRequestNumber(index + 1, language)}
            </Box>
            <Typography variant="body2" fontWeight={active ? 800 : 600}>{label}</Typography>
          </Stack>
        );
      })}
    </Box>
  );
}

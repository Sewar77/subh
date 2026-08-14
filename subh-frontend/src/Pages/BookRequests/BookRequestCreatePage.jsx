import { Box, Stack } from "@mui/material";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { authContext } from "../../Context/authContextValue.js";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { getBookRequestCopy } from "../../Utils/bookRequestI18n.js";
import BookRequestBuilder from "../../components/BookRequests/BookRequestBuilder.jsx";
import BookRequestSuccess from "../../components/BookRequests/BookRequestSuccess.jsx";
import PublicPageHero from "../../components/Public/PublicPageHero.jsx";

export default function BookRequestCreatePage() {
  const { language } = useLanguage();
  const { user } = useContext(authContext);
  const [searchParams] = useSearchParams();
  const [createdRequest, setCreatedRequest] = useState(null);
  const t = getBookRequestCopy(language);
  const initialBookId = searchParams.get("bookId");

  if (createdRequest) {
    return <BookRequestSuccess request={createdRequest} language={language} />;
  }

  return (
    <Box dir={language === "ar" ? "rtl" : "ltr"}>
      <Stack spacing={3}>
        <PublicPageHero
          eyebrow={t.requestEyebrow}
          title={t.requestTitle}
          description={t.requestDescription}
          icon={<LibraryAddOutlinedIcon />}
        />
        <BookRequestBuilder
          initialBookId={initialBookId}
          language={language}
          user={user}
          onSuccess={setCreatedRequest}
        />
      </Stack>
    </Box>
  );
}

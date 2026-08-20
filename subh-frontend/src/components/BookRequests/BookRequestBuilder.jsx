import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useEffect, useMemo, useState } from "react";
import { getPublicBook, getPublicBooks } from "../../Services/bookService.js";
import { createCustomerBookRequest } from "../../Services/customerBookRequestService.js";
import {
  formatRequestMoney,
  formatRequestNumber,
  getBookRequestCopy,
} from "../../Utils/bookRequestI18n.js";
import CustomerRequestSection from "./CustomerRequestSection.jsx";
import { trackEvent } from "../../Services/analyticsService.js";

const optional = (value) => value.trim() || undefined;

export default function BookRequestBuilder({ initialBookId, language, user, onSuccess }) {
  const t = getBookRequestCopy(language);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [resultsLanguage, setResultsLanguage] = useState("");
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoading, setInitialLoading] = useState(Boolean(initialBookId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shipping, setShipping] = useState({
    recipient: user?.fullName || "",
    company: user?.companyProfile?.companyName || "",
    phone: user?.phoneNumber || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    notes: "",
  });
  const [customerNote, setCustomerNote] = useState("");
  const selectedBookIdsKey = items.map((item) => item.book.id).join(",");
  const bookIdsToLoad =
    selectedBookIdsKey || (initialLoading && initialBookId ? String(initialBookId) : "");

  useEffect(() => {
    void trackEvent("book_request_started", {
      locale: language,
      properties: { itemCount: initialBookId ? 1 : 0 },
      dedupeKey: `book-request-started:${initialBookId || "empty"}`,
    });
  }, [initialBookId, language]);

  useEffect(() => {
    if (!bookIdsToLoad) return undefined;
    let active = true;
    Promise.all(
      bookIdsToLoad.split(",").map((bookId) => getPublicBook(bookId, language)),
    )
      .then((books) => {
        if (!active) return;
        setItems((current) => books.map((book) => ({
          book,
          quantity:
            current.find((item) => item.book.id === book.id)?.quantity ?? 1,
        })));
      })
      .catch(() => active && setError(t.bookLoadError))
      .finally(() => active && setInitialLoading(false));
    return () => {
      active = false;
    };
  }, [bookIdsToLoad, language, t.bookLoadError]);

  const preview = useMemo(() => items.reduce(
    (totals, item) => {
      const quantity = Number(item.quantity) || 0;
      totals.subtotal += Number(item.book.price || 0) * quantity;
      totals.shipping += Number(item.book.shippingCost || 0) * quantity;
      totals.quantity += quantity;
      return totals;
    },
    { subtotal: 0, shipping: 0, quantity: 0 },
  ), [items]);

  const runSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    setError("");
    try {
      const response = await getPublicBooks({ search: search.trim(), limit: 10, lang: language });
      setResults(response.books || []);
      setResultsLanguage(language);
      setHasSearched(true);
    } catch {
      setError(t.searchLoadError);
    } finally {
      setSearching(false);
    }
  };

  const addBook = (book) => {
    if (items.some((item) => item.book.id === book.id)) return;
    void trackEvent("book_added_to_request", { locale: language, entityType: "book", entityId: book.id, properties: { quantity: 1 } });
    setItems((current) => [...current, { book, quantity: 1 }]);
  };
  const visibleResults = resultsLanguage === language ? results : [];

  const changeQuantity = (bookId, quantity) => {
    setItems((current) => current.map((item) =>
      item.book.id === bookId ? { ...item, quantity } : item));
  };

  const updateShipping = (field) => (event) => {
    const value = field === "country" ? event.target.value.toUpperCase() : event.target.value;
    setShipping((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (items.length === 0) {
      setError(t.noSelectedBooks);
      return;
    }
    if (items.some((item) => !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 1000000)) {
      setError(t.invalidQuantity);
      return;
    }
    const requiredShipping = ["recipient", "phone", "addressLine1", "city", "state", "postalCode", "country"];
    if (requiredShipping.some((field) => !shipping[field].trim())) {
      setError(t.requiredFields);
      return;
    }
    if (!/^[A-Za-z]{2}$/.test(shipping.country)) {
      setError(t.invalidCountry);
      return;
    }
    const payload = {
      items: items.map((item) => ({ bookId: item.book.id, quantity: Number(item.quantity) })),
      shipping: {
        recipient: shipping.recipient.trim(),
        phone: shipping.phone.trim(),
        addressLine1: shipping.addressLine1.trim(),
        city: shipping.city.trim(),
        state: shipping.state.trim(),
        postalCode: shipping.postalCode.trim(),
        country: shipping.country,
        ...(optional(shipping.company) ? { company: optional(shipping.company) } : {}),
        ...(optional(shipping.addressLine2) ? { addressLine2: optional(shipping.addressLine2) } : {}),
        ...(optional(shipping.notes) ? { notes: optional(shipping.notes) } : {}),
      },
      ...(optional(customerNote) ? { customerNote: optional(customerNote) } : {}),
    };
    setSubmitting(true);
    try {
      const created = await createCustomerBookRequest(payload, language);
      void trackEvent("book_request_submitted", {
        locale: language,
        entityType: "book_request",
        entityId: created.id,
        properties: { itemCount: items.length, totalQuantity: preview.quantity },
      });
      onSuccess(created);
    } catch (requestError) {
      setError(requestError.status === 409 ? t.profileIncomplete : t.requestSubmitError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Stack spacing={2}>
        {error && <Alert severity="error" aria-live="polite">{error}</Alert>}
        <Alert severity="info">{t.contactNotice}</Alert>
        <CustomerRequestSection title={t.addBooks}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              fullWidth
              label={t.searchBooks}
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> }}
            />
            <Button type="button" onClick={runSearch} variant="outlined" disabled={searching || !search.trim()} startIcon={searching ? <CircularProgress size={18} /> : <SearchRoundedIcon />}>
              {searching ? t.searching : t.search}
            </Button>
          </Stack>
          {visibleResults.length > 0 && (
            <Stack spacing={1} sx={{ mt: 2 }}>
              {visibleResults.map((book) => {
                const added = items.some((item) => item.book.id === book.id);
                return (
                  <Paper key={book.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={800}>{book.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatRequestMoney(book.price, "USD", language)}
                        </Typography>
                      </Box>
                      <Button variant={added ? "text" : "contained"} disabled={added} startIcon={<AddRoundedIcon />} onClick={() => addBook(book)}>
                        {added ? t.added : t.add}
                      </Button>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
          {!searching && hasSearched && resultsLanguage === language && visibleResults.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>{t.noSearchResults}</Typography>
          )}
        </CustomerRequestSection>

        <CustomerRequestSection title={t.selectedBooks}>
          {initialLoading ? <CircularProgress aria-label={t.searching} /> : items.length === 0 ? (
            <Typography color="text.secondary">{t.noSelectedBooks}</Typography>
          ) : (
            <Stack spacing={2} divider={<Divider flexItem />}>
              {items.map((item) => (
                <Stack key={item.book.id} direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={900}>{item.book.name}</Typography>
                    <Typography variant="body2">{t.catalogUnitPrice}: {formatRequestMoney(item.book.price, "USD", language)}</Typography>
                    <Typography variant="body2">{t.estimatedSubtotal}: {formatRequestMoney(Number(item.book.price || 0) * Number(item.quantity || 0), "USD", language)}</Typography>
                    <Typography variant="body2">{t.estimatedShipping}: {formatRequestMoney(Number(item.book.shippingCost || 0) * Number(item.quantity || 0), "USD", language)}</Typography>
                  </Box>
                  <TextField
                    label={t.quantity}
                    type="number"
                    value={item.quantity}
                    onChange={(event) => changeQuantity(item.book.id, event.target.value)}
                    inputProps={{ min: 1, max: 1000000, step: 1, inputMode: "numeric" }}
                    sx={{ width: { sm: 170 } }}
                  />
                  <Tooltip title={t.remove}>
                    <IconButton color="error" aria-label={`${t.remove}: ${item.book.name}`} onClick={() => {
                      void trackEvent("book_removed_from_request", { locale: language, entityType: "book", entityId: item.book.id, properties: { quantity: Number(item.quantity) || 0 } });
                      setItems((current) => current.filter((entry) => entry.book.id !== item.book.id));
                    }}>
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))}
            </Stack>
          )}
        </CustomerRequestSection>

        <CustomerRequestSection title={t.shippingTitle}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
            <TextField label={t.recipient} required value={shipping.recipient} onChange={updateShipping("recipient")} inputProps={{ maxLength: 200 }} />
            <TextField label={t.company} value={shipping.company} onChange={updateShipping("company")} inputProps={{ maxLength: 200 }} />
            <TextField label={t.phone} required value={shipping.phone} onChange={updateShipping("phone")} inputProps={{ maxLength: 30 }} />
            <TextField label={t.country} required value={shipping.country} onChange={updateShipping("country")} helperText={t.countryHelp} inputProps={{ maxLength: 2 }} />
            <TextField label={t.addressLine1} required value={shipping.addressLine1} onChange={updateShipping("addressLine1")} inputProps={{ maxLength: 300 }} />
            <TextField label={t.addressLine2} value={shipping.addressLine2} onChange={updateShipping("addressLine2")} inputProps={{ maxLength: 300 }} />
            <TextField label={t.city} required value={shipping.city} onChange={updateShipping("city")} inputProps={{ maxLength: 120 }} />
            <TextField label={t.state} required value={shipping.state} onChange={updateShipping("state")} inputProps={{ maxLength: 120 }} />
            <TextField label={t.postalCode} required value={shipping.postalCode} onChange={updateShipping("postalCode")} inputProps={{ maxLength: 30 }} />
            <TextField label={t.shippingNotes} multiline minRows={2} value={shipping.notes} onChange={updateShipping("notes")} inputProps={{ maxLength: 1000 }} />
            <TextField label={t.customerNote} multiline minRows={3} value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} inputProps={{ maxLength: 2000 }} sx={{ gridColumn: { sm: "span 2" } }} />
          </Box>
        </CustomerRequestSection>

        <CustomerRequestSection title={t.estimateTitle}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
            <Preview label={t.totalQuantity} value={formatRequestNumber(preview.quantity, language)} />
            <Preview label={t.estimatedSubtotal} value={formatRequestMoney(preview.subtotal, "USD", language)} />
            <Preview label={t.estimatedShipping} value={formatRequestMoney(preview.shipping, "USD", language)} />
            <Preview label={t.estimatedTotal} value={formatRequestMoney(preview.subtotal + preview.shipping, "USD", language)} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{t.previewOnly}</Typography>
        </CustomerRequestSection>

        <Button type="submit" variant="contained" size="large" disabled={submitting || initialLoading || items.length === 0} startIcon={submitting ? <CircularProgress color="inherit" size={20} /> : <SendRoundedIcon />} sx={{ alignSelf: { sm: "flex-start" } }}>
          {submitting ? t.submitting : t.submit}
        </Button>
      </Stack>
    </Box>
  );
}

function Preview({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
      <Typography variant="h6" fontWeight={800}>{value}</Typography>
    </Box>
  );
}

export const serializeSectionMedia = (mediaItem = {}) => ({
  id: mediaItem.id,
  media_id: mediaItem.id,
  sectionId: mediaItem.section_id ?? mediaItem.sectionId,
  section_id: mediaItem.section_id ?? mediaItem.sectionId,
  slot: mediaItem.slot_key ?? mediaItem.slot,
  role: mediaItem.slot_key ?? mediaItem.slot,
  mediaType: mediaItem.media_type ?? mediaItem.mediaType,
  fileRef: mediaItem.file_ref ?? mediaItem.fileRef,
  url: mediaItem.file_ref ?? mediaItem.fileRef,
  position: mediaItem.position,
  altEn: mediaItem.alt_en ?? mediaItem.altEn,
  altAr: mediaItem.alt_ar ?? mediaItem.altAr,
  captionEn: mediaItem.caption_en ?? mediaItem.captionEn,
  captionAr: mediaItem.caption_ar ?? mediaItem.captionAr,
  createdAt: mediaItem.created_at,
  updatedAt: mediaItem.updated_at,
});

export const serializeSectionMediaList = (mediaRows = []) =>
  mediaRows.map((row) => serializeSectionMedia(row));

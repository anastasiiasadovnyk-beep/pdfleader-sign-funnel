import type { EventCategory } from './schema';

export type TriggerDef = {
  id: string;
  category: EventCategory;
  label: string;
  suffix: string;
  needsElement: boolean;
  suggestedProps: string[];
  extension?: boolean;
};

export const CATEGORIES: EventCategory[] = ['interaction', 'form', 'visibility', 'navigation', 'media', 'content', 'custom'];

export const TRIGGERS: TriggerDef[] = [
  { id: 'click', category: 'interaction', label: 'Click', suffix: 'tap', needsElement: true, suggestedProps: ['method', 'place'] },
  { id: 'double_click', category: 'interaction', label: 'Double click', suffix: 'tap', needsElement: true, suggestedProps: ['method', 'place'] },
  { id: 'right_click', category: 'interaction', label: 'Right click', suffix: 'tap', needsElement: true, suggestedProps: ['method', 'place'] },
  { id: 'long_press', category: 'interaction', label: 'Long press', suffix: 'tap', needsElement: true, suggestedProps: ['method', 'place'] },
  { id: 'hover', category: 'interaction', label: 'Hover', suffix: 'hover', needsElement: true, suggestedProps: ['place'], extension: true },
  { id: 'focus', category: 'interaction', label: 'Focus', suffix: 'focus', needsElement: true, suggestedProps: ['place'], extension: true },
  { id: 'blur', category: 'interaction', label: 'Blur', suffix: 'blur', needsElement: true, suggestedProps: ['place'], extension: true },

  { id: 'input_change', category: 'form', label: 'Input change', suffix: 'change', needsElement: true, suggestedProps: ['place'] },
  { id: 'select_change', category: 'form', label: 'Select change', suffix: 'change', needsElement: true, suggestedProps: ['place'] },
  { id: 'toggle', category: 'form', label: 'Toggle', suffix: 'change', needsElement: true, suggestedProps: ['place', 'status'] },
  { id: 'form_submit', category: 'form', label: 'Form submit', suffix: 'tap', needsElement: true, suggestedProps: ['method', 'place', 'status'] },
  { id: 'validation_error', category: 'form', label: 'Validation error', suffix: 'status', needsElement: true, suggestedProps: ['error_type', 'error_code', 'place'] },

  { id: 'impression', category: 'visibility', label: 'Impression', suffix: 'view', needsElement: true, suggestedProps: ['place'] },
  { id: 'section_view', category: 'visibility', label: 'Section view', suffix: 'view', needsElement: false, suggestedProps: ['place'] },
  { id: 'scroll_depth', category: 'visibility', label: 'Scroll depth', suffix: 'scroll', needsElement: false, suggestedProps: ['place'], extension: true },

  { id: 'page_view', category: 'navigation', label: 'Page view', suffix: 'view', needsElement: false, suggestedProps: ['place'] },
  { id: 'route_change', category: 'navigation', label: 'Route change', suffix: 'view', needsElement: false, suggestedProps: ['place', 'source'] },
  { id: 'back', category: 'navigation', label: 'Back', suffix: 'tap', needsElement: true, suggestedProps: ['place'] },
  { id: 'external_link', category: 'navigation', label: 'External link', suffix: 'tap', needsElement: true, suggestedProps: ['place', 'source'] },
  { id: 'tab_change', category: 'navigation', label: 'Tab change', suffix: 'tap', needsElement: true, suggestedProps: ['place'] },

  { id: 'media_play', category: 'media', label: 'Media play', suffix: 'play', needsElement: true, suggestedProps: ['place'], extension: true },
  { id: 'media_pause', category: 'media', label: 'Media pause', suffix: 'pause', needsElement: true, suggestedProps: ['place'], extension: true },
  { id: 'media_complete', category: 'media', label: 'Media complete', suffix: 'complete', needsElement: true, suggestedProps: ['place'], extension: true },

  { id: 'modal_open', category: 'content', label: 'Modal open', suffix: 'view', needsElement: false, suggestedProps: ['place'] },
  { id: 'modal_close', category: 'content', label: 'Modal close', suffix: 'tap', needsElement: true, suggestedProps: ['place'] },
  { id: 'toast_shown', category: 'content', label: 'Toast shown', suffix: 'view', needsElement: false, suggestedProps: ['place', 'status'] },
  { id: 'accordion_expand', category: 'content', label: 'Accordion expand', suffix: 'expand', needsElement: true, suggestedProps: ['place'], extension: true },
  { id: 'accordion_collapse', category: 'content', label: 'Accordion collapse', suffix: 'collapse', needsElement: true, suggestedProps: ['place'], extension: true },
  { id: 'copy', category: 'content', label: 'Copy', suffix: 'tap', needsElement: true, suggestedProps: ['place'] },

  { id: 'custom', category: 'custom', label: 'Custom', suffix: 'custom', needsElement: false, suggestedProps: [] },
];

export function triggerById(id: string): TriggerDef | undefined {
  return TRIGGERS.find((t) => t.id === id);
}
export function triggersByCategory(category: EventCategory): TriggerDef[] {
  return TRIGGERS.filter((t) => t.category === category);
}

export const PROPERTY_KEYS: string[] = [
  'method', 'status', 'place', 'source', 'feature_name', 'features_name', 'type', 'funnel',
  'file_format', 'file_size_bytes', 'file_pages', 'currency', 'download_method', 'error_type',
  'error_code', 'session_id', 'is_premium', 'plan_type', 'tool', 'screen_config_name',
];

export const PROPERTY_VALUES: Record<string, string[]> = {
  method: ['manual', 'auto', 'click', 'drag_and_drop', 'box', 'drive', 'files_list', 'paypal'],
  status: ['success', 'fail', 'error', 'impossible', 'started', 'processing', 'ready'],
  type: ['manual', 'auto'],
  error_type: ['cors', 'network', 'http', 'abort', 'unknown'],
  download_method: ['fetch_blob', 'anchor', 'iframe', 'fetch_data_url', 'service_worker'],
  funnel: [
    'pdf_converter', 'pdf_to_word', 'pdf_to_png', 'pdf_to_jpg', 'image_to_pdf', 'word_to_pdf',
    'merge_pdf', 'merge_images', 'split_pdf', 'extract_pdf_pages', 'delete_pdf_pages', 'rotate_pdf',
    'organize_pdf', 'compress_pdf', 'crop_pdf', 'compress_images', 'enhance_image', 'fill_pdf',
    'edit_pdf', 'sign_pdf', 'create_pdf', 'pdf_ocr', 'image_to_text', 'pdf_summarizer',
    'remove_watermark', 'translate_pdf', 'unlock_pdf', 'audio_convert', 'video_convert',
    'compress_video', 'transcribe_audio', 'transcribe_video', 'transcribe_youtube', 'text_to_speech',
    'vocal_remover', 'create_qr_code', 'main_page',
  ],
  place: ['main', 'additional', 'dashboard', 'editor', 'header', 'files_list', 'payment_screen', 'payment_success', 'login_page', 'error_popup', 'download_toast'],
};

// Common utilities for all pages
const $ = <T extends Element>(sel: string) => document.querySelector(sel) as T;

const yearEl = $("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

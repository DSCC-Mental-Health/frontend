/**
 * The services the Support tab (T1) and Urgent help (O3) point to — the one
 * place their names, numbers and hours are written.
 *
 * ⚠ Checked against public listings on 2026-10-05, not with the services
 * themselves. Confirm every line directly with SOS, mindline 1771 and SAF
 * before this is shown to a real NSF (Figma's "⚠ VERIFY SERVICES" note).
 *
 * - SOS: 1767 and CareText (WhatsApp 9151 1767), both 24h — sos.org.sg
 * - National mindline 1771: call, WhatsApp or webchat at mindline.sg, 24h.
 *   O3 in Figma calls 1771 the "IMH Mental Health Helpline"; 1771 is
 *   mindline's number, so it's named that here.
 * - SAF Counselling Hotline: 1800-278-0022, 24h, can stay anonymous —
 *   cmpb.gov.sg "Where to seek help"
 */

export const SOS = {
	name: 'Samaritans of Singapore (SOS)',
	phone: '1767',
	whatsapp: '6591511767',
};

export const MINDLINE = {
	name: 'National mindline 1771',
	phone: '1771',
	url: 'https://www.mindline.sg',
};

export const SAF_HOTLINE = {
	name: 'SAF Counselling Hotline',
	phone: '1800-278-0022',
};

/** True when a phone number has really been entered in Settings (the built-in default is a placeholder). */
export const hasRealPhone = (phone?: string | null): phone is string => !!phone && !/555-01|placeholder/i.test(phone)

/**
 * Banner/announcement text jismein placeholder number (555-01xx) ya "placeholder" likha ho, public site
 * par nahi dikhna chahiye: woh asli business ki jaankari nahi hai. Admin Settings mein sahi text daalte
 * hi message wapas dikhne lagta hai.
 */
export const isPublishableMessage = (text: string) => text.trim() !== '' && !/555-01\d\d|placeholder/i.test(text)

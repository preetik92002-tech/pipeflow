/** True when a phone number has really been entered in Settings (the built-in default is a placeholder). */
export const hasRealPhone = (phone?: string | null): phone is string => !!phone && !/555-01|placeholder/i.test(phone)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './lib/i18n-config'

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Get the locale from the cookie or use default
    const savedLocale = request.cookies.get('NEXT_LOCALE')?.value || i18n.defaultLocale
    
    // Validate if the saved locale is one of the supported ones
    const locale = i18n.locales.includes(savedLocale as any) ? savedLocale : i18n.defaultLocale

    // e.g. incoming request is /dashboard
    // The new URL is now /pt/dashboard
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    )
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png|.*\\.jpg|.*\\.svg).*)'],
}

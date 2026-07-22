"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export interface SearchResult {
  id: string
  type: 'book' | 'document'
  title: string
  bookId?: string
  snippet?: string
}

export async function searchGlobalAction(query: string): Promise<SearchResult[]> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const userId = session.user.id
  const searchTerms = query.trim().split(/\s+/)
  
  if (searchTerms.length === 0 || query.trim() === "") {
    return []
  }

  // Find matching books
  const books = await prisma.book.findMany({
    where: {
      userId,
      title: {
        contains: query,
        mode: 'insensitive'
      }
    },
    take: 5
  })

  // Find matching documents (by title or content)
  const documents = await prisma.document.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      title: true,
      content: true,
      bookId: true
    },
    take: 10
  })

  const results: SearchResult[] = []

  books.forEach(book => {
    results.push({
      id: book.id,
      type: 'book',
      title: book.title,
    })
  })

  documents.forEach(doc => {
    // Generate snippet
    let snippet = ""
    if (doc.content) {
      // Find the position of the query in the content (strip HTML first, or just raw search since it might be simple)
      const cleanContent = doc.content.replace(/<[^>]*>?/gm, '') // basic HTML strip
      const lowerContent = cleanContent.toLowerCase()
      const lowerQuery = query.toLowerCase()
      const index = lowerContent.indexOf(lowerQuery)
      
      if (index !== -1) {
        const start = Math.max(0, index - 30)
        const end = Math.min(cleanContent.length, index + query.length + 30)
        snippet = (start > 0 ? "..." : "") + cleanContent.substring(start, end) + (end < cleanContent.length ? "..." : "")
      }
    }

    results.push({
      id: doc.id,
      type: 'document',
      title: doc.title,
      bookId: doc.bookId || undefined,
      snippet: snippet || undefined
    })
  })

  return results
}

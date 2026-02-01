import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { NewsFeed } from '@/lib/types-news'

/**
 * GET /api/news
 * 
 * Liefert die News aus der news-feed.json Datei.
 * Wenn die Datei nicht existiert oder leer ist, wird ein leerer Feed zurückgegeben.
 */
export async function GET() {
  try {
    const newsFilePath = join(process.cwd(), 'public', 'data', 'news-feed.json')
    
    // Prüfe ob Datei existiert
    if (!existsSync(newsFilePath)) {
      console.log('📰 News feed file does not exist yet')
      return NextResponse.json({
        last_updated: new Date().toISOString(),
        total_news: 0,
        news: [],
        message: 'News feed is empty. Run scripts/generate-news-feed.mjs to generate news.'
      } satisfies NewsFeed & { message: string })
    }
    
    // Lade und parse die Datei
    const fileContent = readFileSync(newsFilePath, 'utf8')
    
    // Prüfe ob Datei leer ist
    if (!fileContent || fileContent.trim() === '') {
      console.log('📰 News feed file is empty')
      return NextResponse.json({
        last_updated: new Date().toISOString(),
        total_news: 0,
        news: [],
        message: 'News feed is empty. Run scripts/generate-news-feed.mjs to generate news.'
      } satisfies NewsFeed & { message: string })
    }
    
    const newsFeed: NewsFeed = JSON.parse(fileContent)
    
    // Sortiere nach Datum (neueste zuerst)
    newsFeed.news.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    
    console.log(`📰 Loaded ${newsFeed.total_news} news items`)
    
    return NextResponse.json(newsFeed)
    
  } catch (error) {
    console.error('❌ Error loading news feed:', error)
    
    return NextResponse.json({
      last_updated: new Date().toISOString(),
      total_news: 0,
      news: [],
      error: error instanceof Error ? error.message : 'Unknown error loading news feed'
    }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import * as cheerio from 'cheerio';

// Create Supabase client for server-side operations
function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// Function to scrape a website
async function scrapeWebsite(url: string, selectors: any, settings: any) {
  try {
    // Add delay to be respectful to the target website
    await new Promise(resolve => setTimeout(resolve, settings.delay || 1000));

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results: any[] = [];

    // If container selector is provided, iterate through containers
    if (selectors.container) {
      $(selectors.container).each((_index: number, element: any) => {
        const item: any = {};
        
        // Extract data using selectors relative to the container
        if (selectors.title) {
          item.title = $(element).find(selectors.title).text().trim() || 
                      $(element).find(selectors.title).attr('title')?.trim() || '';
        }
        
        if (selectors.price) {
          item.price = $(element).find(selectors.price).text().trim();
        }
        
        if (selectors.description) {
          item.description = $(element).find(selectors.description).text().trim();
        }
        
        if (selectors.image && settings.includeImages) {
          const imgSrc = $(element).find(selectors.image).attr('src') || 
                        $(element).find(selectors.image).attr('data-src') ||
                        $(element).find('img').first().attr('src');
          item.image = imgSrc;
        }

        // Add item URL if available
        const link = $(element).find('a').first().attr('href');
        if (link) {
          item.url = link.startsWith('http') ? link : new URL(link, url).href;
        }

        // Only add if we got some data
        if (Object.keys(item).length > 0) {
          results.push(item);
        }
      });
    } else {
      // If no container, extract data from the whole page
      const item: any = {};
      
      if (selectors.title) {
        item.title = $(selectors.title).first().text().trim();
      }
      
      if (selectors.price) {
        item.price = $(selectors.price).first().text().trim();
      }
      
      if (selectors.description) {
        item.description = $(selectors.description).first().text().trim();
      }
      
      if (selectors.image && settings.includeImages) {
        item.image = $(selectors.image).first().attr('src');
      }

      if (Object.keys(item).length > 0) {
        results.push(item);
      }
    }

    return {
      success: true,
      data: results,
      count: results.length,
      url: url,
      scrapedAt: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('Scraping error:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0,
      url: url
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServer();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await request.json();
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Get the job details
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Update job status to running
    await supabase
      .from('scraping_jobs')
      .update({ 
        status: 'running',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Perform the scraping
    const scrapingResult = await scrapeWebsite(job.url, job.selectors, job.settings);

    if (scrapingResult.success) {
      // Update job with results
      const { error: updateError } = await supabase
        .from('scraping_jobs')
        .update({
          status: 'completed',
          data: scrapingResult.data,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      // Save detailed results
      await supabase
        .from('scraping_results')
        .insert({
          job_id: jobId,
          user_id: user.id,
          data: scrapingResult.data,
          row_count: scrapingResult.count
        });

      if (updateError) {
        console.error('Error updating job:', updateError);
      }

      return NextResponse.json({
        success: true,
        message: 'Scraping completed successfully',
        data: scrapingResult.data,
        count: scrapingResult.count
      });

    } else {
      // Update job status to failed
      await supabase
        .from('scraping_jobs')
        .update({
          status: 'failed',
          data: { error: scrapingResult.error },
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      return NextResponse.json({
        success: false,
        error: scrapingResult.error
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

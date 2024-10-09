import { NextResponse } from 'next/server';
import { env } from '~/env';
import { getRssFeed } from '~/services/feedService';
import { Quality } from '~/types';

const GET = async (request: Request, { params }: { params: { sourceId: string } }) => {
  try {
    const { sourceId } = params;

    const hostname = request.headers.get('host') ?? '';

    const { searchParams } = new URL(request.url);
    const quality = parseInt(searchParams.get('quality') ?? '') || Quality.Default;
    const videoServer = searchParams.get('videoServer') ?? undefined;
    const excludeShorts = searchParams.get('excludeShorts') !== null;

    if (env.NEXT_PUBLIC_VIDEO_SERVER_ONLY && !videoServer) {
      return new NextResponse(
        `The 'videoServer' parameter is missing. This application is no longer supported without the use of YouTubeCast Video Server. Please see https://github.com/trevorsharp/youtubecast-videoserver/blob/main/setup.md for more information.`,
        { status: 404 },
      );
    }

    const rssFeed = await getRssFeed(sourceId, hostname, quality, excludeShorts, videoServer);

    return new NextResponse(rssFeed, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 's-maxage=1800' },
    });
  } catch (error) {
    if (typeof error === 'string' && error.toLowerCase().includes('not found'))
      return new NextResponse(error, { status: 404 });

    console.error(error);

    return new NextResponse(typeof error === 'string' ? error : 'Unexpected Error', {
      status: 500,
    });
  }
};

export { GET };
export const fetchCache = 'default-no-store';

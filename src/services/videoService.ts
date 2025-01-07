import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';
import { Quality } from '~/types';

const getStream = async (videoId: string, quality: Quality): Promise<string> => {
  const videoUrl = await getVideoUrl(videoId, quality);

  if (!videoUrl) throw `Video not found with id ${videoId}`;

  return videoUrl;
};
const agent = ytdl.createAgent(
  JSON.parse(fs.readFileSync(path.join(process.cwd(), 'cookies.json')).toString()) as ytdl.Cookie[],
);
const getVideoUrl = async (videoId: string, quality: Quality) => {
  const videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`, { agent });

  const formats = videoInfo.formats
    .filter(
      (format) =>
        format.hasAudio &&
        format.container === 'mp4' &&
        (!format.hasVideo || format.videoCodec?.includes('avc')),
    )
    .sort((a, b) => (b.audioBitrate ?? 0) - (a.audioBitrate ?? 0))
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  switch (quality) {
    case Quality.Audio:
      return formats.find((format) => !format.hasVideo)?.url;
    case Quality.P360:
      return formats.find((format) => format.qualityLabel === '360p')?.url;
    default:
      return formats.find((format) => format.hasVideo)?.url;
  }
};

export { getStream };

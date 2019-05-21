# Subtitle text-to-speech

It's currently more of a hack than anything serious but I felt it was worth [mentionning](https://twitter.com/RoLLodeQc/status/1130633457976193025) and putting out there.

Basically, it takes an `.srt` subtitles file and outputs a bunch of `.mp3` files, one for each phrase. Then it plays the audio files in sync with the movie if you manually start both together.

It's hardcoded to use `Google TTS` for text-to-speech, `play` from `sox` to play the audio files and `notify-send` to output notifications on the desktop. See the source code `r.js` for all the FIXME and TODO comments. Note that it's only 87 lines of JavaScript.

If you don't have the subtitles in a separate file but they're embedded with the movie, you might be able to extract them with:

```sh
ffmpeg -txt_format text -i movie.mkv out.srt
```

To use, simply launch `node r.js` as you simultaneously launch your own video player. The two processes aren't linked and there's no support for pause, rewind or other luxuries.

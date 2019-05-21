'use strict'

// TODO: make it a web app (client-side js)
// TODO: play, pause, rewind...

// core
const fs = require('fs')
const child_process = require('child_process')

// npm
const gTTS = require("gtts.js").gTTS;
const pMap = require('p-map')
const delay = require('delay')

// FIXME: make it configurable
const NOTIF_ONLY = false

const start = Date.now()

// let lastplay

const hms2ts = (hms) => {
  const [h, m, sd] = hms.split(':')
  const [s, ms] = sd.split(',')
  return parseInt(h, 10) * 3600000 + parseInt(m, 10) * 60000 + parseInt(s, 10) * 1000 + parseInt(ms, 10)
}

const pp = (c) => {
  const [n, t, ...linesB] = c.split('\n')
  const [s, e] = t.split(' --> ')
  let lines = linesB.map((s) => s.trim())
  // FIXME: support 3 lines or more
  if (lines.length > 2) throw new Error('Too many lines!')
  if ((lines.length === 2) && (lines[1][0] !== '-')) lines = [lines.join(' ')]
  /*
  // TODO: strip first "-" ?
  lines = lines.map((a) => {
    if (a[0] !== '-') return a
    return a.slice(1)
  })
  */
  return { n: parseInt(n, 10), s, e, lines }
}

// FIXME: extract srt from movie and/or let user specify file name
const fc = fs.readFileSync('out.srt', 'utf-8').split("\n\n").filter(Boolean).map(pp).filter(Boolean)

// FIXME: long term, map voices to speakers
const voices = ['en-au', 'en-us', 'en-uk']
let vid = 0

const save = ({s, ts, i, l}) => {
  const fn = `rep-${i}-${l}.mp3`
  const str = fc[i].lines[l]
  vid = (vid + 1) % voices.length
  // FIXME: sometimes the audios overlap
  const to = ts - (Date.now() - start) + l * 2000
  console.error('Doing', i, fc.length, s)
  setTimeout(() => {
    console.error('PLAY', s, fn, str)
    // TODO: desktop notification
    child_process.exec(`notify-send --expire-time=5000 --urgency=critical -- "${str}"`)
    // FIXME: make mp3 player configurable
    if (!NOTIF_ONLY) child_process.exec(`play ${fn}`)
  }, to)
  if (NOTIF_ONLY) return Promise.resolve()
  if (fs.existsSync(fn)) return Promise.resolve()
  return delay(300)
    // TODO: don't request the same phrases more than once
    // FIXME: some responses are empty (0 size)
    // FIXME: make tts configurable
    .then(() => new gTTS(str, voices[vid]).save(fn))
}

const sites = []
fc.forEach(({s, lines: [a, b]}, i) => {
  const ts = hms2ts(s)
  sites.push({ s, ts, i, l: 0 })
  if (b) sites.push({ s, ts, i, l: 1 })
})

pMap(sites, save, { concurrency: NOTIF_ONLY ? 50 : 3 })
  .then((results) => {
    console.log('DONE', results.length)
  })
  .catch(console.error)

